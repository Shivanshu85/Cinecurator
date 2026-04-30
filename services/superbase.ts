import { createClient } from "@/lib/supabase/client";
import type { LibraryItem, Movie } from "@/types/movie";

export async function addToLibrary(userId: string, movie: Movie): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("library").upsert({
    user_id: userId,
    imdb_id: movie.imdbID,
    title: movie.title,
    poster: movie.poster,
    rating: movie.rating,
    year: movie.year,
    genre: movie.genre,
  });
  return !error;
}

export async function removeFromLibrary(userId: string, imdbId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("library")
    .delete()
    .eq("user_id", userId)
    .eq("imdb_id", imdbId);
  return !error;
}

export async function getLibrary(userId: string): Promise<LibraryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("library")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as LibraryItem[];
}

export async function isInLibrary(userId: string, imdbId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("library")
    .select("id")
    .eq("user_id", userId)
    .eq("imdb_id", imdbId)
    .single();
  return !!data;
}

export async function getSeenSuggestions(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("seen_suggestions")
    .select("movie_ids")
    .eq("user_id", userId)
    .single();
  return data?.movie_ids || [];
}

export async function recordSeenSuggestions(userId: string, movieIds: string[]): Promise<void> {
  const supabase = createClient();
  const existing = await getSeenSuggestions(userId);
  const merged = Array.from(new Set([...existing, ...movieIds]));

  await supabase.from("seen_suggestions").upsert({
    user_id: userId,
    movie_ids: merged,
    updated_at: new Date().toISOString(),
  });
}
