/**
 * Every route path in the app, in one place. Components navigate via
 * these constants (`navigate(ROUTE_PATHS.PATIENT.APPOINTMENTS)`), never via a
 * hand-typed string — the same discipline the backend applies to socket
 * event names and room keys, for the same reason: a typo in a scattered
 * string literal fails silently, a typo in an imported constant fails at
 * build/import time.
 */
export const ROUTE_PATHS = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',

  PATIENT: Object.freeze({
    ROOT: '/patient',
    DASHBOARD: '/patient/dashboard',
    CHOOSE_CITY: '/patient/book/city',
    CHOOSE_HOSPITAL: '/patient/book/hospital',
    DOCTORS: '/patient/book/doctors',
    BOOK: '/patient/book',
    BOOKING: '/patient/book/confirm', // + '/:doctorId'
    BOOKING_SUCCESS: '/patient/book/success', // + '/:appointmentId'
    APPOINTMENTS: '/patient/appointments',
    APPOINTMENT_TRACK: '/patient/appointments', // + '/:id'
    PROFILE: '/patient/profile',
    NOTIFICATIONS: '/patient/notifications',
  }),

  RECEPTION: Object.freeze({
    ROOT: '/reception',
    CHECKIN: '/reception/checkin',
    QUEUE: '/reception/queue',
  }),

  DOCTOR: Object.freeze({
    ROOT: '/doctor',
    QUEUE: '/doctor/queue',
  }),

  DOCTOR_ASSISTANT: Object.freeze({
    ROOT: '/doctor-assistant',
    QUEUE: '/doctor-assistant/queue',
    COMPLETED: '/doctor-assistant/completed',
  }),

  ADMIN: Object.freeze({
    ROOT: '/admin',
    OVERVIEW: '/admin',
    APPOINTMENTS: '/admin/appointments',
    DOCTORS: '/admin/doctors',
    HOSPITALS: '/admin/hospitals',
    DEPARTMENTS: '/admin/departments',
    CITIES: '/admin/cities',
    PATIENTS: '/admin/patients',
    ANALYTICS: '/admin/analytics',
  }),
});

// For backward compatibility
export const ROUTES = ROUTE_PATHS;
