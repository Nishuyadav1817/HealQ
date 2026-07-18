const Hospital = require('../hospitals/hospitals.model');
const Department = require('../departments/departments.model');
const Doctor = require('../doctors/doctors.model');
const Appointment = require('../appointments/appointments.model');
const Queue = require('../queue/queue.model');
const QueueService = require('../queue/queue.service');
const ApiError = require('../../errors/ApiError');
const ApiFeatures = require('../../utils/apiFeatures.util');
const withTransaction = require('../../utils/withTransaction.util');
const { normalizeDateOnly, getWeekdayName, getHospitalNow } = require('../../utils/datetime.util');
const {
  APPOINTMENT_STATUS,
  CONSULTATION_TYPE,
  QUEUE_ENTRY_STATUS,
} = require('../../constants/enums');

const MAX_BOOKING_ADVANCE_DAYS = 90;

const APPOINTMENT_POPULATE = [
  { path: 'doctor', select: 'specialization consultationFee user', populate: { path: 'user', select: 'fullName' } },
  { path: 'hospital', select: 'name address.line1 contact.phone' },
  { path: 'department', select: 'name' },
];

/**
 * Loads and validates hospital → department → doctor as a consistent
 * chain (each must be active AND actually belong to the one above it).
 * This is PATIENT-MODULE orchestration — it has nothing to do with queue
 * mechanics, which is why it lives here and not in QueueService.
 */
const loadAndValidateChain = async (hospitalId, departmentId, doctorId) => {
  const [hospital, department, doctor] = await Promise.all([
    Hospital.findOne({ _id: hospitalId, isActive: true }),
    Department.findOne({ _id: departmentId, isActive: true }),
    Doctor.findOne({ _id: doctorId, isActive: true }).populate('user', 'fullName'),
  ]);

  if (!hospital) throw new ApiError(404, 'Hospital not found or is currently inactive.');
  if (!department) throw new ApiError(404, 'Department not found or is currently inactive.');
  if (!doctor) throw new ApiError(404, 'Doctor not found or is currently inactive.');

  if (department.hospital.toString() !== hospitalId) {
    throw new ApiError(400, 'Selected department does not belong to the selected hospital.');
  }
  if (doctor.hospital.toString() !== hospitalId || doctor.department.toString() !== departmentId) {
    throw new ApiError(400, 'Selected doctor does not belong to the selected hospital/department.');
  }

  return { hospital, department, doctor };
};

/**
 * Orchestrates a booking: validates the patient-facing chain, then
 * delegates every actual queue-mechanics decision (token number, slot
 * time, booking number, queue entry creation, and this patient's own
 * ETA) to QueueService — the single source of truth for that logic.
 */
