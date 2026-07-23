# CineCurator — Technical Project Overview

## 📌 Introduction

**CineCurator** is an open-source, production-grade movie recommendation engine designed to eliminate decision paralysis in digital cinema streaming. The application integrates high-dimensional machine learning (TF-IDF Vectorization & Cosine Similarity) with a modern, cinema-inspired web interface built on Next.js 14 App Router and Tailwind CSS.

---

## 🎯 Core Engineering Objectives

1. **Sub-50ms Recommendation Latency:** Utilize pre-computed sparse TF-IDF matrices and NumPy array slicing (`np.argpartition`) to generate top-10 candidate movie lists in **< 5 ms** backend execution time.
2. **100% Recommendation Uptime:** Implement a **4-Tier Resilient Fallback System** that gracefully degrades across ML Microservice ➔ TMDB API Proxy ➔ Direct Client Fetch ➔ Local Genre Pools under backend network failure or rate limits.
3. **Cinematic Visual Experience:** Provide a rich dark UI with responsive postering, glassmorphism, dynamic YouTube trailer modals, and persistent user watchlists via Supabase PostgreSQL.

---

## 🧱 High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                   React 18 / Next.js App Router                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │   Next.js API Proxies     │           │   Supabase Auth / DB      │
    │  (/api/recommend, /movie) │           │  (PostgreSQL + RLS)       │
    └────────────┬──────────────┘           └───────────────────────────┘
                 │
                 ▼
    ┌───────────────────────────┐
    │ FastAPI ML Microservice   │
    │ (TF-IDF + Cosine Matrix)  │
    └───────────────────────────┘
```

---

## 📚 Technical Documentation Index

For detailed architectural and implementation specifications, explore the following documentation modules:

- 🚀 **[Getting Started Guide](getting-started.md):** Local setup and environment configurations.
- ⚙️ **[System Architecture](architecture.md):** Detailed 4-tier fallback design and sequence diagrams.
- 🎨 **[Frontend Architecture](frontend.md):** Next.js App Router, TanStack Query, and Zustand state.
- 🐍 **[Backend Architecture](backend.md):** Python FastAPI microservice structure and lifecycle.
- 🧠 **[Recommendation Engine](recommendation-engine.md):** Mathematical formulas & TF-IDF vector matrix matching.
- 🔌 **[API Specifications](api.md):** REST endpoint definitions for frontend and backend.
- 🗄️ **[Database Architecture](database.md):** Supabase PostgreSQL schemas and Row Level Security.
- 🧪 **[Testing Strategy](testing.md):** Unit testing, API validation, and production benchmarks.
- 🛠️ **[Troubleshooting Matrix](troubleshooting.md):** Solutions for CORS, timeouts, and API fallbacks.
- 📋 **[Production Readiness Checklist](production-checklist.md):** Vercel & Render deployment standards.
