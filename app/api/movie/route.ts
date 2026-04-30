import { NextRequest, NextResponse } from "next/server";

const OMDB_BASE = "https://www.omdbapi.com";
const API_KEY = process.env.OMDB_API_KEY || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMovie(data: any) {
  return {
    imdbID: data.imdbID || "",
    title: data.Title || "",
    year: data.Year || "",
    genre: data.Genre || "",
    poster:
      data.Poster && data.Poster !== "N/A"
        ? data.Poster
        : "https://via.placeholder.com/300x450?text=No+Poster",
    rating: data.imdbRating || "N/A",
    runtime: data.Runtime || "",
    plot: data.Plot || "",
    director: data.Director || "",
    actors: data.Actors || "",
    language: data.Language || "",
    country: data.Country || "",
    awards: data.Awards || "",
    type: data.Type || "movie",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const id = searchParams.get("id");
  const search = searchParams.get("s");

  if (!API_KEY) {
    return NextResponse.json({ error: "OMDb API key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({ apikey: API_KEY, plot: "full" });

  if (id) params.set("i", id);
  else if (title) params.set("t", title);
  else if (search) {
    params.set("s", search);
    params.set("type", "movie");
    params.delete("plot");
  } else {
    return NextResponse.json({ error: "Provide title, id, or s param" }, { status: 400 });
  }

  try {
    const res = await fetch(`${OMDB_BASE}?${params.toString()}`, {
      next: { revalidate: 3600 }, // cache 1 hour
    });
    const data = await res.json();

    if (data.Response === "False") {
      return NextResponse.json({ error: data.Error || "Not found" }, { status: 404 });
    }

    // Search returns a list
    if (search) {
      const results = (data.Search || []).map((m: any) => // eslint-disable-line
        mapMovie({ ...m, imdbRating: "N/A", Plot: "", Director: "" })
      );
      return NextResponse.json({ results });
    }

    return NextResponse.json(mapMovie(data));
  } catch (err) {
    console.error("OMDb API error:", err);
    return NextResponse.json({ error: "OMDb fetch failed" }, { status: 502 });
  }
}
