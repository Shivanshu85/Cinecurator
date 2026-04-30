"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryStore } from "@/store/useLibraryStore";

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { library, isLoading, fetchLibrary, removeFromLibrary } = useLibraryStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    if (user) {
      fetchLibrary(user.id);
    }
  }, [user, loading, router, fetchLibrary]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] bg-surface-container-high rounded-xl animate-pulse mb-3" />
              <div className="h-3.5 bg-surface-container-high rounded animate-pulse w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tighter text-white mb-3">
            My Library
          </h1>
          <div className="h-1.5 w-32 bg-primary-container rounded-full mb-4" />
          <p className="text-on-surface-variant opacity-70 text-base">
            Your personal collection of saved films.{" "}
            {library.length > 0 && (
              <span className="text-primary font-semibold">{library.length} movies saved.</span>
            )}
          </p>
        </div>

        {/* Empty state */}
        {library.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <span className="material-symbols-outlined text-8xl text-on-surface-variant opacity-20">
              video_library
            </span>
            <h2 className="text-2xl font-headline font-bold text-white opacity-60">
              Your library is empty
            </h2>
            <p className="text-on-surface-variant opacity-50 text-center max-w-sm">
              Search for movies on the home page and click &ldquo;Add to Library&rdquo; to save them here.
            </p>
            <Link
              href="/"
              className="bg-primary-container text-white px-8 py-3 rounded-lg font-bold hover:bg-[#ff0b1a] transition-colors mt-2"
            >
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
            {library.map((item) => (
              <div key={item.id} className="group relative">
                {/* Poster */}
                <Link
                  href={`/movie/${item.imdb_id}`}
                  className="block"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3 border border-white/10 shadow-xl hover:-translate-y-1 transition-transform duration-300">
                    <Image
                      src={item.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                    {/* Remove button overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (user) await removeFromLibrary(user.id, item.imdb_id);
                        }}
                        className="bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#ff0b1a] transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </Link>

                <h3 className="font-headline font-semibold text-on-surface truncate text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
                  {item.genre?.split(",")[0] || "Movie"}{item.year ? ` • ${item.year}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
