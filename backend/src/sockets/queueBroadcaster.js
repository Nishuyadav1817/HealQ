const Queue = require('../modules/queue/queue.model');
const { getIO } = require('./socket');
const { queueRoom } = require('./rooms.util');

/**
 * Queue Broadcasting Utility
 *
 * Single source for all queue update broadcasts.
 * Called after ANY queue-affecting event to ensure real-time sync.
 * Events:
 * - Patient joins queue
 * - Patient cancels appointment
 * - Admin cancels appointment
 * - Doctor completes consultation
 * - Patient marked absent/no-show
 * - Appointment expires
 * - Doctor marked unavailable
 * - Token advances
 */
class QueueBroadcaster {
  /**
   * Broadcasts updated queue state to all listening staff/patients
   * for a specific doctor/date combination.
   */
  static async broadcastQueueUpdate(doctorId, date) {
    try {
      const queue = await Queue.findOne({ doctor: doctorId, date }).populate([
        { path: 'entries.appointment', select: 'patient status' },
        { path: 'entries.patient', select: 'fullName' },
      ]);

      if (!queue) return;

      const io = getIO();
      const room = queueRoom(doctorId, date);

      // Broadcast to all staff viewing this queue
      io.to(room).emit('queue:updated', {
        queue: {
          _id: queue._id,
          doctor: queue.doctor,
          date: queue.date,
          currentTokenNumber: queue.currentTokenNumber,
          totalTokensIssued: queue.totalTokensIssued,
          status: queue.status,
          averageConsultationMinutes: queue.averageConsultationMinutes,
          entries: queue.entries.map((e) => ({
            _id: e._id,
            appointment: e.appointment._id,
            patient: e.patient._id,
            tokenNumber: e.tokenNumber,
            status: e.status,
            queuePosition: e.queuePosition,
            estimatedWaitingMinutes: e.estimatedWaitingMinutes,
            estimatedReportingTime: e.estimatedReportingTime,
          })),
        },
        timestamp: new Date(),
      });

      // Broadcast individual patient updates (each patient's personal room)
      for (const entry of queue.entries) {
        if (entry.status === 'waiting') {
          io.to(`patient:${entry.patient._id}`).emit('queue:position-updated', {
            queuePosition: entry.queuePosition,
            estimatedWaitingMinutes: entry.estimatedWaitingMinutes,
            estimatedReportingTime: entry.estimatedReportingTime,
            currentTokenNumber: queue.currentTokenNumber,
            totalTokensIssued: queue.totalTokensIssued,
            timestamp: new Date(),
          });
        }
      }
    } catch (err) {
      console.error('[socket] Error broadcasting queue update:', err);
    }
  }

  /**
   * Broadcasts when a specific patient is called by the doctor
   */
  static broadcastPatientCalled(patientId, tokenNumber) {
    try {
      const io = getIO();
      io.to(`patient:${patientId}`).emit('queue:patient-called', {
        tokenNumber,
        message: `Token #${tokenNumber} is now being called. Please proceed to the doctor.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[socket] Error broadcasting patient called:', err);
    }
  }

  /**
   * Broadcasts when doctor updates ETA/consultation time
   */
  static broadcastEstimateUpdate(doctorId, date, averageMinutes) {
    try {
      const io = getIO();
      const room = queueRoom(doctorId, date);
      io.to(room).emit('queue:estimate-updated', {
        averageConsultationMinutes: averageMinutes,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[socket] Error broadcasting estimate update:', err);
    }
  }
}

module.exports = QueueBroadcaster;
