# REST API & Microservice Specification

## 🌐 OpenAPI Specification & Endpoint Reference

CineCurator exposes REST endpoints across two service layers:
1. **FastAPI Machine Learning Microservice (`ml-service`)**
2. **Next.js Serverless API Proxies (`app/api/*`)**

---

## 🐍 1. FastAPI ML Backend Microservice

### Base URL
- Development: `http://127.0.0.1:8000`
- Production (Render): `https://cinecurator-ml.onrender.com`

---

### `GET /` — Health & Metadata Status
Returns service operational status and pre-loaded dataset count.

**Response `200 OK`:**
```json
{
  "service": "CineCurator ML API",
  "status": "running",
  "version": "1.0.0",
  "ready": true,
  "movie_count": 4803
}
```

---

### `GET /health` — Health Check Probe
Used by Render and load balancers for container health checks.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "ready": true,
  "movie_count": 4803
}
```

---

### `POST /recommend` — Generate ML Recommendations
Calculates cosine similarity candidates for a query movie title.

**Request Body (`application/json`):**
```json
{
  "title": "Inception",
  "n": 10
}
```

**Response `200 OK`:**
```json
{
  "recommendations": [
    "Interstellar",
    "The Dark Knight",
    "Prestige",
    "Memento",
    "Shutter Island",
    "Source Code",
    "Minority Report",
    "Looper",
    "Tenet",
    "Matrix"
  ],
  "source": "ml"
}
```

**Response `404 Not Found`:**
```json
{
  "detail": "Movie 'NonExistentTitle' not found in dataset"
}
```

---

## ⚡ 2. Next.js Serverless Route Proxies

### Base URL
- Development: `http://localhost:3000/api`
- Production (Vercel): `https://cinecurator.vercel.app/api`

---

### `POST /api/recommend` — Unified Recommendation Proxy
Coordinates the 4-Tier fallback engine. Tries FastAPI ML backend first, then TMDB Proxy, Direct Fetch, and Local Genre Pool.

**Request Body (`application/json`):**
```json
{
  "title": "Inception"
}
```

**Response `200 OK`:**
```json
{
  "movie": {
    "title": "Inception",
    "year": "2010",
    "rating": "8.8",
    "poster": "https://image.tmdb.org/t/p/w500/ljsZTCHZqrmToJ0y9v8yQIYj5y8.jpg",
    "genre": "Action, Science Fiction, Adventure",
    "overview": "Cobb, a skilled thief who commits corporate espionage..."
  },
  "recs": [
    {
      "title": "Interstellar",
      "year": "2014",
      "rating": "8.6",
      "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "genre": "Science Fiction, Drama",
      "tmdbId": 157336
    }
  ],
  "source": "ml"
}
```
