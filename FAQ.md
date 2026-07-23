# Frequently Asked Questions (FAQ)

This document answers the most common architectural, operational, and development questions regarding **CineCurator**.

---

## 💡 General Questions

### What is CineCurator?
CineCurator is an open-source, AI-powered movie recommendation platform. It combines a high-performance Python FastAPI machine learning microservice (TF-IDF & Cosine Similarity) with a Next.js 14 App Router frontend to deliver instant movie recommendations with sub-50ms latency.

### Is CineCurator free and open-source?
Yes! CineCurator is 100% open-source and released under the MIT License. You are free to host, fork, customize, and deploy it for personal or commercial use.

---

## 🤖 Machine Learning & Recommendation Engine

### How does the recommendation algorithm work?
CineCurator uses a **Content-Based Filtering** model:
1. Movie titles, plot summaries, genres, and metadata are converted into high-dimensional numerical vectors using **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization.
2. Pairwise **Cosine Similarity** matrix scores are computed across the dataset.
3. When a user searches for a movie (e.g., *"Inception"*), the backend calculates the nearest spatial vector neighbors using NumPy `np.argpartition` and returns the top-K candidate titles.

### What happens if the FastAPI ML backend goes down?
CineCurator incorporates a **4-Tier Resilient Fallback Architecture**:
1. **Tier 1:** Python FastAPI ML microservice (Primary, ~3.15ms).
2. **Tier 2:** Next.js Serverless TMDB API Proxy (Fallback 1).
3. **Tier 3:** Client-side Direct TMDB API Fetch (Fallback 2).
4. **Tier 4:** Embedded Local Genre Pool (Fallback 3).

If Tier 1 fails or times out (5000ms limit), the frontend seamlessly transitions to Tier 2/3/4 without throwing an error to the user.

---

## 🚀 Deployment & Operations

### Where should I deploy CineCurator?
- **Frontend (Next.js):** Vercel (Recommended), Netlify, or Docker.
- **Backend (FastAPI ML):** Render (Recommended), Railway, AWS ECS, or Fly.io.
- **Database (Auth & Library):** Supabase PostgreSQL.

### What API keys are required?
CineCurator requires:
- `NEXT_PUBLIC_TMDB_API_KEY` / `TMDB_API_KEY` (Free from [TMDB](https://www.themoviedb.org/documentation/api))
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Free from [Supabase](https://supabase.com))
- `OMDB_API_KEY` (Optional, free from [OMDb](http://www.omdbapi.com/))
- `YOUTUBE_API_KEY` (Optional, for trailer fallback search)

---

## 🔐 Security & Privacy

### Are my API keys safe in production?
Yes. Server-side API keys (`TMDB_API_KEY`, `OMDB_API_KEY`, `YOUTUBE_API_KEY`) are stored in server-only environment variables and are never bundled into client-side JavaScript. Public keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) use restricted Supabase Row Level Security (RLS).
