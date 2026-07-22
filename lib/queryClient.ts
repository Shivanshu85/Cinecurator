import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient singleton with sensible defaults:
 * - staleTime: 5 min (queries won't re-fetch for 5 min after last success)
 * - gcTime: 30 min (cached data is kept for 30 min after component unmounts)
 * - retry: 2 on query failure (Axios also retries internally)
 * - refetchOnWindowFocus: true (keep data fresh when user tabs back)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
