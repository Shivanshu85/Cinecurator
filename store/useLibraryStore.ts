import { create } from "zustand";
import type { LibraryItem, Movie } from "@/types/movie";
import { addToLibrary, removeFromLibrary, getLibrary } from "@/services/superbase";

interface LibraryStore {
  library: LibraryItem[];
  isLoading: boolean;
  fetchLibrary: (userId: string) => Promise<void>;
  addToLibrary: (userId: string, movie: Movie) => Promise<void>;
  removeFromLibrary: (userId: string, imdbId: string) => Promise<void>;
  isInLibrary: (imdbId: string) => boolean;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  library: [],
  isLoading: false,

  fetchLibrary: async (userId) => {
    set({ isLoading: true });
    const items = await getLibrary(userId);
    set({ library: items, isLoading: false });
  },

  addToLibrary: async (userId, movie) => {
    // Optimistic update
    const optimistic: LibraryItem = {
      id: `temp_${Date.now()}`,
      user_id: userId,
      imdb_id: movie.imdbID,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      genre: movie.genre,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ library: [optimistic, ...s.library] }));
    await addToLibrary(userId, movie);
  },

  removeFromLibrary: async (userId, imdbId) => {
    // Optimistic update
    set((s) => ({ library: s.library.filter((i) => i.imdb_id !== imdbId) }));
    await removeFromLibrary(userId, imdbId);
  },

  isInLibrary: (imdbId) => {
    return get().library.some((i) => i.imdb_id === imdbId);
  },
}));
