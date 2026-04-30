"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MovieCard from "@/components/MovieCard";
import MovieCardFeatured from "@/components/MovieCardFeatured";
import SkeletonCard, { SkeletonFeatured } from "@/components/SkeletonCard";
import HeroPosterMosaic from "@/components/HeroPosterMosaic";
import { useMovieStore } from "@/store/useMovieStore";
import { useTopSuggestions } from "@/hooks/queries/useTopSuggestions";
import { useGenreMovies, usePrefetchGenre } from "@/hooks/queries/useGenreMovies";
import { useRecommendationsMutation } from "@/hooks/queries/useRecommendations";
import { usePrefetchMovie } from "@/hooks/queries/usePrefetchMovie";
import type { Genre } from "@/types/movie";

const GENRES: { id: Genre; label: string; color: string }[] = [
  { id: "action", label: "ACTION", color: "from-primary-container/80" },
  { id: "drama", label: "DRAMA", color: "from-blue-600/60" },
  { id: "horror", label: "HORROR", color: "from-red-900/80" },
  { id: "sci-fi", label: "SCI-FI", color: "from-cyan-600/60" },
  { id: "comedy", label: "COMEDY", color: "from-yellow-600/60" },
  { id: "thriller", label: "THRILLER", color: "from-purple-800/60" },
];

const GENRE_IMAGE_URLS: Record<Genre, string> = {
  action: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
  drama: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop",
  horror: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
  "sci-fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  comedy: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=800&auto=format&fit=crop",
  thriller: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop",
  romance: "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?q=80&w=800&auto=format&fit=crop",
  animation: "https://images.unsplash.com/photo-1627856013091-fed6e4e048c7?q=80&w=800&auto=format&fit=crop",
};

export default function HomePage() {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useMovieStore();
  const [selectedGenre, setSelectedGenre] = useState<Genre>("action");

  // –– TanStack Query hooks ––
  const suggestionsQuery = useTopSuggestions(user?.id ?? null);
  const genreQuery = useGenreMovies(selectedGenre);
  const prefetchGenre = usePrefetchGenre();
  const prefetchMovie = usePrefetchMovie();
  const recMutation = useRecommendationsMutation();

  const recommendations = recMutation.data?.recs ?? [];
  const searchedMovie = recMutation.data?.movie ?? null;
  const isRecLoading = recMutation.isPending;

  const recommend = () => {
    if (!searchQuery.trim()) return;
    recMutation.mutate(searchQuery.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") recommend();
  };

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <header className="relative w-full h-[95vh] flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Netflix-style poster mosaic background */}
        <HeroPosterMosaic />

        {/* Content */}
        <div className="relative z-10 max-w-4xl fade-in">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-4 text-white leading-tight">
            Find your next cinematic masterpiece
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-4 text-white/90">
            AI-powered recommendations based on the movies you love.
          </p>
          <p className="text-lg md:text-xl mb-10 text-white/70 font-light">
            What&apos;s one of your favorite movies? We&apos;ll curate the perfect list for you.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl mx-auto">
            <div className="w-full relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a movie you love..."
                className="w-full bg-black/40 border border-white/30 text-white rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none backdrop-blur-md transition-all text-lg"
              />
            </div>
            <button
              onClick={recommend}
              disabled={isRecLoading}
              className="w-full sm:w-auto whitespace-nowrap bg-primary-container text-white text-lg px-8 py-4 rounded-xl font-bold hover:bg-[#ff0b1a] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary-container/20 disabled:opacity-70"
            >
              {isRecLoading ? (
                <>
                  <span className="animate-spin material-symbols-outlined">autorenew</span>
                  Loading...
                </>
              ) : (
                <>
                  Recommend
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    auto_awesome
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── BEST RECOMMENDATIONS SECTION ─── */}
      {(recommendations.length > 0 || isRecLoading) && (
        <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto fade-in">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold mb-2 text-white">
                {searchedMovie
                  ? `Because you like "${searchedMovie.title}"`
                  : "Best Recommendations are..."}
              </h2>
              <div className="h-1.5 w-32 bg-primary-container rounded-full" />
            </div>
            {recommendations.length > 0 && (
              <a
                href="/recommendations"
                className="text-[#e5e2e1]/70 font-medium flex items-center gap-1 hover:text-white transition-colors text-sm"
              >
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {isRecLoading ? (
              <SkeletonCard count={5} />
            ) : (
              recommendations.slice(0, 10).map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onMouseEnter={() => prefetchMovie(movie.title)}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* ─── TOP MOVIE SUGGESTION SECTION ─── */}
      <div id="top-suggestions" className="mt-16 mb-6 px-6 md:px-8 max-w-7xl mx-auto scroll-mt-24">
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-white mb-2 tracking-tight">
          Top{" "}
          <span className="text-[#e5e2e1]/90">Movie Suggestion</span>
        </h2>
        <div className="h-1.5 w-32 bg-primary-container rounded-full mb-4" />
        <p className="text-on-surface-variant text-base md:text-lg font-medium opacity-70">
          Discover the world&apos;s trending masterpieces curated just for you.
        </p>
      </div>

      {suggestionsQuery.isLoading ? (
        <>
          <SkeletonFeatured />
          <SkeletonFeatured />
        </>
      ) : (
        (suggestionsQuery.data ?? []).map((movie, idx) => (
          <MovieCardFeatured
            key={movie.imdbID}
            movie={movie}
            badge={idx === 0 ? "Featured" : "Top Pick"}
            alternateBackground={idx % 2 === 1}
          />
        ))
      )}

      {/* ─── GENRE SECTION ─── */}
      <section id="genres" className="py-20 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold mb-2 text-white">
                Best Recommendations by Genre
              </h2>
              <div className="h-1.5 w-32 bg-primary-container rounded-full mb-3" />
              <p className="text-on-surface-variant opacity-70 text-sm">
                Filtered by your favorite cinematic archetypes
              </p>
            </div>
          </div>

          {/* Genre Chips */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
            {GENRES.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => setSelectedGenre(id)}
                onMouseEnter={() => prefetchGenre(id)}
                className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border transition-all ${
                  selectedGenre === id
                    ? "border-primary-container ring-2 ring-primary-container/50"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                <img
                  src={GENRE_IMAGE_URLS[id]}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${color} via-black/20 to-black/40 flex items-center justify-center`}
                >
                  <span className="text-xs font-headline font-black tracking-[0.2em] text-white">
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Genre Movie Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {genreQuery.isLoading ? (
              <SkeletonCard count={4} />
            ) : (genreQuery.data ?? []).length === 0 ? (
              <div className="col-span-4 text-center py-16 text-on-surface-variant opacity-50">
                No movies found for this genre.
              </div>
            ) : (
              (genreQuery.data ?? []).slice(0, 8).map((movie) => (
                <div
                  key={movie.imdbID}
                  className="bg-surface-container rounded-2xl overflow-hidden border border-white/5 group card-hover shadow-xl cursor-pointer"
                  onMouseEnter={() => prefetchMovie(movie.title)}
                  onClick={() =>
                    window.location.assign(`/movie/${movie.imdbID}`)
                  }
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={movie.backdropPath || movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-headline font-bold text-base mb-1.5 text-white group-hover:text-primary transition-colors">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 opacity-70 mb-3">
                      {movie.plot || "A cinematic masterpiece."}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-container font-black tracking-tighter text-sm">
                        {movie.year}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                        DETAILS
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
