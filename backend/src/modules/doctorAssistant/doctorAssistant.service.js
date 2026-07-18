const Doctor = require('../doctors/doctors.model');
const Appointment = require('../appointments/appointments.model');
const Queue = require('../queue/queue.model');
const QueueService = require('../queue/queue.service');
const ApiError = require('../../errors/ApiError');
const withTransaction = require('../../utils/withTransaction.util');
const { normalizeDateOnly, getHospitalNow } = require('../../utils/datetime.util');
const {
  notifyPatientCalled,
  broadcastQueueUpdate,
  broadcastQueueRecalculation,
} = require('../../sockets/socketEmitter');
const { APPOINTMENT_STATUS, QUEUE_ENTRY_STATUS } = require('../../constants/enums');

/**
 * Confirms the doctor exists, is active, belongs to the SAME hospital as
 * the requesting Doctor Assistant, AND — if this assistant has been
 * scoped to one specific doctor via `assignedDoctor` (see
 * staff.service.js) — that this IS that doctor. An assistant may only
 * operate on queues within their own hospital, narrowed further to their
 * one assigned doctor when set. This is PANEL-2-SPECIFIC access control,
 * which is why it lives here rather than in QueueService.
 */
const resolveDoctorAndDate = async (
  doctorId,
  dateInput,
  requesterHospitalId,
  requesterAssignedDoctorId
) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isActive: true });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found or inactive.');
  }
  if (!requesterHospitalId || doctor.hospital.toString() !== requesterHospitalId.toString()) {
    throw new ApiError(403, "You are not authorized to manage this doctor's queue.");
  }
  if (requesterAssignedDoctorId && doctor._id.toString() !== requesterAssignedDoctorId.toString()) {
    throw new ApiError(403, "You are only authorized to manage your assigned doctor's queue.");
  }

  const normalizedDate = normalizeDateOnly(dateInput || getHospitalNow());
  return { doctor, normalizedDate };
};

const loadAppointmentAndQueue = async (
  appointmentId,
  requesterHospitalId,
  requesterAssignedDoctorId
) => {
  const appointment = await Appointment.findById(appointmentId).populate('doctor', 'hospital');
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  if (
    !requesterHospitalId ||
    appointment.doctor.hospital.toString() !== requesterHospitalId.toString()
  ) {
    throw new ApiError(403, 'This appointment does not belong to your hospital.');
  }
  if (
    requesterAssignedDoctorId &&
    appointment.doctor._id.toString() !== requesterAssignedDoctorId.toString()
  ) {
    throw new ApiError(403, "You are only authorized to manage your assigned doctor's queue.");
  }

  const queue = await Queue.findOne({
    doctor: appointment.doctor._id,
    date: appointment.appointmentDate,
  });
  if (!queue) {
    throw new ApiError(404, 'Queue not found for this appointment.');
  }

  return { appointment, queue };
};

// ---------------------------------------------------------------------
// 1. View Queue
// ---------------------------------------------------------------------
const getQueue = async (doctorId, dateInput, requesterHospitalId, requesterAssignedDoctorId) => {
  const { doctor, normalizedDate } = await resolveDoctorAndDate(
    doctorId,
    dateInput,
    requesterHospitalId,
    requesterAssignedDoctorId
  );

  const queue = await Queue.findOne({ doctor: doctor._id, date: normalizedDate })
    .populate('entries.patient', 'fullName phone')
    .populate('entries.appointment', 'bookingNumber tokenNumber status isInDoctorQueue reasonForVisit symptoms');

  if (!queue) {
    return {
      queueStatus: 'active',
      currentTokenNumber: 0,
      totalTokensIssued: 0,
      averageConsultationMinutes: null,
      currentPatient: null,
      waitingList: [],
    };
  }

  // Only entries Reception has explicitly released are shown as callable
  // context — a patient who hasn't been released isn't "in the room" yet.
  const releasedEntries = queue.entries.filter((e) => e.appointment?.isInDoctorQueue);

  const currentPatient =
    releasedEntries.find((e) =>
      [QUEUE_ENTRY_STATUS.CALLED, QUEUE_ENTRY_STATUS.IN_CONSULTATION].includes(e.status)
    ) || null;

  // queuePosition/estimatedReportingTime/estimatedWaitingMinutes are read
  // straight off the persisted entry — computed and kept fresh by
  // QueueService.recalculateQueue, not recomputed here.
  const waitingList = releasedEntries
    .filter((e) => e.status === QUEUE_ENTRY_STATUS.WAITING)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  return {
    queueStatus: queue.status,
    currentTokenNumber: queue.currentTokenNumber,
    totalTokensIssued: queue.totalTokensIssued,
    averageConsultationMinutes: queue.averageConsultationMinutes,
    currentPatient,
    waitingList,
  };
};

