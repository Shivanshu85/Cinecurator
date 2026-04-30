"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  showDetails?: boolean;
  onMouseEnter?: () => void;
}

export default function MovieCard({
  movie,
  showDetails = true,
  onMouseEnter,
}: MovieCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (movie.imdbID && !movie.imdbID.startsWith("tmdb_")) {
      router.push(`/movie/${movie.imdbID}`);
    } else if (movie.tmdbId) {
      router.push(`/movie/tmdb_${movie.tmdbId}`);
    }
  };

  return (
    <div
      className="group cursor-pointer"
      style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3 border border-white/10 shadow-2xl hover:-translate-y-2 transition-transform duration-500">
        <Image
          src={movie.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Hover overlay with rating */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          {movie.rating && movie.rating !== "N/A" && (
            <span className="bg-primary-container text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
              ⭐ {movie.rating}
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <>
          <h3 className="font-headline font-semibold text-on-surface group-hover:text-primary transition-colors truncate text-sm">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-on-surface-variant opacity-70 font-medium truncate">
              {movie.genre?.split(",")[0] || "Movie"}{movie.year ? ` • ${movie.year}` : ""}
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-[#e5e2e1]/60 hover:text-primary transition-colors flex items-center gap-0.5 ml-2 shrink-0">
              OPEN
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
