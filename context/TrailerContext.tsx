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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl transition-all duration-300"
        >
          {/* Centered 16:9 Player Wrapper with Thick White Border & Strongly Rounded Corners */}
          <div className="relative w-full max-w-4xl max-h-[75vh] flex flex-col items-end">
            
            {/* Top-Right Circular X Close Button (Positioned safely above/outside iframe) */}
            <button
              onClick={closeTrailer}
              aria-label="Close trailer"
              className="mb-3 bg-white/10 hover:bg-[#e50914] text-white hover:scale-110 active:scale-95 rounded-full p-2.5 flex items-center justify-center transition-all border-2 border-white/80 shadow-2xl cursor-pointer group"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">close</span>
            </button>

            {/* 16:9 Responsive Video Container */}
            <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl border-4 border-white shadow-2xl shadow-black/95 overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&enablejsapi=1`}
                title={`${activeTitle} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 rounded-xl"
              />
            </div>

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
