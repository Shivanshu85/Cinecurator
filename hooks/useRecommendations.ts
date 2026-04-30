"use client";

import { useCallback } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { fetchMovieByTitle } from "@/services/omdb";
import { enrichMovieWithTMDB } from "@/services/tmdb";
import { getRecommendations } from "@/services/recommendation";

export function useRecommendations() {
  const {
    searchQuery,
    setSearchQuery,
    setRecommendations,
    setIsRecommendationLoading,
    setSearchedMovie,
    isRecommendationLoading,
    recommendations,
    searchedMovie,
  } = useMovieStore();

  const recommend = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsRecommendationLoading(true);
    setRecommendations([]);

    try {
      // 1. Fetch base data from OMDb
      let movie = await fetchMovieByTitle(searchQuery.trim());
      if (!movie) {
        setIsRecommendationLoading(false);
        return;
      }

      // 2. Enrich with TMDB
      movie = await enrichMovieWithTMDB(movie);
      setSearchedMovie(movie);

      // 3. Get recommendations
      const recs = await getRecommendations(movie, fetchMovieByTitle);
      setRecommendations(recs);
    } finally {
      setIsRecommendationLoading(false);
    }
  }, [searchQuery, setIsRecommendationLoading, setRecommendations, setSearchedMovie]);

  return {
    searchQuery,
    setSearchQuery,
    recommend,
    isLoading: isRecommendationLoading,
    recommendations,
    searchedMovie,
  };
}
