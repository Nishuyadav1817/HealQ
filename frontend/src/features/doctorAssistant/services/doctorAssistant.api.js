import apiClient from '../../../services/apiClient';

/**
 * Doctor Assistant API Endpoints
 * Handles all backend calls for queue management and doctor/hospital lookups
 */

// Hospital & Doctor Lookups
export const getHospitalById = (hospitalId) => {
  return apiClient.get(`/hospitals/${hospitalId}`);
};

export const getHospitalDoctors = (hospitalId) => {
  return apiClient.get(`/hospitals/${hospitalId}/doctors`);
};

// Queue Operations
export const getQueue = ({ doctor, date }) => {
  const params = new URLSearchParams();
  if (doctor) params.append('doctor', doctor);
  if (date) params.append('date', date);

  return apiClient.get(`/doctor-assistant/queue?${params.toString()}`);
};

export const callNextPatient = ({ doctorId, date }) => {
  return apiClient.post('/doctor-assistant/queue/call-next', {
    doctorId,
    date,
  });
};

export const startConsultation = ({ appointmentId }) => {
  return apiClient.post(`/doctor-assistant/appointments/${appointmentId}/start`, {});
};

export const completeConsultation = ({ appointmentId, notes }) => {
  return apiClient.post(`/doctor-assistant/appointments/${appointmentId}/complete`, {
    notes,
  });
};

export const skipPatient = ({ appointmentId, reason }) => {
  return apiClient.post(`/doctor-assistant/appointments/${appointmentId}/skip`, {
    reason,
  });
};

export const pauseQueue = ({ doctorId, date }) => {
  return apiClient.post('/doctor-assistant/queue/pause', {
    doctorId,
    date,
  });
};

export const resumeQueue = ({ doctorId, date }) => {
  return apiClient.post('/doctor-assistant/queue/resume', {
    doctorId,
    date,
  });
};

export const setAverageConsultationMinutes = ({ doctorId, date, minutes }) => {
  return apiClient.post('/doctor-assistant/queue/consultation-time', {
    doctorId,
    date,
    minutes,
  });
};

export default {
  getHospitalById,
  getHospitalDoctors,
  getQueue,
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
  pauseQueue,
  resumeQueue,
  setAverageConsultationMinutes,
};
