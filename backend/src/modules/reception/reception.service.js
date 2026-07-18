const Appointment = require('../appointments/appointments.model');
const Queue = require('../queue/queue.model');
const QueueService = require('../queue/queue.service');
const Payment = require('../payments/payments.model');
const Doctor = require('../doctors/doctors.model');
const ApiError = require('../../errors/ApiError');
const withTransaction = require('../../utils/withTransaction.util');
const { normalizeDateOnly, getHospitalNow } = require('../../utils/datetime.util');
const { notifyPatientVerified, broadcastQueueRecalculation } = require('../../sockets/socketEmitter');
const {
  APPOINTMENT_STATUS,
  QUEUE_ENTRY_STATUS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
} = require('../../constants/enums');

const APPOINTMENT_POPULATE = [
  { path: 'patient', select: 'fullName email phone gender dateOfBirth profileImage' },
  {
    path: 'doctor',
    select: 'specialization consultationFee user',
    populate: { path: 'user', select: 'fullName' },
  },
  { path: 'hospital', select: 'name' },
  { path: 'department', select: 'name' },
  { path: 'payment' },
];

/** Statuses reception can no longer act on — the visit is already over,
 * one way or another. */
const TERMINAL_STATUSES = [
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.NO_SHOW,
];

const findAppointmentOr404 = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId).populate(APPOINTMENT_POPULATE);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  return appointment;
};

/** Updates the single matching entry inside the doctor's live Queue
 * document for this appointment's date — used by every action below that
 * needs to reflect a status change in the waiting-room view. */
const updateQueueEntry = async (appointment, fields, session) => {
  await Queue.updateOne(
    { doctor: appointment.doctor._id || appointment.doctor, date: appointment.appointmentDate },
    {
      $set: Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [`entries.$[elem].${key}`, value])
      ),
    },
    { arrayFilters: [{ 'elem.appointment': appointment._id }], session }
  );
};

// ---------------------------------------------------------------------
// 0. Today's Patients — the dashboard's main board
// ---------------------------------------------------------------------
/**
 * Everything booked for THIS receptionist's hospital, today. Sorted by
 * token number (the order patients are meant to be seen in), not by
 * creation time — a receptionist scanning the board reads it as "who's
 * next", not "who booked most recently".
 */
const getTodaysAppointments = async (hospitalId, { status, search } = {}) => {
  if (!hospitalId) {
    throw new ApiError(400, 'Your account is not assigned to a hospital yet.');
  }

  const filter = {
    hospital: hospitalId,
    appointmentDate: normalizeDateOnly(getHospitalNow()),
  };
  if (status) filter.status = status;
  if (search) filter.bookingNumber = new RegExp(search.trim(), 'i');

  const appointments = await Appointment.find(filter)
    .sort('tokenNumber')
    .populate(APPOINTMENT_POPULATE);

  return appointments;
};

// ---------------------------------------------------------------------
// 1. Search Booking Number
// ---------------------------------------------------------------------
const searchByBookingNumber = async (bookingNumber) => {
  const appointment = await Appointment.findOne({ bookingNumber }).populate(APPOINTMENT_POPULATE);
  if (!appointment) {
    throw new ApiError(404, 'No appointment found with this booking number.');
  }
  return appointment;
};

// ---------------------------------------------------------------------
// 2. Verify Patient
// ---------------------------------------------------------------------
const verifyPatient = async (appointmentId, receptionistId, verificationNotes) => {
  const appointment = await findAppointmentOr404(appointmentId);

  if (TERMINAL_STATUSES.includes(appointment.status)) {
    throw new ApiError(400, `Cannot verify a patient whose appointment is already ${appointment.status}.`);
  }

  appointment.verifiedAt = new Date();
  appointment.verifiedBy = receptionistId;
  appointment.verificationNotes = verificationNotes || null;
  await appointment.save();

  notifyPatientVerified({
    patientId: appointment.patient._id || appointment.patient,
    appointmentId: appointment._id,
    bookingNumber: appointment.bookingNumber,
  });

  return appointment;
};

