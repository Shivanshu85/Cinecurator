# Diagnostic & Troubleshooting Guide

This guide provides solutions for common technical issues encountered during development or production deployment of **CineCurator**.

---

## 🔍 Common Issues & Fixes

### 1. "Failed to Fetch" or CORS Error on API Calls

**Symptom:** Browser console logs `Access to fetch at 'https://...' has been blocked by CORS policy`.

**Cause:** The FastAPI ML microservice on Render does not allow the frontend origin domain.

**Solution:**
1. Check `ALLOWED_ORIGINS` environment variable on Render.
2. Ensure your Vercel deployment URL (e.g., `https://cinecurator.vercel.app`) is included:
   ```env
   ALLOWED_ORIGINS=https://cinecurator.vercel.app,http://localhost:3000
   ```
3. Restart the Render web service.

---

### 2. Slow Initial Recommendation Request (FastAPI Cold Start)

**Symptom:** The first search query takes 15–30 seconds to return recommendations on free-tier Render deployments.

**Cause:** Render free tier spins down idle containers after 15 minutes of inactivity.

**Solution:**
- CineCurator's **4-Tier Fallback System** automatically detects backend timeouts (> 5000ms) and seamlessly serves recommendations via Tier 2 (TMDB Proxy) while the Render service wakes up in the background.
- For zero cold starts, upgrade Render to a starter instance ($7/mo) or configure a UptimeRobot ping pinging `GET /health` every 10 minutes.

---

### 3. Missing TMDB Poster Images

**Symptom:** Movie cards display fallback placeholder images (`https://via.placeholder.com/300x450`).

**Cause:** `TMDB_API_KEY` is missing or invalid in environment variables.

**Solution:**
1. Verify `TMDB_API_KEY` is defined in `.env.local` (local) and Vercel Environment Variables (production).
2. Test key validity:
   ```bash
   curl -s "https://api.themoviedb.org/3/movie/550?api_key=YOUR_API_KEY"
   ```

---

### 4. Supabase Authentication Callback Failure

**Symptom:** Google OAuth or Email Sign-In fails to redirect back to `/auth/callback`.

**Cause:** Missing Site URL or Redirect URL configuration in Supabase Dashboard.

**Solution:**
1. Open Supabase Dashboard ➔ Authentication ➔ URL Configuration.
2. Set **Site URL** to `https://cinecurator.vercel.app`.
3. Add `https://cinecurator.vercel.app/auth/callback` to **Redirect URLs**.
