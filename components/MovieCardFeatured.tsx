"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Movie } from "@/types/movie";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTrailer } from "@/context/TrailerContext";

interface MovieCardFeaturedProps {
  movie: Movie;
  badge?: string;
  alternateBackground?: boolean;
  onMouseEnter?: () => void;
}

export default function MovieCardFeatured({
  movie,
  badge = "Featured",
  alternateBackground = false,
  onMouseEnter,
}: MovieCardFeaturedProps) {

  const router = useRouter();
  const { user } = useAuth();
  const { addToLibrary, isInLibrary } = useLibraryStore();
  const { openTrailer, isLoading: loadingTrailer } = useTrailer();
  const [addedToLib, setAddedToLib] = useState(false);
  const inLibrary = isInLibrary(movie.imdbID);

  const handleWatchTrailer = () => {
    openTrailer({
      title: movie.title,
      year: movie.year,
      tmdbId: movie.tmdbId,
      imdbID: movie.imdbID,
    });
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (inLibrary || addedToLib) return;
    await addToLibrary(user.id, movie);
    setAddedToLib(true);
  };

  const genres = movie.genre?.split(",").slice(0, 2) || [];

  return (
    <section
      className={`${alternateBackground ? "bg-surface-container-lowest" : "bg-[#131313]"} py-16`}
      onMouseEnter={onMouseEnter}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Poster */}
        <div className="lg:col-span-5">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-container/20 blur-3xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
            <div
              className="relative z-10 rounded-2xl overflow-hidden shadow-[0_64px_96px_rgba(0,0,0,0.6)] border border-white/10 cursor-pointer"
              onClick={() =>
                router.push(
                  movie.imdbID.startsWith("tmdb_")
                    ? `/movie/${movie.imdbID}`
                    : `/movie/${movie.imdbID}`
                )
              }
            >
              <Image
                src={movie.tmdbPoster || movie.poster}
                alt={`${movie.title} Poster`}
                width={400}
                height={400}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-7 pt-2">
          {/* Genre badges */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {genres.map((g) => (
              <span
                key={g}
                className="bg-surface-container-highest/60 backdrop-blur-md text-on-surface text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10"
              >
                {g.trim()}
              </span>
            ))}
            <span className="bg-primary-container text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary-container/20">
              {badge}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-headline font-extrabold tracking-tighter leading-tight text-white text-4xl md:text-5xl mb-5">
            {movie.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-on-surface/80 mb-7">
            {movie.rating && movie.rating !== "N/A" && (
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-primary-container text-lg">⭐</span>
                <span className="text-white font-bold">{movie.rating}</span>
                <span className="opacity-40 font-normal">/ 10</span>
              </div>
            )}
            {movie.runtime && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">schedule</span>
                <span>{movie.runtime}</span>
              </div>
            )}
            {movie.year && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">calendar_today</span>
                <span>{movie.year}</span>
              </div>
            )}
          </div>

          {/* Plot */}
          {movie.plot && (
            <p className="text-base leading-relaxed text-on-surface-variant max-w-2xl font-normal mb-8 opacity-90 line-clamp-4">
              {movie.plot}
            </p>
          )}

          {/* Director / Budget / Revenue */}
          {movie.director && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 py-5 mb-8">
              <div className="sm:border-r border-white/10 sm:pr-4 mb-3 sm:mb-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-extrabold opacity-60">
                  Director
                </p>
                <p className="text-base font-headline font-bold text-white">
                  {movie.director.split(",")[0]}
                </p>
              </div>
              {movie.actors && (
                <div className="sm:col-span-2 sm:pl-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-extrabold opacity-60">
                    Stars
                  </p>
                  <p className="text-sm font-body text-white line-clamp-1">
                    {movie.actors.split(",").slice(0, 3).join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleWatchTrailer}
              disabled={loadingTrailer}
              className="bg-primary-container text-white px-8 py-3.5 rounded-lg font-bold flex items-center gap-2.5 hover:bg-[#ff0b1a] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-primary-container/20 flex-1 justify-center disabled:opacity-70"
            >
              <span className="material-symbols-outlined">play_circle</span>
              {loadingTrailer ? "Loading..." : "Watch Trailer"}
            </button>
            <button
              onClick={handleAddToLibrary}
              className={`px-8 py-3.5 rounded-lg font-bold flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 flex-1 justify-center border-2 ${
                inLibrary || addedToLib
                  ? "bg-surface-container border-primary-container text-primary-container"
                  : "bg-transparent border-white/20 text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined">
                {inLibrary || addedToLib ? "check_circle" : "library_add"}
              </span>
              {inLibrary || addedToLib ? "In Library" : "Add to Library"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
