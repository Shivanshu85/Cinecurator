"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationKeys, movieKeys } from "@/lib/queryKeys";
import { fetchMovieByTitle } from "@/services/omdb";
import { enrichMovieWithTMDB } from "@/services/tmdb";
import { getRecommendations } from "@/services/recommendation";
import type { Movie } from "@/types/movie";

/**
 * Recommendation mutation (triggered on user search):
 * - Results cached by the searched movie's imdbID
 * - Deduplicates concurrent calls for the same movie
 * - Returns { mutate, isPending, data, isError }
 */
export function useRecommendationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchQuery: string): Promise<{ movie: Movie; recs: Movie[] }> => {
      // Check cache first
      const cacheKey = movieKeys.byTitle(searchQuery.trim());
      const cachedMovie = queryClient.getQueryData<Movie | null>(cacheKey);

      let movie: Movie | null = cachedMovie ?? null;
      if (!movie) {
        movie = await fetchMovieByTitle(searchQuery.trim());
        if (!movie) throw new Error("Movie not found");
        movie = await enrichMovieWithTMDB(movie);
        queryClient.setQueryData(cacheKey, movie);
      }

      // Check recommendation cache
      const recKey = recommendationKeys.forMovie(movie.imdbID);
      const cachedRecs = queryClient.getQueryData<Movie[]>(recKey);
      if (cachedRecs && cachedRecs.length > 0) {
        return { movie, recs: cachedRecs };
      }

      const recs = await getRecommendations(movie, fetchMovieByTitle);
      queryClient.setQueryData(recKey, recs);
      return { movie, recs };
    },
    retry: 1,
  });
}
