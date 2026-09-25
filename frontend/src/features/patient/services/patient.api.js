import apiClient from '../../../services/apiClient';

/**
 * Thin request wrappers only — no caching, no state. React Query (see
 * the hooks in ../hooks) owns caching/loading/error state on top of
 * these, mirroring how features/auth/services/auth.api.js stays a pure
 * "how to ask the API" layer.
 */

// ---- Lookup data (public/optionalAuth on the backend) ----

export const getCities = (params = {}) => apiClient.get('/cities', { params: { limit: 100, ...params } });

export const getHospitals = (params = {}) =>
  apiClient.get('/hospitals', { params: { limit: 100, ...params } });

export const getHospitalById = (id) => apiClient.get(`/hospitals/${id}`);

export const getDepartments = (params = {}) =>
  apiClient.get('/departments', { params: { limit: 100, ...params } });

export const getDoctors = (params = {}) => apiClient.get('/doctors', { params: { limit: 100, ...params } });

export const getDoctorById = (id) => apiClient.get(`/doctors/${id}`);

// ---- Patient-only appointment endpoints ----

export const bookAppointment = (payload) => apiClient.post('/patients/appointments', payload);

export const getMyAppointments = (params = {}) => apiClient.get('/patients/appointments', { params });

export const getMyAppointmentById = (id) => apiClient.get(`/patients/appointments/${id}`);

export const cancelMyAppointment = (id, cancellationReason) =>
  apiClient.patch(`/patients/appointments/${id}/cancel`, { cancellationReason });
