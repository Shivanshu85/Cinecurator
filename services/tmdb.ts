import { Movie, CastMember, GENRE_TMDB_IDS, Genre } from "@/types/movie";
import { apiClient, isTmdbOffline } from "@/lib/apiClient";
import { FALLBACK_BY_GENRE } from "@/lib/fallbackMovies";

const TMDB_BASE = "https://api.themoviedb.org/3";

function proxyUrl(path: string, size: string) {
  return `/api/tmdb-image?path=${encodeURIComponent(path)}&size=${size}`;
}

function getApiKey() {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || "";
}

export function getTMDBPosterUrl(path: string, size = "w500") {
  if (!path) return null;
  return proxyUrl(path, size);
}

export function getTMDBBackdropUrl(path: string, size = "w1280") {
  if (!path) return null;
  return proxyUrl(path, size);
}

export async function findTMDBByImdbId(imdbId: string) {
  if (isTmdbOffline) return null;
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/find/${imdbId}`, {
      params: { api_key: getApiKey(), external_source: "imdb_id" },
    });
    return data.movie_results?.[0] || null;
  } catch {
    return null;
  }
}

export async function getMovieCast(tmdbId: number): Promise<CastMember[]> {
  if (isTmdbOffline) return [];
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/movie/${tmdbId}/credits`, {
      params: { api_key: getApiKey() },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.cast || []).slice(0, 8).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? getTMDBPosterUrl(c.profile_path, "w185") : undefined,
    }));
  } catch {
    return [];
  }
}

export async function enrichMovieWithTMDB(movie: Movie): Promise<Movie> {
  if (isTmdbOffline) return movie;
  try {
    const tmdbMovie = await findTMDBByImdbId(movie.imdbID);
    if (!tmdbMovie) return movie;
    return {
      ...movie,
      tmdbId: tmdbMovie.id,
      backdropPath: tmdbMovie.backdrop_path
        ? getTMDBBackdropUrl(tmdbMovie.backdrop_path)!
        : undefined,
      tmdbPoster: tmdbMovie.poster_path
        ? getTMDBPosterUrl(tmdbMovie.poster_path)!
        : undefined,
    };
  } catch {
    return movie;
  }
}

export async function fetchMoviesByGenre(genreId: number, page = 1): Promise<Movie[]> {
  if (isTmdbOffline) {
    const genreKey = (Object.keys(GENRE_TMDB_IDS) as Genre[]).find(
      (key) => GENRE_TMDB_IDS[key] === genreId
    );
    if (genreKey && FALLBACK_BY_GENRE[genreKey]) {
      return FALLBACK_BY_GENRE[genreKey];
    }
    return [];
  }
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/discover/movie`, {
      params: {
        api_key: getApiKey(),
        with_genres: genreId,
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
        page,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).slice(0, 8).map((m: any) => ({
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
      backdropPath: m.backdrop_path ? getTMDBBackdropUrl(m.backdrop_path)! : undefined,
    }));
  } catch {
    console.warn(`fetchMoviesByGenre TMDB fetch failed or timed out for genre ID ${genreId}. Falling back to local high-quality genre movies.`);
    try {
      const genreKey = (Object.keys(GENRE_TMDB_IDS) as Genre[]).find(
        (key) => GENRE_TMDB_IDS[key] === genreId
      );
      if (genreKey && FALLBACK_BY_GENRE[genreKey]) {
        return FALLBACK_BY_GENRE[genreKey];
      }
    } catch (e) {
      console.error("Fallback genre lookup failed:", e);
    }
    return [];
  }
}

export async function getSimilarMovies(tmdbId: number): Promise<Movie[]> {
  if (isTmdbOffline) return [];
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/movie/${tmdbId}/similar`, {
      params: { api_key: getApiKey() },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).slice(0, 10).map((m: any) => ({
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
    }));
  } catch {
    return [];
  }
}

export async function getTopRatedMovies(page = 1): Promise<Movie[]> {
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/movie/top_rated`, {
      params: { api_key: getApiKey(), page },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).slice(0, 2).map((m: any) => ({
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
      backdropPath: m.backdrop_path ? getTMDBBackdropUrl(m.backdrop_path)! : undefined,
    }));
  } catch {
    return [];
  }
}
