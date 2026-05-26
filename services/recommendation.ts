import type { Movie, RecommendationRequest } from "@/types/movie";
import { findTMDBByImdbId, getSimilarMovies, getTMDBPosterUrl, getTMDBBackdropUrl } from "./tmdb";
import { internalClient, apiClient, isTmdbOffline } from "@/lib/apiClient";
import { FALLBACK_TOP_SUGGESTIONS, FALLBACK_BY_GENRE } from "@/lib/fallbackMovies";

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

export function getLocalGenreRecommendations(movie: Movie): Movie[] {
  try {
    const movieGenres = movie.genre
      ? movie.genre.toLowerCase().split(",").map((g) => g.trim())
      : [];

    const fallbackPool: Movie[] = [];
    
    // Add movies matching any of the searched movie's genres
    for (const g of movieGenres) {
      // Clean up common sub-genres to match keys (e.g., "adventure" / "sci-fi")
      let matchKey = g as keyof typeof FALLBACK_BY_GENRE;
      if (g.includes("sci-fi") || g.includes("science fiction")) {
        matchKey = "sci-fi";
      }
      
      if (FALLBACK_BY_GENRE[matchKey]) {
        fallbackPool.push(...FALLBACK_BY_GENRE[matchKey]);
      }
    }

    // Deduplicate and filter out the searched movie itself
    const uniquePool = Array.from(new Map(fallbackPool.map((m) => [m.imdbID, m])).values());
    const finalRecs = uniquePool.filter(
      (m) => m.title.toLowerCase() !== movie.title.toLowerCase() && m.imdbID !== movie.imdbID
    );

    if (finalRecs.length > 0) {
      return finalRecs.slice(0, 10);
    }
    
    // Ultimate fallback if no genre matched: return the general top suggestions
    return FALLBACK_TOP_SUGGESTIONS.filter(
      (m) => m.title.toLowerCase() !== movie.title.toLowerCase() && m.imdbID !== movie.imdbID
    );
  } catch (e) {
    console.error("Local fallback recommendation system failed:", e);
    return [];
  }
}

export async function getRecommendations(
  movie: Movie,
  omdbFetcher: (title: string) => Promise<Movie | null>
): Promise<Movie[]> {
  if (isTmdbOffline) {
    console.warn("Skipping TMDB recommendation paths immediately due to offline/blocked flag.");
    return getLocalGenreRecommendations(movie);
  }

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

  // 4. Bulletproof Local Genre-Matched Fallback (If TMDB is blocked/offline)
  console.warn("All TMDB recommendation pathways failed/timed out. Generating local high-quality genre-matched recommendations.");
  return getLocalGenreRecommendations(movie);
}

export async function getTopSuggestions(
  seenIds: string[],
  page = 1
): Promise<Movie[]> {
  try {
    const tmdbApiStr = process.env.NEXT_PUBLIC_TMDB_API_KEY || "b682f188b8b83ad86fbd4d52c658bd3e";
    
    const { data } = await apiClient.get(
      `https://api.themoviedb.org/3/movie/top_rated`,
      {
        params: {
          api_key: tmdbApiStr,
          page,
        },
      }
    );

    const results = data?.results || [];
    let filtered = results.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => !seenIds.includes(`tmdb_${m.id}`)
    );

    // If the user has seen all movies on this page, fall back to showing them anyway
    if (filtered.length === 0 && results.length > 0) {
      filtered = results;
    }

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
  } catch (err) {
    console.warn("Top Suggestions TMDB fetch timed out or failed, using local high-quality suggestions fallback.");
    return FALLBACK_TOP_SUGGESTIONS.filter(
      (m) => !seenIds.includes(m.imdbID)
    );
  }
}

