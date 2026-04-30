import { create } from "zustand";
import type { Movie, Genre } from "@/types/movie";

interface MovieStore {
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Recommendations (after search)
  recommendations: Movie[];
  setRecommendations: (movies: Movie[]) => void;
  isRecommendationLoading: boolean;
  setIsRecommendationLoading: (v: boolean) => void;

  // Top 2 featured suggestions
  topSuggestions: Movie[];
  setTopSuggestions: (movies: Movie[]) => void;
  isSuggestionsLoading: boolean;
  setIsSuggestionsLoading: (v: boolean) => void;

  // Genre movies
  selectedGenre: Genre;
  setSelectedGenre: (g: Genre) => void;
  genreMovies: Movie[];
  setGenreMovies: (movies: Movie[]) => void;
  isGenreLoading: boolean;
  setIsGenreLoading: (v: boolean) => void;

  // Searched movie details
  searchedMovie: Movie | null;
  setSearchedMovie: (m: Movie | null) => void;
}

export const useMovieStore = create<MovieStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  recommendations: [],
  setRecommendations: (movies) => set({ recommendations: movies }),
  isRecommendationLoading: false,
  setIsRecommendationLoading: (v) => set({ isRecommendationLoading: v }),

  topSuggestions: [],
  setTopSuggestions: (movies) => set({ topSuggestions: movies }),
  isSuggestionsLoading: false,
  setIsSuggestionsLoading: (v) => set({ isSuggestionsLoading: v }),

  selectedGenre: "action",
  setSelectedGenre: (g) => set({ selectedGenre: g }),
  genreMovies: [],
  setGenreMovies: (movies) => set({ genreMovies: movies }),
  isGenreLoading: false,
  setIsGenreLoading: (v) => set({ isGenreLoading: v }),

  searchedMovie: null,
  setSearchedMovie: (m) => set({ searchedMovie: m }),
}));
