import apiClient from '../../../services/apiClient';

/**
 * Thin request wrappers only — no caching/state, same split as
 * features/patient/services/patient.api.js. React Query hooks in
 * ../hooks own caching/loading/error state on top of these.
 */

export const getTodaysAppointments = (params = {}) =>
  apiClient.get('/reception/appointments/today', { params });

// Same public/optionalAuth lookup endpoint the Patient panel uses to show
// a hospital's name (see features/patient/services/patient.api.js) — used
// here only to resolve the reception user's own hospital (`user.hospital`)
// into a display name for the header/dashboard branding. No new backend
// functionality, just a second thin wrapper around an endpoint that
// already exists.
export const getHospitalById = (id) => apiClient.get(`/hospitals/${id}`);

export const searchByBookingNumber = (bookingNumber) =>
  apiClient.get('/reception/appointments/search', { params: { bookingNumber } });

export const verifyPatient = (id, verificationNotes) =>
  apiClient.patch(`/reception/appointments/${id}/verify`, { verificationNotes });

export const collectPayment = (id, { method, amount }) =>
  apiClient.post(`/reception/appointments/${id}/payment`, { method, amount });

export const markArrived = (id) => apiClient.patch(`/reception/appointments/${id}/arrive`);

export const moveToDoctorQueue = (id) => apiClient.patch(`/reception/appointments/${id}/move-to-queue`);

export const updateAppointmentStatus = (id, { status, reason }) =>
  apiClient.patch(`/reception/appointments/${id}/status`, { status, reason });
