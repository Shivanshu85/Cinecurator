import axios from "axios";

const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey() {
  return process.env.YOUTUBE_API_KEY || "";
}

export async function getTrailerUrl(title: string, year?: string): Promise<string | null> {
  try {
    const query = `${title} ${year || ""} official trailer`;
    const { data } = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: {
        key: getApiKey(),
        q: query,
        part: "snippet",
        type: "video",
        maxResults: 1,
        videoCategoryId: "1",
      },
    });

    const videoId = data.items?.[0]?.id?.videoId;
    if (!videoId) return null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {
    // Fallback: YouTube search URL
    const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
    return `https://www.youtube.com/results?search_query=${q}`;
  }
}
