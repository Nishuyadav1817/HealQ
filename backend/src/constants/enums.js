/**
 * Centralized enums used across Mongoose schemas and business logic.
 * Keeping these in one place avoids magic strings scattered across
 * models/services and gives us one place to update when requirements change.
 */

const USER_ROLES = Object.freeze({
  PATIENT: 'patient',
  RECEPTIONIST: 'receptionist',   // Panel 1
  DOCTOR_ASSISTANT: 'doctorAssistant', // Panel 2
  DOCTOR: 'doctor',
  ADMIN: 'admin',
});

const GENDER = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
});

const HOSPITAL_TYPE = Object.freeze({
  GOVERNMENT: 'government',
  PRIVATE: 'private',
  CLINIC: 'clinic',
});

const WEEKDAYS = Object.freeze([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);

const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  IN_CONSULTATION: 'in-consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
});

const CONSULTATION_TYPE = Object.freeze({
  WALK_IN: 'walk-in',
  ONLINE_BOOKING: 'online-booking',
});

const QUEUE_ENTRY_STATUS = Object.freeze({
  WAITING: 'waiting',
  CALLED: 'called',
  IN_CONSULTATION: 'in-consultation',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  NO_SHOW: 'no-show',
});

const QUEUE_STATUS = Object.freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
});

const PAYMENT_METHOD = Object.freeze({
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

const PAYMENT_GATEWAY = Object.freeze({
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  PAYTM: 'paytm',
  CASH_COUNTER: 'cash-counter',
});

const NOTIFICATION_TYPE = Object.freeze({
  APPOINTMENT_REMINDER: 'appointment-reminder',
  QUEUE_UPDATE: 'queue-update',
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  APPOINTMENT_CANCELLED: 'appointment-cancelled',
  APPOINTMENT_CONFIRMED: 'appointment-confirmed',
  GENERAL: 'general',
});

const NOTIFICATION_CHANNEL = Object.freeze({
  IN_APP: 'in-app',
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
});

const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
});

module.exports = {
  USER_ROLES,
  GENDER,
  HOSPITAL_TYPE,
  WEEKDAYS,
  APPOINTMENT_STATUS,
  CONSULTATION_TYPE,
  QUEUE_ENTRY_STATUS,
  QUEUE_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  DELIVERY_STATUS,
};
