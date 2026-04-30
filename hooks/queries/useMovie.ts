import { useQuery } from "@tanstack/react-query";
import { movieKeys } from "@/lib/queryKeys";
import { fetchMovieById } from "@/services/omdb";
import { findTMDBByImdbId, getMovieCast, getSimilarMovies } from "@/services/tmdb";
import type { Movie, CastMember } from "@/types/movie";

export interface MovieDetails extends Movie {
  cast?: CastMember[];
  similar?: Movie[];
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: async () => {
      let movie: Movie | null = null;
      let tmdbId: number | undefined;

      // 1. Fetch main movie data
      if (id.startsWith("tmdb_")) {
        // It's a TMDB-only movie
        tmdbId = parseInt(id.replace("tmdb_", ""), 10);
        // We need a helper to fetch TMDB movie by ID, or we just rely on getSimilarMovies for now? Wait, we can't display a movie without fetching it.
        // Actually, let's use the OMDB endpoint if it's IMDB, else we need a TMDB fetcher.
      } else {
        // It's an IMDB movie, fetch OMDB
        movie = await fetchMovieById(id);
      }

      // If we don't have TMDB ID, find it
      if (movie && movie.imdbID && !tmdbId) {
        const tmdbData = await findTMDBByImdbId(movie.imdbID);
        if (tmdbData) {
          tmdbId = tmdbData.id;
          movie.backdropPath = tmdbData.backdrop_path 
            ? `/api/tmdb-image?path=${encodeURIComponent(tmdbData.backdrop_path)}&size=w1280`
            : undefined;
        }
      }

      // If we still don't have movie but have tmdbId, we need to fetch TMDB details
      if (!movie && tmdbId) {
        const { apiClient } = await import("@/lib/apiClient");
        const { data } = await apiClient.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
          params: { api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY },
        });
        movie = {
          imdbID: `tmdb_${data.id}`,
          title: data.title,
          year: data.release_date?.split("-")[0] || "",
          genre: data.genres?.map((g: any) => g.name).join(", ") || "",
          poster: data.poster_path ? `/api/tmdb-image?path=${encodeURIComponent(data.poster_path)}&size=w500` : "",
          rating: data.vote_average?.toFixed(1) || "N/A",
          plot: data.overview,
          tmdbId: data.id,
          backdropPath: data.backdrop_path ? `/api/tmdb-image?path=${encodeURIComponent(data.backdrop_path)}&size=w1280` : undefined,
        };
      }

      if (!movie) throw new Error("Movie not found");

      // 2. Fetch Cast and Similar movies in parallel
      let cast: CastMember[] = [];
      let similar: Movie[] = [];

      if (tmdbId) {
        [cast, similar] = await Promise.all([
          getMovieCast(tmdbId),
          getSimilarMovies(tmdbId),
        ]);
      }

      return {
        ...movie,
        cast,
        similar,
      } as MovieDetails;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !!id,
  });
}
