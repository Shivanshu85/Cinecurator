"use client";

import { useEffect, useState } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { fetchMoviesByGenre } from "@/services/tmdb";
import MovieCard from "@/components/MovieCard";
import SkeletonCard from "@/components/SkeletonCard";
import type { Genre, Movie } from "@/types/movie";
import { GENRE_TMDB_IDS } from "@/types/movie";
import axios from "axios";

const ALL_GENRES: { id: Genre; label: string }[] = [
  { id: "action", label: "Action" },
  { id: "drama", label: "Drama" },
  { id: "horror", label: "Horror" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "comedy", label: "Comedy" },
  { id: "thriller", label: "Thriller" },
  { id: "romance", label: "Romance" },
  { id: "animation", label: "Animation" },
];

const TMDB_BASE = "https://api.themoviedb.org/3";

function proxyTmdb(path: string, size: string) {
  return `/api/tmdb-image?path=${encodeURIComponent(path)}&size=${size}`;
}

async function fetchPopularMovies(page = 1): Promise<Movie[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
    const { data } = await axios.get(`${TMDB_BASE}/movie/popular`, {
      params: { api_key: apiKey, page },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).slice(0, 24).map((m: any) => ({
      imdbID: `tmdb_${m.id}`,
      title: m.title,
      year: m.release_date?.split("-")[0] || "",
      genre: "",
      poster: m.poster_path
        ? proxyTmdb(m.poster_path, "w342")
        : "https://via.placeholder.com/300x450?text=No+Poster",
      rating: m.vote_average?.toFixed(1) || "N/A",
      plot: m.overview,
      tmdbId: m.id,
      backdropPath: m.backdrop_path
        ? proxyTmdb(m.backdrop_path, "w1280")
        : undefined,
    }));
  } catch {
    return [];
  }
}

export default function RecommendationsPage() {
  const { recommendations } = useMovieStore();
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "year">("rating");

  // Load popular movies once for the "All" tab fallback
  useEffect(() => {
    async function load() {
      setLoading(true);
      const movies = await fetchPopularMovies(1);
      setPopularMovies(movies);
      setLoading(false);
    }
    load();
  }, []);

  // Load genre-specific movies when a genre tab is clicked
  useEffect(() => {
    if (genre === "all") {
      setGenreMovies([]);
      return;
    }
    async function load() {
      setLoading(true);
      const movies = await fetchMoviesByGenre(GENRE_TMDB_IDS[genre as Genre], 1);
      setGenreMovies(movies);
      setLoading(false);
    }
    load();
  }, [genre]);

  // Determine which movies to display
  const displayMovies =
    genre === "all"
      ? recommendations.length > 0
        ? recommendations
        : popularMovies
      : genreMovies;

  const sorted = [...displayMovies].sort((a, b) => {
    if (sortBy === "rating") return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    return parseInt(b.year || "0") - parseInt(a.year || "0");
  });

  const isAllTabWithPopular = genre === "all" && recommendations.length === 0;

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        {/* Header */}
        <section className="mb-10">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-3 text-on-background">
            {isAllTabWithPopular ? "Popular Movies" : "Best Recommendations"}
          </h1>
          <p className="text-base font-medium text-on-surface-variant/80 max-w-2xl mb-8 leading-relaxed">
            {isAllTabWithPopular
              ? "Today's most-watched films from around the world — or search a movie on the home page for personalised picks."
              : "An expertly curated selection of cinema that pushes boundaries — hand-picked for the discerning viewer."}
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                Filter By Genre
              </span>
              <button
                onClick={() => setGenre("all")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  genre === "all"
                    ? "bg-primary-container text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                All
              </button>
              {ALL_GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    genre === g.id
                      ? "bg-primary-container text-white"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "year")}
                className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-sm font-medium border border-white/5 outline-none cursor-pointer"
              >
                <option value="rating">Rating</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </section>

        {/* Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            <SkeletonCard count={12} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <span className="material-symbols-outlined text-8xl text-on-surface-variant opacity-20">
              search_off
            </span>
            <h2 className="text-2xl font-headline font-bold text-white opacity-50">
              No movies found
            </h2>
            <p className="text-on-surface-variant opacity-40 text-center">
              Try selecting a different genre or search for a movie on the home page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
            {sorted.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
