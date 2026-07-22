# Vercel Deployment Checklist 📋

Use this checklist to ensure 100% production readiness before pushing to Vercel.

## 1. Build & Compilation Verification
- [x] Clean install succeeds (`npm ci` / `npm install`)
- [x] TypeScript typecheck passes (`npx tsc --noEmit`)
- [x] Production build passes (`npm run build`)
- [x] Strict Mode enabled without `ignoreBuildErrors`
- [x] Zero hardcoded `localhost` URLs in production paths

## 2. Environment Variables & Security
- [x] `NEXT_PUBLIC_SUPABASE_URL` configured
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [x] `TMDB_API_KEY` configured (server-side)
- [x] `OMDB_API_KEY` configured (server-side)
- [x] `NEXT_PUBLIC_ML_API_URL` configured (HTTPS backend)
- [x] `.env.local` excluded in `.gitignore`
- [x] `.env.example` template provided

## 3. Python ML Microservice (Render / Railway)
- [x] `Procfile` present (`uvicorn app:app --host 0.0.0.0 --port $PORT`)
- [x] `render.yaml` blueprint present
- [x] `requirements.txt` pinned and verified
- [x] CORS middleware supports production origins (`ALLOWED_ORIGINS`)
- [x] Lightweight `/health` endpoint returns process & model status

## 4. Supabase & Auth Configuration
- [x] Production Site URL configured in Supabase Dashboard
- [x] `/auth/callback` added to Redirect URLs
- [x] RLS policies enabled for user watchlist tables
- [x] Local storage backup active for fail-safe session storage

## 5. Next.js & Asset Optimization
- [x] `next.config.mjs` configures remote patterns for TMDB and OMDb images
- [x] `app/api/tmdb-image` provides server-side image proxying & RAM caching
- [x] `lib/serverCache.ts` LRU cache handles API response deduplication
- [x] `lib/apiClient.ts` provides HTTP/HTTPS connection pooling (`keepAlive`)
- [x] `vercel.json` provides security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`)

## 6. End-to-End Smoke Tests
- [x] Hero discovery & search bar working
- [x] AI Recommendation engine returning top matching films
- [x] Movie detail pages loading cast, synopsis & trailers
- [x] Authentication (Email/Password & Google) working
- [x] Personal Watchlist saving & removing movies cleanly
