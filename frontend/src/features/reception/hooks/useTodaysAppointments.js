import { useQuery } from '@tanstack/react-query';
import { getTodaysAppointments } from '../services/reception.api';

/**
 * "Today's Patients" board. `refetchInterval` is the reliable half of
 * this dashboard's Live Updates story: the socket layer (see
 * useReceptionLiveUpdates) can only tell us "SOME doctor's queue in this
 * hospital just changed" — its QUEUE_UPDATED payload has no doctorId to
 * attribute it to (see that hook for why) — so it triggers an immediate
 * refetch on top of this interval rather than trying to patch state
 * itself. Either path lands here, in the one place that owns the data.
 */
export const useTodaysAppointments = (filters = {}) =>
  useQuery({
    queryKey: ['todaysAppointments', filters],
    queryFn: () => getTodaysAppointments(filters),
    select: (res) => res.data.data.appointments,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
