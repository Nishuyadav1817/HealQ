import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../services/patient.api';

/**
 * Fetch patient's appointments
 */
export const usePatientAppointments = (query = {}) => {
  return useQuery({
    queryKey: ['patient', 'appointments', query],
    queryFn: () => patientAPI.getMyAppointments(query),
    select: (response) => response.data?.data || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch a single appointment by ID
 */
export const usePatientAppointmentById = (appointmentId) => {
  return useQuery({
    queryKey: ['patient', 'appointment', appointmentId],
    queryFn: () => patientAPI.getMyAppointmentById(appointmentId),
    select: (response) => response.data?.data?.appointment || null,
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Cancel an appointment
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }) =>
      patientAPI.cancelAppointment(appointmentId, reason),
    onSuccess: (response, variables) => {
      // Invalidate the appointments list and the specific appointment
      queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
      queryClient.invalidateQueries({
        queryKey: ['patient', 'appointment', variables.appointmentId],
      });
    },
  });
};

/**
 * Book a new appointment
 */
export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData) => patientAPI.bookAppointment(appointmentData),
    onSuccess: () => {
      // Invalidate appointments list after booking
      queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
    },
  });
};
