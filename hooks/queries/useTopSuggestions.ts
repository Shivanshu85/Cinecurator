"use client";

import { useQuery } from "@tanstack/react-query";
import { suggestionsKeys } from "@/lib/queryKeys";
import { getTopSuggestions } from "@/services/recommendation";
import { getSeenSuggestions, recordSeenSuggestions } from "@/services/superbase";
import type { Movie } from "@/types/movie";

/**
 * Fetches top movie suggestions with caching:
 * - Cached for 5 minutes (staleTime)
 * - Kept in memory for 30 minutes (gcTime)
 * - Background refetches on window focus
 */
export function useTopSuggestions(userId: string | null) {
  return useQuery({
    queryKey: suggestionsKeys.forUser(userId),
    queryFn: async ({ signal }) => {
      const seenIds = userId ? await getSeenSuggestions(userId) : [];
      let suggestions = await getTopSuggestions(seenIds, 1);

      if (suggestions.length < 2) {
        const more = await getTopSuggestions(seenIds, 2);
        suggestions = [...suggestions, ...more].slice(0, 2);
      } else {
        suggestions = suggestions.slice(0, 2);
      }

      // Record seen suggestions without blocking the UI
      if (userId && suggestions.length > 0 && !signal?.aborted) {
        recordSeenSuggestions(
          userId,
          suggestions.map((m: Movie) => m.imdbID)
        ).catch(() => {}); // fire-and-forget
      }

      return suggestions;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
