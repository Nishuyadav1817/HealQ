const cron = require('node-cron');
const Appointment = require('../modules/appointments/appointments.model');
const Queue = require('../modules/queue/queue.model');
const Notification = require('../modules/notifications/notifications.model');
const QueueService = require('../modules/queue/queue.service');
const { normalizeDateOnly, getHospitalNow } = require('../utils/datetime.util');
const { APPOINTMENT_STATUS, QUEUE_ENTRY_STATUS, NOTIFICATION_TYPE, NOTIFICATION_CHANNEL, DELIVERY_STATUS } = require('../constants/enums');
const withTransaction = require('../utils/withTransaction.util');
const { getIO } = require('../sockets/socket');

const config = require('../config/env');

/**
 * Appointment Expiration Job
 *
 * Runs every 30 minutes to find appointments that have passed their
 * consultation window and automatically mark them as expired.
 *
 * Business logic:
 * 1. Find all appointments for "today" with status CONFIRMED or CHECKED_IN
 * 2. For each appointment, check if the doctor's end time has passed
 *    (plus a configured buffer to account for wait time)
 * 3. If past: mark appointment as EXPIRED, remove from queue, notify patient
 *
 * This runs on the server — it doesn't rely on client-side code.
 */
class AppointmentExpirationJob {
  static startJob() {
    // Run every 30 minutes
    const task = cron.schedule('*/30 * * * *', () => {
      this.executeExpiration();
    });

    if (config.env === 'development') {
      console.log('[jobs] Appointment expiration job scheduled to run every 30 minutes');
    }

    return task;
  }

  static async executeExpiration() {
    try {
      const now = getHospitalNow();
      const today = normalizeDateOnly(now);

      // Find appointments for today that are still CONFIRMED or CHECKED_IN
      // (not already completed, cancelled, or no-show)
      const appointments = await Appointment.find({
        appointmentDate: today,
        status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CHECKED_IN] },
      }).populate([
        { path: 'doctor', select: 'availability user', populate: { path: 'user', select: 'fullName' } },
        { path: 'patient', select: 'email' },
      ]);

      if (appointments.length === 0) {
        return;
      }

      const expiredAppointments = [];

      // Check each appointment to see if it has passed its consultation window
      for (const appointment of appointments) {
        if (this.isAppointmentExpired(appointment, now)) {
          expiredAppointments.push(appointment);
        }
      }

      if (expiredAppointments.length === 0) {
        return;
      }

      // Process each expired appointment in a transaction
      for (const appointment of expiredAppointments) {
        await this.expireAppointment(appointment);
      }

      if (config.env === 'development') {
        console.log(`[jobs] Expired ${expiredAppointments.length} appointments at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error('[jobs] Error in appointment expiration job:', err);
    }
  }

  /**
   * Determines if an appointment has passed its consultation window.
   * Logic: check if current time is past doctor's end time + buffer.
   */
  static isAppointmentExpired(appointment, now) {
    if (!appointment.doctor || !appointment.timeSlot) {
      return false;
    }

    // Get the day-schedule for this appointment's date
    const weekday = new Date(appointment.appointmentDate).toLocaleString('en-US', {
      weekday: 'lowercase',
    });

    const daySchedule = appointment.doctor.availability.find((a) => a.day === weekday);
    if (!daySchedule) {
      return false; // Doctor doesn't have a schedule for this day
    }

    // Doctor's end time + buffer (e.g., 30 min) = final cutoff
    const bufferMinutes = 30; // TODO: move to config
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    const endDate = new Date(appointment.appointmentDate);
    endDate.setHours(endHour, endMin + bufferMinutes, 0, 0);

    return now > endDate;
  }

  /**
   * Marks an appointment as expired, removes from queue,
   * and notifies the patient.
   */
  static async expireAppointment(appointment) {
    return withTransaction(async (session) => {
      // 1. Update appointment status to EXPIRED
      appointment.status = APPOINTMENT_STATUS.CANCELLED; // or use 'expired' if added to enum
      appointment.cancelledBy = null; // system cancellation
      appointment.cancellationReason = 'Appointment expired: consultation window closed';
      await appointment.save({ session });

      // 2. Remove from queue (mark entry as SKIPPED)
      await Queue.updateOne(
        { doctor: appointment.doctor, date: appointment.appointmentDate },
        { $set: { 'entries.$[elem].status': QUEUE_ENTRY_STATUS.SKIPPED } },
        { arrayFilters: [{ 'elem.appointment': appointment._id }], session }
      );

      // 3. Recalculate queue for remaining patients
      await QueueService.recalculateQueue(appointment.doctor, appointment.appointmentDate, session);

      // 4. Create notification for patient
      const notification = await Notification.create(
        [
          {
            recipient: appointment.patient._id,
            type: NOTIFICATION_TYPE.APPOINTMENT_CANCELLED,
            title: 'Appointment Expired',
            message: `Your appointment with Dr. ${appointment.doctor.user.fullName} on ${appointment.appointmentDate.toLocaleDateString()} has expired because the consultation window ended before you were consulted.`,
            channel: NOTIFICATION_CHANNEL.IN_APP,
            relatedAppointment: appointment._id,
            deliveryStatus: DELIVERY_STATUS.SENT,
            sentAt: new Date(),
          },
        ],
        { session }
      );

      // 5. Broadcast Socket.IO notification
      const io = getIO();
      if (io) {
        // Notify the patient's personal room
        io.to(`patient:${appointment.patient._id}`).emit('notification:new', {
          type: 'appointment-expired',
          title: 'Appointment Expired',
          message: notification[0].message,
          appointmentId: appointment._id,
        });

        // Notify the queue room (if any staff are watching)
        io.to(`queue:${appointment.doctor}:${appointment.appointmentDate}`).emit('queue:updated', {
          message: 'An appointment has expired and been removed from the queue',
        });
      }
    });
  }
}

module.exports = AppointmentExpirationJob;
