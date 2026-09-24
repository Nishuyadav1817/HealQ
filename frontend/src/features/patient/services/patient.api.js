import apiClient from '../../../services/apiClient';

/**
 * Patient API endpoints
 */
export const patientAPI = {
  /**
   * Book a new appointment
   */
  bookAppointment: (data) =>
    apiClient.post('/patients/appointments', data),

  /**
   * Get patient's appointments
   */
  getMyAppointments: (query = {}) =>
    apiClient.get('/patients/appointments', { params: query }),

  /**
   * Get a specific appointment
   */
  getMyAppointmentById: (appointmentId) =>
    apiClient.get(`/patients/appointments/${appointmentId}`),

  /**
   * Cancel an appointment
   */
  cancelAppointment: (appointmentId, cancellationReason = '') =>
    apiClient.patch(`/patients/appointments/${appointmentId}/cancel`, {
      cancellationReason,
    }),
};
