import apiClient from '../../../services/apiClient';

/**
 * Thin request wrappers only — no caching/state, same split used by
 * features/reception/services/reception.api.js. React Query hooks in
 * ../hooks own caching/loading/error state on top of these.
 *
 * Mounted at '/doctor-assistant' on the backend (see routes/index.js) —
 * note the hyphen, it does NOT match the module folder name
 * `doctorAssistant`.
 */

export const getHospitalDoctors = (hospitalId) =>
  apiClient.get('/doctors', { params: { hospital: hospitalId, limit: 100 } });

export const getQueue = (params) => apiClient.get('/doctor-assistant/queue', { params });

export const callNextPatient = (payload) => apiClient.post('/doctor-assistant/queue/call-next', payload);

export const startConsultation = (appointmentId) =>
  apiClient.patch(`/doctor-assistant/queue/${appointmentId}/start`);

export const completeConsultation = (appointmentId) =>
  apiClient.patch(`/doctor-assistant/queue/${appointmentId}/complete`);

export const skipPatient = (appointmentId) =>
  apiClient.patch(`/doctor-assistant/queue/${appointmentId}/skip`);

export const pauseQueue = (payload) => apiClient.patch('/doctor-assistant/queue/pause', payload);

export const resumeQueue = (payload) => apiClient.patch('/doctor-assistant/queue/resume', payload);

export const setAverageConsultationMinutes = (payload) =>
  apiClient.patch('/doctor-assistant/queue/average-consultation-time', payload);
