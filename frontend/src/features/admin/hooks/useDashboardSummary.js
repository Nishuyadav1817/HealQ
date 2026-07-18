import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/admin.api';

/** Overview tab's stat cards — light enough to poll on an interval so
 * the numbers stay roughly current without needing a socket subscription
 * (unlike the live queue board, a few seconds of staleness here is
 * completely fine for aggregate counts). */
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['adminDashboardSummary'],
    queryFn: getDashboardSummary,
    select: (res) => res.data.data,
    refetchInterval: 60000,
  });
