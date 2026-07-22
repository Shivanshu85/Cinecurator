import { NextRequest, NextResponse } from "next/server";
import { tmdbImageCache } from "@/lib/serverCache";

/**
 * GET /api/tmdb-image?path=/abc.jpg&size=w342
 * Proxies & caches TMDB images server-side with in-memory RAM caching
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const size = searchParams.get("size") || "w342";

  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const cacheKey = `img_${size}_${path}`;
  const cachedImage = tmdbImageCache.get(cacheKey);

  if (cachedImage) {
    return new NextResponse(cachedImage.body, {
      status: 200,
      headers: {
        "Content-Type": cachedImage.contentType,
        "Cache-Control": "public, max-age=31536000, immutable, stale-while-revalidate=86400",
        "X-Cache": "HIT",
      },
    });
  }

  const tmdbUrl = `https://media.themoviedb.org/t/p/${size}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(tmdbUrl, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "CineCurator/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const body = await res.arrayBuffer();

    // Cache in RAM for instant sub-millisecond future responses
    tmdbImageCache.set(cacheKey, { body, contentType });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable, stale-while-revalidate=86400",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
