"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      {/* ─── GLOBAL CINEMATIC TRAILER MODAL (PORTAL TO DOCUMENT.BODY) ─── */}
      {isOpen && videoKey && mounted && createPortal(
        <div
          id="trailer-modal-portal"
          style={{ isolation: "isolate" }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl transition-all duration-300"
        >
          {/* SINGLE RESPONSIVE TRAILER CONTAINER BOX WITH THICK WHITE BORDER, ROUNDED CORNERS & INSIDE X BUTTON */}
          <div
            className="relative w-full max-w-4xl max-h-[80vh] aspect-video rounded-2xl md:rounded-3xl border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden bg-black flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-Right Circular X Close Button (Positioned safely inside the top-right corner of the box) */}
            <button
              onClick={closeTrailer}
              aria-label="Close trailer"
              className="absolute top-3 right-3 md:top-4 md:right-4 z-50 bg-black/80 hover:bg-[#e50914] text-white hover:scale-110 active:scale-95 rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all border-2 border-white shadow-2xl cursor-pointer pointer-events-auto"
            >
              <span className="material-symbols-outlined text-lg md:text-xl font-bold">close</span>
            </button>

            {/* YouTube Iframe Embed */}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&enablejsapi=1`}
              title={`${activeTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>,
        document.body
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
