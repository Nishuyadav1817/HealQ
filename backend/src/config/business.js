/**
 * Business Logic Configuration
 * Centralized configuration for booking windows, appointment rules,
 * consultation timing, and other business constraints.
 *
 * These constants are used by service layers and should never be
 * hard-coded in controllers or routes.
 */

module.exports = Object.freeze({
  BOOKING: {
    /**
     * Minimum days in advance before a patient can book.
     * E.g., 2 means "can't book for tomorrow, only 2+ days ahead"
     */
    MIN_ADVANCE_DAYS: 0, // Can book starting today

    /**
     * Maximum days in advance a patient can book.
     * E.g., 3 means "can't book more than 3 days from now"
     */
    MAX_ADVANCE_DAYS: 3,
  },

  APPOINTMENT: {
    /**
     * Minutes after a doctor's scheduled end time before an appointment
     * is considered "expired" and auto-cancelled if patient didn't consult.
     * E.g., 30 means "if doctor ends at 6pm, appointment expires at 6:30pm"
     */
    EXPIRY_BUFFER_MINUTES: 30,

    /**
     * Default consultation duration in minutes, used to calculate
     * estimated wait times when a queue doesn't yet have a real average.
     */
    DEFAULT_CONSULTATION_MINUTES: 15,
  },

  QUEUE: {
    /**
     * Exponential moving average weights for updating consultation time
     * estimates as patients complete consultations.
     * RECENT: weight given to the just-completed consultation (0.3 = 30%)
     * HISTORICAL: weight given to the existing average (0.7 = 70%)
     *
     * Higher RECENT = more responsive to today's pace
     * Higher HISTORICAL = more stable across outliers
     *
     * Together they must sum to 1.0.
     */
    MOVING_AVERAGE_WEIGHT_RECENT: 0.3,
    MOVING_AVERAGE_WEIGHT_HISTORICAL: 0.7,
  },
});
