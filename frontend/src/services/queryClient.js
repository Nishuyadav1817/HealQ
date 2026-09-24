import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 *
 * Centralized setup for all data fetching and caching
 * - Stale time: 5 minutes (data considered fresh for 5 min)
 * - Cache time: 10 minutes (keep in memory for 10 min after last use)
 * - Retries: 2 attempts on failure
 * - Retry delay: Exponential backoff
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Disable auto-refetch on tab focus to reduce noise
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default queryClient;
