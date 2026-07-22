import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient singleton with production performance defaults:
 * - staleTime: 10 min (queries won't re-fetch for 10 min after last success)
 * - gcTime: 60 min (cached data is kept for 60 min in memory)
 * - retry: 1 on query failure
 * - refetchOnWindowFocus: false (prevents expensive background re-querying when tabbing)
 * - refetchOnReconnect: false
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
