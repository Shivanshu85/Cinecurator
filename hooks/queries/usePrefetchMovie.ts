"use client";

import { useQueryClient } from "@tanstack/react-query";
import { movieKeys } from "@/lib/queryKeys";
import { fetchMovieByTitle } from "@/services/omdb";
import { enrichMovieWithTMDB } from "@/services/tmdb";

/**
 * Returns a prefetch function to pre-warm the movie cache on hover.
 * Call `prefetchMovie(movie.title)` in onMouseEnter handlers.
 */
export function usePrefetchMovie() {
  const queryClient = useQueryClient();

  return (title: string) => {
    const key = movieKeys.byTitle(title);
    // Only prefetch if not already in cache or stale
    const cached = queryClient.getQueryData(key);
    if (cached) return;

    queryClient.prefetchQuery({
      queryKey: key,
      queryFn: async () => {
        const movie = await fetchMovieByTitle(title);
        if (!movie) return null;
        return enrichMovieWithTMDB(movie);
      },
      staleTime: 2 * 60 * 1000,
    });
  };
}
