import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/tmdb-image?path=/abc.jpg&size=w342
 * Proxies TMDB images server-side to bypass ISP blocks on image.tmdb.org
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const size = searchParams.get("size") || "w342";

  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const tmdbUrl = `https://media.themoviedb.org/t/p/${size}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(tmdbUrl, {
      next: { revalidate: 86400 }, // cache 24 hours
      headers: { "User-Agent": "CineCurator/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