// ---------------------------------------------------------------------
// 3. Collect Payment
// ---------------------------------------------------------------------
const collectPayment = async (appointmentId, receptionistId, { method, amount }) => {
  const appointment = await findAppointmentOr404(appointmentId);

  if (TERMINAL_STATUSES.includes(appointment.status)) {
    throw new ApiError(400, `Cannot collect payment for an appointment that is already ${appointment.status}.`);
  }

  const existingSuccessfulPayment = await Payment.findOne({
    appointment: appointment._id,
    status: PAYMENT_STATUS.SUCCESS,
  });
  if (existingSuccessfulPayment) {
    throw new ApiError(409, 'Payment has already been collected for this appointment.');
  }

  const doctor = await Doctor.findById(appointment.doctor._id || appointment.doctor);
  const finalAmount = amount !== undefined ? amount : doctor.consultationFee;

  const payment = await Payment.create({
    appointment: appointment._id,
    patient: appointment.patient._id || appointment.patient,
    amount: finalAmount,
    method,
    gateway: PAYMENT_GATEWAY.CASH_COUNTER, // any payment collected in-person at reception
    status: PAYMENT_STATUS.SUCCESS,        // collected immediately, no async gateway callback
    paidAt: new Date(),
    receivedBy: receptionistId,
  });

  appointment.payment = payment._id;
  await appointment.save();

  return { appointment, payment };
};

// ---------------------------------------------------------------------
// 4. Mark Arrived
// ---------------------------------------------------------------------
const markArrived = async (appointmentId) => {
  const appointment = await findAppointmentOr404(appointmentId);

  if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
    throw new ApiError(
      400,
      `Cannot mark arrived — appointment status is already "${appointment.status}".`
    );
  }

  return withTransaction(async (session) => {
    appointment.status = APPOINTMENT_STATUS.CHECKED_IN;
    appointment.arrivedAt = new Date();
    await appointment.save({ session });

    await updateQueueEntry(appointment, { checkedInAt: appointment.arrivedAt }, session);

    return appointment;
  });
};

// ---------------------------------------------------------------------
// 5. Move Patient to Doctor Queue
// ---------------------------------------------------------------------
/**
 * The deliberate gate between "arrived at reception" and "callable by the
 * doctor". A patient can be verified and checked-in while payment is still
 * being sorted out at the counter — they should not appear in the Doctor
 * Assistant's callable queue until reception explicitly releases them,
 * which we require to happen only after payment has been collected.
 */
const moveToDoctorQueue = async (appointmentId) => {
  const appointment = await findAppointmentOr404(appointmentId);

  if (appointment.status !== APPOINTMENT_STATUS.CHECKED_IN) {
    throw new ApiError(400, 'Patient must be marked arrived before moving to the doctor queue.');
  }
  if (appointment.isInDoctorQueue) {
    throw new ApiError(400, 'Patient is already in the doctor queue.');
  }
  if (!appointment.payment) {
    throw new ApiError(400, 'Please collect payment before moving the patient to the doctor queue.');
  }

  return withTransaction(async (session) => {
    appointment.isInDoctorQueue = true;
    await appointment.save({ session });

    // Defensive reset — the entry should already be 'waiting' from
    // booking time, but this guarantees it regardless of prior state.
    await updateQueueEntry(appointment, { status: QUEUE_ENTRY_STATUS.WAITING }, session);

    return appointment;
  });
};

// ---------------------------------------------------------------------
// 6. Update appointment status (Reception-permitted transitions only)
// ---------------------------------------------------------------------
const updateStatus = async (appointmentId, receptionistId, { status, reason }) => {
  const appointment = await findAppointmentOr404(appointmentId);

  if (TERMINAL_STATUSES.includes(appointment.status)) {
    throw new ApiError(400, `Appointment is already ${appointment.status}.`);
  }

  const doctorId = appointment.doctor._id || appointment.doctor;

  const result = await withTransaction(async (session) => {
    appointment.status = status;
    appointment.isInDoctorQueue = false;

    if (status === APPOINTMENT_STATUS.CANCELLED) {
      appointment.cancelledBy = receptionistId;
      appointment.cancellationReason = reason || null;
    }

    await appointment.save({ session });

    const queueEntryStatus =
      status === APPOINTMENT_STATUS.CANCELLED
        ? QUEUE_ENTRY_STATUS.SKIPPED
        : QUEUE_ENTRY_STATUS.NO_SHOW;

    await updateQueueEntry(appointment, { status: queueEntryStatus }, session);

    // Removing this patient from the waiting pool (cancelled or no-show)
    // moves everyone still behind them up one position — same
    // recalculation used everywhere else a patient leaves the queue.
    const recalculatedQueue = await QueueService.recalculateQueue(
      doctorId,
      appointment.appointmentDate,
      session
    );

    return { appointment, recalculatedQueue };
  });

  // Broadcast only AFTER the transaction has actually committed — never
  // from inside the callback above, where a later error in the same
  // transaction could still roll back the very change we just announced.
  broadcastQueueRecalculation({
    doctorId,
    date: appointment.appointmentDate,
    queue: result.recalculatedQueue,
  });

  return result.appointment;
};

module.exports = {
  getTodaysAppointments,
  searchByBookingNumber,
  verifyPatient,
  collectPayment,
  markArrived,
  moveToDoctorQueue,
  updateStatus,
};
