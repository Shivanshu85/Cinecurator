import type { Movie } from "@/types/movie";
import { internalClient } from "@/lib/apiClient";

// All OMDb calls go through our server-side /api/movie route so the API key stays secret
const API_BASE = "/api/movie";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMovie(data: any): Movie {
  return data; // Already mapped server-side
}

export async function fetchMovieByTitle(title: string): Promise<Movie | null> {
  try {
    const { data } = await internalClient.get(API_BASE, {
      params: { title },
    });
    if (data?.error) return null;
    return mapMovie(data);
  } catch {
    return null;
  }
}

export async function fetchMovieById(imdbId: string): Promise<Movie | null> {
  try {
    const { data } = await internalClient.get(API_BASE, {
      params: { id: imdbId },
    });
    if (data?.error) return null;
    return mapMovie(data);
  } catch {
    return null;
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const { data } = await internalClient.get(API_BASE, {
      params: { s: query },
    });
    return data?.results || [];
  } catch {
    return [];
  }
}
