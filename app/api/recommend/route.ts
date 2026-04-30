import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://media.themoviedb.org/t/p";
const TMDB_KEY = process.env.TMDB_API_KEY || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTmdb(m: any) {
  return {
    imdbID: `tmdb_${m.id}`,
    title: m.title,
    year: m.release_date?.split("-")[0] || "",
    genre: "",
    poster: m.poster_path
      ? `${TMDB_IMAGE}/w500${m.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Poster",
    rating: m.vote_average?.toFixed(1) || "N/A",
    plot: m.overview,
    tmdbId: m.id,
    backdropPath: m.backdrop_path
      ? `${TMDB_IMAGE}/w1280${m.backdrop_path}`
      : undefined,
  };
}

/**
 * POST /api/recommend
 * Body: { title: string, imdbID?: string, tmdbId?: number }
 * Returns similar movies from TMDB (used as ML fallback from the client)
 */
export async function POST(request: NextRequest) {
  const { title, tmdbId } = await request.json();

  if (!TMDB_KEY) {
    return NextResponse.json({ error: "TMDB key not configured" }, { status: 500 });
  }

  try {
    let movieTmdbId = tmdbId;

    // If no tmdbId provided, search by title
    if (!movieTmdbId && title) {
      const searchRes = await fetch(
        `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&include_adult=false`,
        { next: { revalidate: 3600 } }
      );
      const searchData = await searchRes.json();
      movieTmdbId = searchData.results?.[0]?.id;
    }

    if (!movieTmdbId) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get similar movies
    const simRes = await fetch(
      `${TMDB_BASE}/movie/${movieTmdbId}/similar?api_key=${TMDB_KEY}&page=1`,
      { next: { revalidate: 3600 } }
    );
    const simData = await simRes.json();
    const recommendations = (simData.results || []).slice(0, 10).map(mapTmdb);

    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("Recommend API error:", err);
    return NextResponse.json({ recommendations: [] });
  }
}
