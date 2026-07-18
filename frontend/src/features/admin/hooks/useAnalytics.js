import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../services/admin.api';

/** Charts/Analytics/Reports tabs all read from this one endpoint —
 * `days` controls the trailing window (7/14/30/90), driven by whatever
 * date-range control the calling page renders. */
export const useAnalytics = (days = 30) =>
  useQuery({
    queryKey: ['adminAnalytics', days],
    queryFn: () => getAnalytics({ days }),
    select: (res) => res.data.data,
    staleTime: 60000,
  });
