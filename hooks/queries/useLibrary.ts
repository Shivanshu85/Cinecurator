"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryKeys } from "@/lib/queryKeys";
import {
  addToLibrary as addToLibrarySvc,
  removeFromLibrary as removeFromLibrarySvc,
  getLibrary,
} from "@/services/superbase";
import type { LibraryItem, Movie } from "@/types/movie";

/** Fetches the user's library, cached for 5 minutes. */
export function useLibrary(userId: string | null) {
  return useQuery({
    queryKey: libraryKeys.forUser(userId ?? ""),
    queryFn: () => getLibrary(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/** Add to library with optimistic update and automatic rollback on error. */
export function useAddToLibrary(userId: string) {
  const queryClient = useQueryClient();
  const key = libraryKeys.forUser(userId);

  return useMutation({
    mutationFn: (movie: Movie) => addToLibrarySvc(userId, movie),
    onMutate: async (movie: Movie) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LibraryItem[]>(key);

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

      queryClient.setQueryData<LibraryItem[]>(key, (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_err, _movie, context) => {
      if (context?.previous)
        queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** Remove from library with optimistic update and automatic rollback on error. */
export function useRemoveFromLibrary(userId: string) {
  const queryClient = useQueryClient();
  const key = libraryKeys.forUser(userId);

  return useMutation({
    mutationFn: (imdbId: string) => removeFromLibrarySvc(userId, imdbId),
    onMutate: async (imdbId: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LibraryItem[]>(key);
      queryClient.setQueryData<LibraryItem[]>(key, (old) =>
        (old ?? []).filter((i) => i.imdb_id !== imdbId)
      );
      return { previous };
    },
    onError: (_err, _imdbId, context) => {
      if (context?.previous)
        queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
