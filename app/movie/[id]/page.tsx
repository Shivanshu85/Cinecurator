"use client";

import { use } from "react";
import Image from "next/image";
import { useMovie } from "@/hooks/queries/useMovie";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary, useAddToLibrary, useRemoveFromLibrary } from "@/hooks/queries/useLibrary";
import MovieCard from "@/components/MovieCard";

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const decodedId = decodeURIComponent(resolvedParams.id);
  
  const { user } = useAuth();
  
  const { data: library = [] } = useLibrary(user?.id ?? null);
  const addToLibrary = useAddToLibrary(user?.id ?? "");
  const removeFromLibrary = useRemoveFromLibrary(user?.id ?? "");
  
  const isInLibrary = library.some((item) => item.imdb_id === decodedId);

  const { data: movie, isLoading, error } = useMovie(decodedId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
          <p className="text-white/60 font-medium">Loading masterpiece...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e]">
        <h1 className="text-3xl text-white">Movie not found</h1>
      </div>
    );
  }

  const handleLibraryToggle = () => {
    if (!user) {
      alert("Please sign in to add to your library.");
      return;
    }
    if (isInLibrary) {
      removeFromLibrary.mutate(movie.imdbID);
    } else {
      addToLibrary.mutate(movie);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] pb-20">
      {/* ─── BACKDROP & HERO ─── */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-[#0e0e0e]">
          {movie.backdropPath && (
            <Image
              src={movie.backdropPath}
              alt={movie.title}
              fill
              className="object-cover opacity-30"
              priority
              unoptimized
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 md:px-8 pb-12 w-full flex flex-col md:flex-row gap-8 md:items-end">
            {/* Poster */}
            <div className="w-48 md:w-64 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 mx-auto md:mx-0">
              <Image
                src={movie.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
                alt={movie.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Details */}
            <div className="flex flex-col text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                {movie.year && (
                  <span className="text-primary-container font-black tracking-tight text-lg">
                    {movie.year}
                  </span>
                )}
                {movie.rating && movie.rating !== "N/A" && (
                  <span className="bg-white/10 text-white text-sm font-bold px-3 py-1 rounded backdrop-blur-sm">
                    ⭐ {movie.rating}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black text-white mb-4 tracking-tight leading-tight">
                {movie.title}
              </h1>
              <p className="text-on-surface-variant text-base md:text-lg mb-6 max-w-3xl line-clamp-3">
                {movie.plot}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  onClick={handleLibraryToggle}
                  disabled={addToLibrary.isPending || removeFromLibrary.isPending}
                  className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    isInLibrary
                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      : "bg-primary-container text-white hover:bg-[#ff0b1a] shadow-primary-container/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isInLibrary ? "bookmark_added" : "bookmark_add"}
                  </span>
                  {isInLibrary ? "In Library" : "Add to Library"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── GENRES & CAST ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-headline font-bold text-white mb-4">Synopsis</h2>
              <p className="text-white/70 text-lg leading-relaxed">{movie.plot}</p>
            </section>
            
            {movie.genre && (
              <section>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.split(", ").map((g) => (
                    <span key={g} className="px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-sm font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* Cast Sidebar */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-headline font-bold text-white mb-4">Top Cast</h2>
              <div className="space-y-4">
                {movie.cast.map((actor) => (
                  <div key={actor.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0 bg-white/10">
                      {actor.profilePath ? (
                        <Image src={actor.profilePath} alt={actor.name} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-white/50">person</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{actor.name}</h4>
                      <p className="text-white/60 text-xs">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── SIMILAR MOVIES ─── */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 mt-8 border-t border-white/10">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-white mb-8">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movie.similar.slice(0, 10).map((m) => (
              <MovieCard key={m.imdbID} movie={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
