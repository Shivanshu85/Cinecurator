# Changelog

All notable changes to the **CineCurator** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-07-23

### Added
- **Global Cinematic Trailer System:** Implemented unified `TrailerProvider` context and React `createPortal` modal displaying 16:9 YouTube trailers over blurred backdrop.
- **Thick White Border & Inside X Controls:** Custom 4px solid white border framing responsive trailer player with top-right circular close button.
- **TMDB Video Resolution:** Added automatic TMDB `/movie/{id}/videos` key lookup with fallback to YouTube Data API search.
- **Render & Vercel Production Readiness:** Standardized CORS origin handling and production environment configurations.
- **OpenGraph Social Cards:** Integrated custom OpenGraph and Twitter card meta properties across Next.js layout metadata.

### Changed
- Refactored Watch Trailer triggers on Landing Page (`MovieCardFeatured.tsx`) and Movie Details page (`/movie/[id]/page.tsx`) to consume the global `useTrailer()` hook.
- Enhanced layout backdrop blur tokens to `backdrop-blur-xl` for cinematic focus.

### Fixed
- Fixed trailer modal z-index layer stacking context bug using React `document.body` DOM portal.
- Fixed trailer modal layout auto-fullscreen bug by enforcing viewport width (`max-w-4xl`) and height (`max-h-[80vh]`) constraints.
- Fixed player backdrop click closing bug to guarantee YouTube play/pause/seek controls do not dismiss trailer.

---

## [1.1.0] - 2026-07-15

### Added
- **TanStack React Query Integration:** Implemented client-side query caching (`staleTime: 5 mins`, `gcTime: 30 mins`) for genre movies and recommendations.
- **Zustand State Store:** Integrated `useLibraryStore` and `useMovieStore` for global library state management.
- **Supabase Authentication Portal:** Added Google OAuth and Email/Password authentication flow with persistent Supabase PostgreSQL library tables.
- **Movie Details Page:** Created `/movie/[id]` route featuring backdrop imagery, cast lists, ratings, and synopsis overviews.

### Security
- Configured Supabase Row Level Security (RLS) policies enforcing `auth.uid() = user_id`.

---

## [1.0.0] - 2026-06-01

### Added
- **Initial Release of CineCurator:** AI-Powered Content-Based Movie Recommendation Engine.
- **FastAPI Microservice:** Python backend powered by Scikit-Learn TF-IDF vectorizer and Cosine Similarity matrix calculations.
- **Next.js 14 App Router Frontend:** Modern cinema-inspired dark UI powered by Tailwind CSS.
- **4-Tier Fallback System:** Resilient recommendation engine (FastAPI ML ➔ TMDB Proxy ➔ Client TMDB ➔ Local Genre Pool).
