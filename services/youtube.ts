import axios from "axios";
import { apiClient, isTmdbOffline } from "@/lib/apiClient";

const TMDB_BASE = "https://api.themoviedb.org/3";
const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

function getTmdbApiKey() {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || "";
}

function getYouTubeApiKey() {
  return process.env.YOUTUBE_API_KEY || "";
}

/**
 * Resolves an official YouTube video key from TMDB by movie ID.
 */
export async function fetchTMDBVideoKey(tmdbId: number): Promise<string | null> {
  if (isTmdbOffline || !tmdbId) return null;
  try {
    const { data } = await apiClient.get(`${TMDB_BASE}/movie/${tmdbId}/videos`, {
      params: { api_key: getTmdbApiKey() },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results || []).filter((v: any) => v.site === "YouTube");
    if (results.length === 0) return null;

    // Preference: 1. Official Trailer -> 2. Trailer -> 3. Official Teaser -> 4. Teaser -> 5. Any video
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const officialTrailer = results.find((v: any) => v.type === "Trailer" && v.official);
    if (officialTrailer) return officialTrailer.key;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trailer = results.find((v: any) => v.type === "Trailer");
    if (trailer) return trailer.key;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const officialTeaser = results.find((v: any) => v.type === "Teaser" && v.official);
    if (officialTeaser) return officialTeaser.key;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teaser = results.find((v: any) => v.type === "Teaser");
    if (teaser) return teaser.key;

    return results[0]?.key || null;
  } catch {
    return null;
  }
}

/**
 * Main trailer resolver trying TMDB video API first, then YouTube Data API if key present.
 */
export async function resolveYouTubeKey(
  title: string,
  year?: string,
  tmdbId?: number
): Promise<string | null> {
  if (tmdbId) {
    const key = await fetchTMDBVideoKey(tmdbId);
    if (key) return key;
  }

  const ytKey = getYouTubeApiKey();
  if (ytKey) {
    try {
      const query = `${title} ${year || ""} official trailer`;
      const { data } = await axios.get(`${YOUTUBE_BASE}/search`, {
        params: {
          key: ytKey,
          q: query,
          part: "snippet",
          type: "video",
          maxResults: 1,
          videoCategoryId: "1",
        },
      });

      const videoId = data.items?.[0]?.id?.videoId;
      if (videoId) return videoId;
    } catch {
      // Fall through if YouTube API fails
    }
  }

  return null;
}

/**
 * Fallback to opening YouTube search in a new tab if no embeddable trailer key can be resolved.
 */
export function openYouTubeSearchFallback(title: string, year?: string) {
  const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
  window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank", "noopener,noreferrer");
}

export async function getTrailerUrl(title: string, year?: string): Promise<string | null> {
  const key = await resolveYouTubeKey(title, year);
  if (key) return `https://www.youtube.com/watch?v=${key}`;
  const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
