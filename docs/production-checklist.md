# Production Deployment Checklist

This document provides a pre-flight audit checklist to verify that **CineCurator** is 100% production-ready for deployment on Vercel and Render.

---

## 🎯 Pre-Flight Readiness Matrix

### 🌐 Vercel Frontend Checklist
- [x] **Build Verification:** `npm run build` completes cleanly with 0 TypeScript/lint errors.
- [x] **Environment Variables:** `TMDB_API_KEY`, `OMDB_API_KEY`, `YOUTUBE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ML_SERVICE_URL` configured on Vercel Dashboard.
- [x] **Custom Headers:** Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`) defined in `next.config.mjs` / `vercel.json`.
- [x] **OpenGraph Meta Cards:** Social banner properties (`metadataBase`, `openGraph`, `twitter`) defined in `app/layout.tsx`.
- [x] **DOM Portal Modals:** Trailer modal uses React `createPortal` to prevent layout stacking bugs.

---

### 🐍 Render FastAPI ML Backend Checklist
- [x] **Runtime Configuration:** Python 3.11 runtime configured via `render.yaml` / `Procfile`.
- [x] **Gunicorn/Uvicorn Workers:** `Procfile` uses `uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2`.
- [x] **CORS Origin Whitelist:** `ALLOWED_ORIGINS` includes production Vercel URL.
- [x] **Health Check Path:** Render health check path set to `/health`.
- [x] **Lifespan Initialization:** Pre-trained TF-IDF vector matrix loads asynchronously at startup.

---

### 🗄️ Supabase PostgreSQL Checklist
- [x] **Row Level Security:** RLS enabled on `public.user_library` table (`auth.uid() = user_id`).
- [x] **OAuth Redirects:** Production domain added to Supabase Authentication URL Configuration.
- [x] **Database Indexing:** Unique constraint index on `(user_id, imdb_id)`.
