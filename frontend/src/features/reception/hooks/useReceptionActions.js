import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  verifyPatient,
  collectPayment,
  markArrived,
  moveToDoctorQueue,
  updateAppointmentStatus,
} from '../services/reception.api';

/**
 * Every action mutation invalidates BOTH the Today's Patients board and
 * any current Search Booking result — a receptionist may act on an
 * appointment from either view, and whichever one they didn't act from
 * should still reflect the change without a manual refresh. React Query
 * v5 treats a queryKey prefix as a match, so ['todaysAppointments'] here
 * invalidates every filtered variant of that list in one call.
 */
const useReceptionAction = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['searchBooking'] });
    },
  });
};

export const useVerifyPatient = () =>
  useReceptionAction(({ id, verificationNotes }) => verifyPatient(id, verificationNotes));

export const useCollectPayment = () =>
  useReceptionAction(({ id, method, amount }) => collectPayment(id, { method, amount }));

export const useMarkArrived = () => useReceptionAction(({ id }) => markArrived(id));

export const useMoveToDoctorQueue = () => useReceptionAction(({ id }) => moveToDoctorQueue(id));

export const useUpdateAppointmentStatus = () =>
  useReceptionAction(({ id, status, reason }) => updateAppointmentStatus(id, { status, reason }));
