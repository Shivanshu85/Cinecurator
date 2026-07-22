/**
 * Centralized TanStack Query key registry.
 * This ensures type-safe, consistent cache keys across the entire app.
 */

export const movieKeys = {
  all: ["movies"] as const,
  byTitle: (title: string) => ["movies", "title", title] as const,
  byId: (id: string) => ["movies", "id", id] as const,
  search: (query: string) => ["movies", "search", query] as const,
};

export const genreKeys = {
  all: ["genre-movies"] as const,
  byGenre: (genreId: number) => ["genre-movies", genreId] as const,
};

export const recommendationKeys = {
  all: ["recommendations"] as const,
  forMovie: (imdbId: string) => ["recommendations", imdbId] as const,
};

export const suggestionsKeys = {
  all: ["top-suggestions"] as const,
  forUser: (userId: string | null) =>
    ["top-suggestions", userId ?? "guest"] as const,
};

export const libraryKeys = {
  all: ["library"] as const,
  forUser: (userId: string) => ["library", userId] as const,
};
