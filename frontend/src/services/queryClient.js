import { QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient instance for the whole app, imported wherever a
 * non-component module needs to interact with the cache directly (e.g. an
 * imperative cache update from a socket event handler — see sockets/
 * usage once pages are built).
 *
 * Defaults are tuned for an operations dashboard rather than a marketing
 * site: refetchOnWindowFocus is OFF because the live queue state is kept
 * fresh by Socket.IO, not by re-fetching every time a staff member
 * alt-tabs back to the browser — polling and sockets fighting over the
 * same data is a common source of UI flicker.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // never silently re-submit a booking/payment/status change
    },
  },
});
