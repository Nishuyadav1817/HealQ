/**
 * Every route path in the app, in one place. Components navigate via
 * these constants (`navigate(ROUTES.PATIENT.APPOINTMENTS)`), never via a
 * hand-typed string — the same discipline the backend applies to socket
 * event names and room keys, for the same reason: a typo in a scattered
 * string literal fails silently, a typo in an imported constant fails at
 * build/import time.
 */
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',

  PATIENT: Object.freeze({
    ROOT: '/patient',
    CHOOSE_CITY: '/patient/book/city',
    CHOOSE_HOSPITAL: '/patient/book/hospital',
    DOCTORS: '/patient/book/doctors',
    BOOKING: '/patient/book/confirm', // + '/:doctorId'
    BOOKING_SUCCESS: '/patient/book/success', // + '/:appointmentId'
    APPOINTMENTS: '/patient/appointments',
    APPOINTMENT_TRACK: '/patient/appointments', // + '/:id'
    PROFILE: '/patient/profile',
  }),
  RECEPTION: Object.freeze({
    ROOT: '/reception',
  }),
  DOCTOR: Object.freeze({
    ROOT: '/doctor',
  }),
  ADMIN: Object.freeze({
    ROOT: '/admin',
  }),
});
