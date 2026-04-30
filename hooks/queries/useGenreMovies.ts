"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { genreKeys } from "@/lib/queryKeys";
import { fetchMoviesByGenre } from "@/services/tmdb";
import { GENRE_TMDB_IDS } from "@/types/movie";
import type { Genre } from "@/types/movie";

/**
 * Fetches movies for a genre with aggressive caching:
 * - staleTime: 10 min (genre lists rarely change)
 * - Deduplicates concurrent requests for the same genre
 */
export function useGenreMovies(selectedGenre: Genre) {
  const genreId = GENRE_TMDB_IDS[selectedGenre];
  return useQuery({
    queryKey: genreKeys.byGenre(genreId),
    queryFn: () => fetchMoviesByGenre(genreId),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // 1 hour
    placeholderData: (prev) => prev, // keep old data while loading new genre
  });
}

/**
 * Returns a function to prefetch movies for any genre on hover.
 * Call `prefetchGenre("action")` on any button's onMouseEnter.
 */
export function usePrefetchGenre() {
  const queryClient = useQueryClient();
  return (genre: Genre) => {
    const genreId = GENRE_TMDB_IDS[genre];
    queryClient.prefetchQuery({
      queryKey: genreKeys.byGenre(genreId),
      queryFn: () => fetchMoviesByGenre(genreId),
      staleTime: 10 * 60 * 1000,
    });
  };
}
