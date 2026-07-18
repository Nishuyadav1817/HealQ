const { getIO } = require('./socket');
const { patientRoom, queueRoom } = require('./rooms.util');
const SOCKET_EVENTS = require('./socketEvents');
const { QUEUE_ENTRY_STATUS } = require('../constants/enums');

/**
 * Centralized socket emission layer. This is the architectural guardrail
 * against duplicate events: module services (reception, doctorAssistant,
 * patients) NEVER call `getIO().emit(...)` directly — they call exactly
 * one of the named functions below. That guarantees:
 *
 *  1. Each logical event ("a patient was called") has exactly ONE
 *     function that can trigger it — there's no second code path that
 *     could fire the same event again with a slightly different payload
 *     or a mistyped room name.
 *  2. Event names and room-naming conventions are defined once (in
 *     socketEvents.js / rooms.util.js) and simply used here, not
 *     re-typed at every call site.
 *  3. If an event's payload shape ever needs to change, there is exactly
 *     one place to change it.
 */

// ---------------------------------------------------------------------
// Reception verifies patient -> Notify Patient
// ---------------------------------------------------------------------
const notifyPatientVerified = ({ patientId, appointmentId, bookingNumber }) => {
  getIO().to(patientRoom(patientId)).emit(SOCKET_EVENTS.PATIENT_VERIFIED, {
    appointmentId,
    bookingNumber,
    message: 'Your identity has been verified at reception.',
    timestamp: new Date(),
  });
};

// ---------------------------------------------------------------------
// Doctor Assistant calls patient -> Notify Patient
// ---------------------------------------------------------------------
const notifyPatientCalled = ({ patientId, appointmentId, tokenNumber }) => {
  getIO().to(patientRoom(patientId)).emit(SOCKET_EVENTS.PATIENT_CALLED, {
    appointmentId,
    tokenNumber,
    message: `It's your turn — Token #${tokenNumber}. Please proceed to the doctor's room.`,
    timestamp: new Date(),
  });
};

// ---------------------------------------------------------------------
// Consultation completes (or a skip/cancellation changes the queue)
// -> Update queue, Update estimated time, Broadcast live updates
// ---------------------------------------------------------------------

/** Doctor/date-scoped snapshot for staff dashboards watching this queue. */
const broadcastQueueUpdate = ({ doctorId, date, queue }) => {
  getIO().to(queueRoom(doctorId, date)).emit(SOCKET_EVENTS.QUEUE_UPDATED, {
    currentTokenNumber: queue.currentTokenNumber,
    totalTokensIssued: queue.totalTokensIssued,
    averageConsultationMinutes: queue.averageConsultationMinutes,
    status: queue.status,
    timestamp: new Date(),
  });
};

/**
 * Pushes each still-waiting patient their OWN freshly recalculated
 * position/ETA/wait-time, straight to their personal room — this is what
 * lets a patient's screen update its estimated reporting time live,
 * without polling the API.
 */
const notifyEtaUpdates = (queue) => {
  const io = getIO();
  queue.entries
    .filter((e) => e.status === QUEUE_ENTRY_STATUS.WAITING && e.queuePosition != null)
    .forEach((entry) => {
      io.to(patientRoom(entry.patient)).emit(SOCKET_EVENTS.PATIENT_ETA_UPDATED, {
        appointmentId: entry.appointment,
        queuePosition: entry.queuePosition,
        estimatedReportingTime: entry.estimatedReportingTime,
        estimatedWaitingMinutes: entry.estimatedWaitingMinutes,
        timestamp: new Date(),
      });
    });
};

/**
 * Single call-site combining both of the above — every place in the
 * codebase that calls QueueService.recalculateQueue() and wants to
 * broadcast the result calls this ONE function afterward, rather than
 * independently remembering to call both broadcastQueueUpdate and
 * notifyEtaUpdates (and risking calling one twice or forgetting the
 * other).
 */
const broadcastQueueRecalculation = ({ doctorId, date, queue }) => {
  if (!queue) return; // recalculateQueue returns null if no queue exists yet
  broadcastQueueUpdate({ doctorId, date, queue });
  notifyEtaUpdates(queue);
};

module.exports = {
  notifyPatientVerified,
  notifyPatientCalled,
  broadcastQueueUpdate,
  notifyEtaUpdates,
  broadcastQueueRecalculation,
};
