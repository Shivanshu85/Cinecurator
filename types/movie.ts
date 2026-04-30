// Core movie type returned from search/recommendations
export interface Movie {
  imdbID: string;
  title: string;
  year: string;
  genre: string;
  poster: string;
  rating: string; // IMDb rating
  runtime?: string;
  plot?: string;
  director?: string;
  actors?: string;
  language?: string;
  country?: string;
  awards?: string;
  type?: string;
  // TMDB enriched fields
  tmdbId?: number;
  backdropPath?: string;
  tmdbPoster?: string;
  trailerUrl?: string;
  budget?: string;
  revenue?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath?: string;
}

export interface LibraryItem {
  id: string;
  user_id: string;
  imdb_id: string;
  title: string;
  poster: string;
  rating: string;
  year: string;
  genre: string;
  created_at: string;
}

export interface RecommendationRequest {
  title: string;
  genre?: string;
  year?: string;
}

export interface RecommendationResponse {
  recommendations: Movie[];
  source: "ml" | "tmdb_fallback";
}

export type Genre =
  | "action"
  | "drama"
  | "horror"
  | "sci-fi"
  | "comedy"
  | "thriller"
  | "romance"
  | "animation";

export const GENRE_TMDB_IDS: Record<Genre, number> = {
  action: 28,
  drama: 18,
  horror: 27,
  "sci-fi": 878,
  comedy: 35,
  thriller: 53,
  romance: 10749,
  animation: 16,
};
