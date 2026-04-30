import type { Movie, RecommendationRequest } from "@/types/movie";
import { findTMDBByImdbId, getSimilarMovies, getTMDBPosterUrl, getTMDBBackdropUrl } from "./tmdb";
import { internalClient } from "@/lib/apiClient";

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

export async function getMLRecommendations(req: RecommendationRequest): Promise<string[]> {
  try {
    const { data } = await internalClient.post(
      `${ML_API_URL}/recommend`,
      req,
      { timeout: 5000 }
    );
    return data?.recommendations || [];
  } catch {
    return [];
  }
}

async function getServerSideRecommendations(movie: Movie): Promise<Movie[]> {
  try {
    const { data } = await internalClient.post("/api/recommend", {
      title: movie.title,
      tmdbId: movie.tmdbId,
    });
    return data?.recommendations || [];
  } catch {
    return [];
  }
}

export async function getRecommendations(
  movie: Movie,
  omdbFetcher: (title: string) => Promise<Movie | null>
): Promise<Movie[]> {
  // 1. Try ML service first (if running locally)
  const mlTitles = await getMLRecommendations({
    title: movie.title,
    genre: movie.genre,
    year: movie.year,
  });

  if (mlTitles.length > 0) {
    const enriched = await Promise.all(
      mlTitles.slice(0, 10).map((t) => omdbFetcher(t))
    );
    const valid = enriched.filter(Boolean) as Movie[];
    if (valid.length >= 3) return valid;
  }

  // 2. Primary fallback: internal /api/recommend (server-side TMDB)
  const serverRecs = await getServerSideRecommendations(movie);
  if (serverRecs.length > 0) return serverRecs;

  // 3. Client-side TMDB fallback if we have tmdbId or imdbID
  if (movie.imdbID && !movie.imdbID.startsWith("tmdb_")) {
    const tmdbData = await findTMDBByImdbId(movie.imdbID);
    if (tmdbData?.id) {
      const similar = await getSimilarMovies(tmdbData.id);
      if (similar.length > 0) return similar;
    }
  }

  if (movie.tmdbId) {
    return getSimilarMovies(movie.tmdbId);
  }

  return [];
}

export async function getTopSuggestions(
  seenIds: string[],
  page = 1
): Promise<Movie[]> {
  try {
    // We must use the generic apiClient (not internalClient) for external APIs
    const { apiClient: externalClient } = await import("@/lib/apiClient");
    
    const { data } = await externalClient.get(
      `https://api.themoviedb.org/3/movie/top_rated`,
      {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          page,
        },
      }
    );

    const results = data?.results || [];
    const filtered = results.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => !seenIds.includes(`tmdb_${m.id}`)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return filtered.slice(0, 2).map((m: any) => ({
      imdbID: `tmdb_${m.id}`,
      title: m.title,
      year: m.release_date?.split("-")[0] || "",
      genre: "",
      poster: m.poster_path
        ? getTMDBPosterUrl(m.poster_path)!
        : "https://via.placeholder.com/300x450?text=No+Poster",
      rating: m.vote_average?.toFixed(1) || "N/A",
      plot: m.overview,
      tmdbId: m.id,
      backdropPath: m.backdrop_path
        ? getTMDBBackdropUrl(m.backdrop_path)!
        : undefined,
    }));
  } catch {
    return [];
  }
}
