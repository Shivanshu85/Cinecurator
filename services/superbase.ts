import { createClient } from "@/lib/supabase/client";
import type { LibraryItem, Movie } from "@/types/movie";

const LOCAL_STORAGE_LIBRARY_KEY = "cinecurator_local_library";

function getLocalLibraryItems(userId: string): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_LIBRARY_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLibraryItems(userId: string, items: LibraryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_LIBRARY_KEY}_${userId}`, JSON.stringify(items));
  } catch {}
}

export async function addToLibrary(userId: string, movie: Movie): Promise<boolean> {
  // Always update local storage backup first
  const current = getLocalLibraryItems(userId);
  const newItem: LibraryItem = {
    id: `lib_${movie.imdbID}_${Date.now()}`,
    user_id: userId,
    imdb_id: movie.imdbID,
    title: movie.title,
    poster: movie.poster,
    rating: movie.rating,
    year: movie.year,
    genre: movie.genre,
    created_at: new Date().toISOString(),
  };

  const filtered = current.filter((item) => item.imdb_id !== movie.imdbID);
  setLocalLibraryItems(userId, [newItem, ...filtered]);

  try {
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
  } catch {
    return true; // Return true as local library fallback succeeded
  }
}

export async function removeFromLibrary(userId: string, imdbId: string): Promise<boolean> {
  const current = getLocalLibraryItems(userId);
  const updated = current.filter((item) => item.imdb_id !== imdbId);
  setLocalLibraryItems(userId, updated);

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("library")
      .delete()
      .eq("user_id", userId)
      .eq("imdb_id", imdbId);
    return !error;
  } catch {
    return true;
  }
}

export async function getLibrary(userId: string): Promise<LibraryItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) return data as LibraryItem[];
  } catch {}

  return getLocalLibraryItems(userId);
}

export async function isInLibrary(userId: string, imdbId: string): Promise<boolean> {
  const local = getLocalLibraryItems(userId);
  if (local.some((item) => item.imdb_id === imdbId)) return true;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("library")
      .select("id")
      .eq("user_id", userId)
      .eq("imdb_id", imdbId)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function getSeenSuggestions(userId: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("seen_suggestions")
      .select("movie_ids")
      .eq("user_id", userId)
      .single();
    return data?.movie_ids || [];
  } catch {
    return [];
  }
}

export async function recordSeenSuggestions(userId: string, movieIds: string[]): Promise<void> {
  try {
    const supabase = createClient();
    const existing = await getSeenSuggestions(userId);
    const merged = Array.from(new Set([...existing, ...movieIds]));

    await supabase.from("seen_suggestions").upsert({
      user_id: userId,
      movie_ids: merged,
      updated_at: new Date().toISOString(),
    });
  } catch {}
}