const bookAppointment = async (patientId, payload) => {
  const { hospital, department, doctor, appointmentDate, reasonForVisit, symptoms } = payload;

  const chain = await loadAndValidateChain(hospital, department, doctor);

  const normalizedDate = normalizeDateOnly(appointmentDate);
  const today = normalizeDateOnly(getHospitalNow());

  if (normalizedDate < today) {
    throw new ApiError(400, 'Cannot book an appointment for a past date.');
  }

  const maxAdvanceDate = new Date(today);
  maxAdvanceDate.setUTCDate(maxAdvanceDate.getUTCDate() + MAX_BOOKING_ADVANCE_DAYS);
  if (normalizedDate > maxAdvanceDate) {
    throw new ApiError(400, `Appointments can only be booked up to ${MAX_BOOKING_ADVANCE_DAYS} days in advance.`);
  }

  const weekday = getWeekdayName(normalizedDate);
  const daySchedule = chain.doctor.availability.find((slot) => slot.day === weekday);
  if (!daySchedule) {
    throw new ApiError(400, `Dr. ${chain.doctor.user?.fullName ?? 'this doctor'} is not available on ${weekday}s.`);
  }

  const isToday = normalizedDate.getTime() === today.getTime();
  if (isToday && !chain.doctor.isAvailableToday) {
    throw new ApiError(400, 'This doctor is unavailable today. Please choose another date.');
  }

  // --- From here on, every decision is delegated to QueueService ---
  const tokenNumber = await QueueService.getNextTokenNumber(chain.doctor._id, normalizedDate);

  if (tokenNumber > daySchedule.maxPatients) {
    throw new ApiError(409, 'All slots for this doctor on the selected date are fully booked.');
  }

  const timeSlot = QueueService.computeScheduledSlot(daySchedule, tokenNumber, normalizedDate);
  const bookingNumber = QueueService.generateBookingNumber(chain.doctor._id, normalizedDate, tokenNumber);

  let appointmentId;

  try {
    await withTransaction(async (session) => {
      const [createdAppointment] = await Appointment.create(
        [
          {
            patient: patientId,
            doctor: chain.doctor._id,
            hospital: chain.hospital._id,
            department: chain.department._id,
            appointmentDate: normalizedDate,
            timeSlot,
            tokenNumber,
            bookingNumber,
            status: APPOINTMENT_STATUS.CONFIRMED,
            consultationType: CONSULTATION_TYPE.ONLINE_BOOKING,
            reasonForVisit,
            symptoms,
            createdBy: patientId,
          },
        ],
        { session }
      );
      appointmentId = createdAppointment._id;

      await QueueService.addEntry(
        {
          hospitalId: chain.hospital._id,
          departmentId: chain.department._id,
          doctorId: chain.doctor._id,
          date: normalizedDate,
          appointmentId,
          patientId,
          tokenNumber,
          averageConsultationMinutes: daySchedule.slotDurationMinutes,
        },
        session
      );

      // Recalculating immediately after adding the entry computes THIS
      // patient's own queuePosition/ETA through the exact same code path
      // used for every subsequent recalculation — one formula, no drift.
      await QueueService.recalculateQueue(chain.doctor._id, normalizedDate, session);
    });
  } catch (err) {
    if (err.code === 11000) {
      // Two requests raced for the same token — the unique
      // {doctor, appointmentDate, tokenNumber} index caught it.
      throw new ApiError(409, 'This slot was just booked by someone else. Please try again.');
    }
    throw err;
  }

  const appointment = await Appointment.findById(appointmentId).populate(APPOINTMENT_POPULATE);
  const queue = await Queue.findOne({
    doctor: chain.doctor._id,
    date: normalizedDate,
  });
  const myEntry = queue.entries.find((e) => e.appointment.toString() === appointmentId.toString());

  return {
    appointment,
    bookingNumber,
    queueNumber: tokenNumber,
    estimatedReportingTime: myEntry.estimatedReportingTime,
    queueStatus: {
      currentlyServingToken: queue.currentTokenNumber,
      totalTokensIssued: queue.totalTokensIssued,
      queuePosition: myEntry.queuePosition,
      estimatedWaitingMinutes: myEntry.estimatedWaitingMinutes,
    },
  };
};

const getMyAppointments = async (patientId, queryString) => {
  const query = { ...queryString, patient: patientId };

  const features = new ApiFeatures(Appointment.find().populate(APPOINTMENT_POPULATE), query)
    .filter(['patient', 'status', 'hospital', 'doctor'])
    .sort()
    .paginate();

  const [appointments, total] = await Promise.all([
    features.query,
    Appointment.countDocuments(features.filterQuery),
  ]);

  return { appointments, total, pagination: features.pagination };
};

const getMyAppointmentById = async (patientId, appointmentId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  }).populate(APPOINTMENT_POPULATE);

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  return appointment;
};

/**
 * Cancels the patient's own appointment. Marks the matching Queue entry
 * as 'skipped' (removing it from the waiting pool) and delegates to
 * QueueService to recalculate every remaining patient's position/ETA,
 * since one fewer person ahead of them changes their numbers too.
 */
const cancelMyAppointment = async (patientId, appointmentId, cancellationReason) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, patient: patientId });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new ApiError(400, 'This appointment is already cancelled.');
  }
  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new ApiError(400, 'Cannot cancel a completed appointment.');
  }
  if (normalizeDateOnly(appointment.appointmentDate) < normalizeDateOnly(getHospitalNow())) {
    throw new ApiError(400, 'Cannot cancel a past appointment.');
  }

  return withTransaction(async (session) => {
    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    appointment.cancelledBy = patientId;
    appointment.cancellationReason = cancellationReason || null;
    await appointment.save({ session });

    await Queue.updateOne(
      { doctor: appointment.doctor, date: appointment.appointmentDate },
      { $set: { 'entries.$[elem].status': QUEUE_ENTRY_STATUS.SKIPPED } },
      { arrayFilters: [{ 'elem.appointment': appointment._id }], session }
    );

    await QueueService.recalculateQueue(appointment.doctor, appointment.appointmentDate, session);

    return appointment;
  });
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getMyAppointmentById,
  cancelMyAppointment,
};
