# CineCurator — Production Deployment Guide 🚀

This document outlines the step-by-step procedure for deploying **CineCurator** to production using **Vercel** for the Next.js frontend and **Render / Railway** for the Python FastAPI Machine Learning microservice.

---

## 🏗️ Production Architecture Overview

```text
USER (Browser)
    │
    ▼
VERCEL EDGE / CDN (Next.js 14 App Router)
    │
    ├──► Supabase PostgreSQL & Auth (Watchlist & Auth Sessions)
    ├──► TMDB & OMDb External APIs (Metadata & Images)
    └──► Python FastAPI ML Service (Render / Railway)
```

---

## 1. Deploy the Python ML Microservice (Render / Railway)

### Option A: Deploying on Render (Recommended Free/Starter Hosting)
1. Log in to [Render.com](https://render.com/).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository (`Shivanshu85/Cinecurator`).
4. Set the **Root Directory** to `ml-service`.
5. Select environment **Python 3**.
6. Set **Build Command**: `pip install -r requirements.txt`
7. Set **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
8. Add Environment Variable:
   - `ALLOWED_ORIGINS` = `*` (or your Vercel URL `https://cinecurator.vercel.app`)
9. Click **Create Web Service**.
10. Copy your deployed service URL (e.g. `https://cinecurator-ml-api.onrender.com`).

---

## 2. Configure Supabase Dashboard for Production Auth

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** ➔ **URL Configuration**.
3. Set **Site URL** to your Vercel production domain:
   `https://cinecurator.vercel.app`
4. Add the following to **Redirect URLs**:
   - `https://cinecurator.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback` (For Vercel Preview Deployments)
   - `http://localhost:3000/auth/callback` (For local testing)

---

## 3. Deploy the Next.js Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository (`Shivanshu85/Cinecurator`).
3. Select Framework Preset: **Next.js** (Root directory: `./`).
4. Expand **Environment Variables** and add the following:

| Variable Name | Environment | Value Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | `your-supabase-anon-key` |
| `TMDB_API_KEY` | Production, Preview, Dev | `your-tmdb-api-key` |
| `NEXT_PUBLIC_TMDB_API_KEY` | Production, Preview, Dev | `your-tmdb-api-key` |
| `OMDB_API_KEY` | Production, Preview, Dev | `your-omdb-api-key` |
| `NEXT_PUBLIC_ML_API_URL` | Production, Preview, Dev | `https://cinecurator-ml-api.onrender.com` |

5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

- [x] Open your Vercel production domain (`https://cinecurator.vercel.app`).
- [x] Verify movie search & recommendations load within `< 5ms`.
- [x] Test Sign In / Sign Up with Supabase Auth.
- [x] Add a movie to your Personal Watchlist / Library.
- [x] Play movie trailers and check poster image loads.
