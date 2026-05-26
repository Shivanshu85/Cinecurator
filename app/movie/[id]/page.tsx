"use client";

import Image from "next/image";
import { useMovie } from "@/hooks/queries/useMovie";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary, useAddToLibrary, useRemoveFromLibrary } from "@/hooks/queries/useLibrary";

export default function MoviePage({ params }: { params: { id: string } }) {
  const decodedId = decodeURIComponent(params.id);
  
  const { user } = useAuth();
  
  const { data: library = [] } = useLibrary(user?.id ?? null);
  const addToLibrary = useAddToLibrary(user?.id ?? "");
  const removeFromLibrary = useRemoveFromLibrary(user?.id ?? "");
  
  const isInLibrary = library.some((item) => item.imdb_id === decodedId);

  const { data: movie, isLoading, error } = useMovie(decodedId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131313]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
          <p className="text-white/60 font-medium">Loading masterpiece...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131313]">
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

  const genres = movie.genre?.split(",").map(g => g.trim()) || ["Movie"];
  const cast = movie.cast || [];

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen w-full selection:bg-primary-container selection:text-white pb-20">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[80vh] md:h-[921px] w-full overflow-hidden flex items-end pb-24">
        <div className="absolute inset-0 z-0">
          <img 
             className="w-full h-full object-cover" 
             alt={movie.title} 
             src={movie.backdropPath || movie.poster || "https://via.placeholder.com/1280x720?text=No+Backdrop"} 
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, #131313 0%, rgba(19, 19, 19, 0.4) 50%, rgba(19, 19, 19, 0.8) 100%)" }}></div>
        </div>
        <div className="relative z-10 px-6 md:px-10 max-w-5xl">
          <div className="flex flex-wrap gap-3 mb-6">
            {genres.slice(0, 2).map((genre) => (
              <span key={genre} className="px-3 py-1 bg-[#464747]/50 text-[#e9bcb6] text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                {genre}
              </span>
            ))}
            {movie.year && (
              <span className="px-3 py-1 bg-[#464747]/50 text-[#e9bcb6] text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                {movie.year}
              </span>
            )}
            {movie.rating && movie.rating !== "N/A" && (
              <span className="px-3 py-1 bg-[#e50914] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                Rating: {movie.rating}
              </span>
            )}
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 text-[#e5e2e1] leading-tight">
            {movie.title}
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="bg-[#e50914] text-[#fff7f6] px-10 py-4 font-headline font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all duration-200">
              Watch Trailer
            </button>
            <button 
              onClick={handleLibraryToggle}
              disabled={addToLibrary.isPending || removeFromLibrary.isPending}
              className={`border border-[#5e3f3b] text-[#e5e2e1] px-10 py-4 font-headline font-bold text-sm tracking-widest uppercase active:scale-95 transition-all duration-200 ${
                isInLibrary ? "bg-[#353534]/80 hover:bg-[#353534]" : "hover:bg-[#2a2a2a]"
              }`}
            >
              {isInLibrary ? "In Library" : "Add to Library"}
            </button>
          </div>
        </div>
      </section>

      {/* ─── ABOUT / SYNOPSIS SECTION ─── */}
      <section className="mt-[60px] md:mt-[100px] px-6 md:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
            <img 
              className="w-full h-full object-cover" 
              alt={movie.title} 
              src={movie.poster || "https://via.placeholder.com/600x900?text=No+Poster"} 
            />
          </div>
          <div className="md:col-span-8 flex flex-col justify-center h-full">
            <h2 className="font-headline text-xs font-bold uppercase tracking-[0.3em] text-[#ffb4aa] mb-6">
              Synopsis
            </h2>
            <p className="text-[#e9bcb6] text-lg md:text-xl leading-relaxed font-light font-body">
              {movie.plot}
            </p>
            <div className="mt-12 flex flex-wrap gap-8">
              {movie.year && (
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-[#ffb4aa] font-bold mb-1">
                    Release Year
                  </span>
                  <span className="text-[#e5e2e1] font-medium">
                    {movie.year}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#ffb4aa] font-bold mb-1">
                  Production
                </span>
                <span className="text-[#e5e2e1] font-medium">
                  CineCurator Network
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRINCIPAL CAST ─── */}
      {cast.length > 0 && (
        <section className="mt-[80px] md:mt-[100px] px-6 md:px-10 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-headline text-xs font-bold uppercase tracking-[0.3em] text-[#ffb4aa]">
                Principal Cast
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {cast.slice(0, 5).map((actor) => (
                <div key={actor.id} className="relative group overflow-hidden rounded-xl bg-[#201f1f]">
                  <img 
                    className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={actor.name} 
                    src={actor.profilePath || "https://via.placeholder.com/400x500?text=Actor"} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                    <h3 className="font-headline font-bold text-sm md:text-lg text-white line-clamp-1">
                      {actor.name}
                    </h3>
                    <p className="text-[#ffb4aa] text-[9px] md:text-[10px] uppercase font-bold tracking-widest line-clamp-1">
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
