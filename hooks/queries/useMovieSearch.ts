"use client";

import { useQuery } from "@tanstack/react-query";
import { movieKeys } from "@/lib/queryKeys";
import { fetchMovieByTitle } from "@/services/omdb";
import { enrichMovieWithTMDB } from "@/services/tmdb";

/**
 * Searches for a movie by title, enriching with TMDB data.
 * Only fires when searchQuery is non-empty.
 */
export function useMovieSearch(searchQuery: string) {
  return useQuery({
    queryKey: movieKeys.byTitle(searchQuery),
    queryFn: async () => {
      const movie = await fetchMovieByTitle(searchQuery.trim());
      if (!movie) return null;
      return enrichMovieWithTMDB(movie);
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
