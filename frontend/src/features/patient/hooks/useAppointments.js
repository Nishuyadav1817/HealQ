import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookAppointment,
  getMyAppointments,
  getMyAppointmentById,
  cancelMyAppointment,
} from '../services/patient.api';

/** "My Appointments" / Track Appointment list — refetches on window focus
 * so a patient tabbing back in sees a status that may have changed while
 * they were away (e.g. reception checked them in). */
export const useMyAppointments = (filters = {}) =>
  useQuery({
    queryKey: ['myAppointments', filters],
    queryFn: () => getMyAppointments(filters),
    select: (res) => res.data.data.appointments,
    refetchOnWindowFocus: true,
  });

/** Single appointment — the source of truth for the Track page between
 * socket events (see useAppointmentTracking), and the fallback used by
 * Booking Success if the page is reloaded and navigation state is lost. */
export const useAppointment = (id) =>
  useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getMyAppointmentById(id),
    select: (res) => res.data.data.appointment,
    enabled: !!id,
  });

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => bookAppointment(payload),
    onSuccess: () => {
      // Any freshly-cached "my appointments" list is now stale.
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => cancelMyAppointment(id, reason),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
    },
  });
};
