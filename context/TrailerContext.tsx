"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { resolveYouTubeKey, openYouTubeSearchFallback } from "@/services/youtube";
import { findTMDBByImdbId } from "@/services/tmdb";

export interface TrailerTarget {
  title: string;
  year?: string;
  tmdbId?: number;
  imdbID?: string;
}

interface TrailerContextType {
  openTrailer: (target: TrailerTarget) => Promise<void>;
  closeTrailer: () => void;
  isLoading: boolean;
  isOpen: boolean;
}

const TrailerContext = createContext<TrailerContextType | undefined>(undefined);

export function TrailerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("");

  const closeTrailer = useCallback(() => {
    setIsOpen(false);
    setVideoKey(null);
    setActiveTitle("");
  }, []);

  const openTrailer = useCallback(async (target: TrailerTarget) => {
    if (!target.title) return;
    setIsLoading(true);
    setActiveTitle(target.title);

    let tmdbId = target.tmdbId;

    // If no tmdbId provided, but we have an imdbID, resolve TMDB ID
    if (!tmdbId && target.imdbID && !target.imdbID.startsWith("tmdb_")) {
      try {
        const tmdbData = await findTMDBByImdbId(target.imdbID);
        if (tmdbData?.id) tmdbId = tmdbData.id;
      } catch {
        // Fall through
      }
    } else if (!tmdbId && target.imdbID && target.imdbID.startsWith("tmdb_")) {
      const parsed = parseInt(target.imdbID.replace("tmdb_", ""), 10);
      if (!isNaN(parsed)) tmdbId = parsed;
    }

    const key = await resolveYouTubeKey(target.title, target.year, tmdbId);
    setIsLoading(false);

    if (key) {
      setVideoKey(key);
      setIsOpen(true);
    } else {
      // Fallback: Open YouTube search in new tab if no embed key could be resolved
      openYouTubeSearchFallback(target.title, target.year);
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeTrailer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeTrailer]);

  return (
    <TrailerContext.Provider value={{ openTrailer, closeTrailer, isLoading, isOpen }}>
      {children}

      {/* ─── GLOBAL CINEMATIC TRAILER MODAL ─── */}
      {isOpen && videoKey && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-8 bg-black/85 backdrop-blur-md md:backdrop-blur-lg transition-all duration-300"
          onClick={closeTrailer}
        >
          {/* Player Container with 16:9 Aspect Ratio, Thick White Border & Strongly Rounded Corners */}
          <div
            className="relative w-full max-w-[94vw] sm:max-w-[90vw] md:max-w-5xl aspect-video max-h-[80vh] sm:max-h-[82vh] md:max-h-[85vh] rounded-2xl md:rounded-3xl border-4 border-white shadow-2xl shadow-black/90 overflow-hidden bg-black flex items-center justify-center transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Circular Close Button */}
            <button
              onClick={closeTrailer}
              aria-label="Close trailer"
              className="absolute top-3 right-3 md:top-4 md:right-4 z-50 bg-black/80 text-white hover:bg-[#e50914] hover:scale-110 active:scale-95 rounded-full p-2.5 flex items-center justify-center transition-all border-2 border-white/40 shadow-lg group cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">close</span>
            </button>

            {/* YouTube Iframe Embed */}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&enablejsapi=1`}
              title={`${activeTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 rounded-xl"
            />
          </div>
        </div>
      )}
    </TrailerContext.Provider>
  );
}

export function useTrailer() {
  const context = useContext(TrailerContext);
  if (!context) {
    throw new Error("useTrailer must be used within a TrailerProvider");
  }
  return context;
}
