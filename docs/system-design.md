# System Design & Data Flow Specifications

## 📌 Component Map

CineCurator is organized into modular subsystems:

```text
CineCurator System
 ├── Frontend Layer (Next.js 14 App Router)
 │    ├── Route Handlers (/app/api/*)
 │    ├── State Store (/store/useMovieStore.ts, /store/useLibraryStore.ts)
 │    ├── Data Queries (/hooks/queries/* via TanStack Query)
 │    ├── UI Components (/components/*)
 │    └── Global Contexts (/context/TrailerContext.tsx)
 │
 ├── Machine Learning Layer (FastAPI Microservice)
 │    ├── ASGI App Server (Uvicorn / app.py)
 │    ├── Vector Recommender Engine (/ml-service/model/recommender.py)
 │    └── Pre-computed Datasets & Pickle Models (/ml-service/data/*)
 │
 └── Persistence Layer (Supabase PostgreSQL)
      ├── Authentication Service (OAuth / Email Password)
      └── Row-Level Security Tables (public.user_library)
```

---

## 🔁 State Management Architecture

CineCurator uses a two-tier state strategy:

### 1. Client UI & Interactivity (Zustand)
- `useMovieStore`: Manages current search queries, selected genres, and active filter criteria.
- `useLibraryStore`: Manages client-side optimistic bookmark state and library item counting.
- `useTrailer`: Manages global trailer modal open/close states, video keys, and portal mounting.

### 2. Asynchronous Server State (TanStack React Query)
- `useRecommendationsMutation`: Manages POST recommendation requests with loading, error, and fallback states.
- `useGenreMovies`: Caches genre collections per active genre tab (`action`, `drama`, `sci-fi`, etc.).
- `useMovie`: Fetches single movie metadata and cast details by IMDb ID or TMDB ID.

---

## 🌐 API Security & Environment Boundary

To protect proprietary API keys and maintain client safety, CineCurator enforces strict environment isolation:

```text
CLIENT ENVIRONMENT (Public / Browser)
 ├── NEXT_PUBLIC_SUPABASE_URL (Public URL)
 ├── NEXT_PUBLIC_SUPABASE_ANON_KEY (RLS Protected Public Key)
 └── NEXT_PUBLIC_ML_SERVICE_URL (Public API Backend URL)

SERVER ENVIRONMENT (Private / Isolated)
 ├── TMDB_API_KEY (Server API Key)
 ├── OMDB_API_KEY (Server API Key)
 ├── YOUTUBE_API_KEY (Server API Key)
 └── ALLOWED_ORIGINS (CORS Allowed Domain Whitelist)
```