// ---------------------------------------------------------------------
// 2. Call Next Patient
// ---------------------------------------------------------------------
const callNextPatient = async (doctorId, dateInput, requesterHospitalId, requesterAssignedDoctorId) => {
  const { doctor, normalizedDate } = await resolveDoctorAndDate(
    doctorId,
    dateInput,
    requesterHospitalId,
    requesterAssignedDoctorId
  );

  const queue = await Queue.findOne({ doctor: doctor._id, date: normalizedDate });
  if (!queue) {
    throw new ApiError(404, 'No queue exists yet for this doctor on this date.');
  }

  const calledEntry = await QueueService.callNext(queue);
  await queue.save();

  // The called entry leaves the WAITING pool (waiting -> called), so
  // everyone still behind them moves up one position — recalculate before
  // broadcasting, same as every other event that changes queue composition.
  const recalculatedQueue = await QueueService.recalculateQueue(doctor._id, normalizedDate);

  // Two distinct events, deliberately: a personal notification to the ONE
  // patient being called, and a shared broadcast to everyone else still
  // watching this queue. Different rooms, different audiences — not a
  // duplicate of each other.
  notifyPatientCalled({
    patientId: calledEntry.patient,
    appointmentId: calledEntry.appointment,
    tokenNumber: calledEntry.tokenNumber,
  });
  broadcastQueueRecalculation({
    doctorId: doctor._id,
    date: normalizedDate,
    queue: recalculatedQueue,
  });

  return { calledEntry, queue: recalculatedQueue || queue };
};

// ---------------------------------------------------------------------
// 3. Start Consultation
// ---------------------------------------------------------------------
const startConsultation = async (appointmentId, requesterHospitalId, requesterAssignedDoctorId) => {
  const { appointment, queue } = await loadAppointmentAndQueue(
    appointmentId,
    requesterHospitalId,
    requesterAssignedDoctorId
  );
  const entry = QueueService.findEntry(queue, appointmentId);

  if (appointment.status !== APPOINTMENT_STATUS.CHECKED_IN) {
    throw new ApiError(400, `Cannot start consultation — appointment status is "${appointment.status}".`);
  }

  QueueService.startConsultation(entry); // mutates entry in place, throws on invalid transition

  return withTransaction(async (session) => {
    await queue.save({ session });
    appointment.status = APPOINTMENT_STATUS.IN_CONSULTATION;
    await appointment.save({ session });
    return { appointment, entry };
  });
};

// ---------------------------------------------------------------------
// 4. Complete Consultation
// ---------------------------------------------------------------------
const completeConsultation = async (appointmentId, requesterHospitalId, requesterAssignedDoctorId) => {
  const { appointment, queue } = await loadAppointmentAndQueue(
    appointmentId,
    requesterHospitalId,
    requesterAssignedDoctorId
  );
  const entry = QueueService.findEntry(queue, appointmentId);
  const doctorId = appointment.doctor._id || appointment.doctor;

  const { actualMinutes } = QueueService.completeConsultation(queue, entry);

  const result = await withTransaction(async (session) => {
    await queue.save({ session });

    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save({ session });

    // THE required behavior: recalculate every remaining waiting
    // patient's position/ETA/wait-time now that one fewer person is
    // ahead of them and the average consultation time has just adjusted.
    const recalculatedQueue = await QueueService.recalculateQueue(
      doctorId,
      appointment.appointmentDate,
      session
    );

    return { appointment, entry, actualMinutes, recalculatedQueue };
  });

  // Broadcast only AFTER the transaction has committed — never from
  // inside the callback, where a later error in the same transaction
  // could still roll back the very change we just announced.
  broadcastQueueRecalculation({
    doctorId,
    date: appointment.appointmentDate,
    queue: result.recalculatedQueue,
  });

  return {
    appointment: result.appointment,
    entry: result.entry,
    actualMinutes: result.actualMinutes,
    averageConsultationMinutes: result.recalculatedQueue?.averageConsultationMinutes,
  };
};

// ---------------------------------------------------------------------
// 5. Skip Patient
// ---------------------------------------------------------------------
const skipPatient = async (appointmentId, requesterHospitalId, requesterAssignedDoctorId) => {
  const { appointment, queue } = await loadAppointmentAndQueue(
    appointmentId,
    requesterHospitalId,
    requesterAssignedDoctorId
  );
  const entry = QueueService.findEntry(queue, appointmentId);
  const doctorId = appointment.doctor._id || appointment.doctor;

  QueueService.skipPatient(entry);
  await queue.save();

  // Skipping also removes this patient from the waiting pool — everyone
  // still behind them moves up one position.
  const recalculatedQueue = await QueueService.recalculateQueue(doctorId, appointment.appointmentDate);

  broadcastQueueRecalculation({
    doctorId,
    date: appointment.appointmentDate,
    queue: recalculatedQueue,
  });

  return { entry, queue: recalculatedQueue || queue };
};

// ---------------------------------------------------------------------
// 6. Pause Queue
// ---------------------------------------------------------------------
const pauseQueue = async (doctorId, dateInput, requesterHospitalId, requesterAssignedDoctorId) => {
  const { doctor, normalizedDate } = await resolveDoctorAndDate(
    doctorId,
    dateInput,
    requesterHospitalId,
    requesterAssignedDoctorId
  );

  const queue = await Queue.findOne({ doctor: doctor._id, date: normalizedDate });
  if (!queue) {
    throw new ApiError(404, 'No queue exists yet for this doctor on this date.');
  }

  QueueService.pause(queue);
  await queue.save();

  // Status-only change — nobody's position or ETA moved, so the lighter
  // broadcast (no per-patient ETA push) is the correct one here.
  broadcastQueueUpdate({ doctorId: doctor._id, date: normalizedDate, queue });

  return queue;
};

// ---------------------------------------------------------------------
// 7. Resume Queue
// ---------------------------------------------------------------------
const resumeQueue = async (doctorId, dateInput, requesterHospitalId, requesterAssignedDoctorId) => {
  const { doctor, normalizedDate } = await resolveDoctorAndDate(
    doctorId,
    dateInput,
    requesterHospitalId,
    requesterAssignedDoctorId
  );

  const queue = await Queue.findOne({ doctor: doctor._id, date: normalizedDate });
  if (!queue) {
    throw new ApiError(404, 'No queue exists yet for this doctor on this date.');
  }

  QueueService.resume(queue);
  await queue.save();

  broadcastQueueUpdate({ doctorId: doctor._id, date: normalizedDate, queue });

  return queue;
};

// ---------------------------------------------------------------------
// Bonus: configure average consultation time (satisfies "Average
// consultation time is configurable" as an explicit, settable value —
// not just the automatic per-completion adjustment). Changes every
// remaining patient's ETA, so it gets the full recalculation broadcast.
// ---------------------------------------------------------------------
const setAverageConsultationMinutes = async (
  doctorId,
  dateInput,
  requesterHospitalId,
  minutes,
  requesterAssignedDoctorId
) => {
  const { doctor, normalizedDate } = await resolveDoctorAndDate(
    doctorId,
    dateInput,
    requesterHospitalId,
    requesterAssignedDoctorId
  );

  const recalculatedQueue = await QueueService.setAverageConsultationMinutes(
    doctor._id,
    normalizedDate,
    minutes
  );

  broadcastQueueRecalculation({
    doctorId: doctor._id,
    date: normalizedDate,
    queue: recalculatedQueue,
  });

  return recalculatedQueue;
};

module.exports = {
  getQueue,
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
  pauseQueue,
  resumeQueue,
  setAverageConsultationMinutes,
};
