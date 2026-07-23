# Testing & Quality Assurance Strategy

## 🧪 Testing Overview

CineCurator incorporates testing and verification procedures across both the Next.js frontend and Python FastAPI backend to guarantee production reliability.

---

## 🛠️ 1. Frontend Build & Type Validation

Run TypeScript static analysis and Next.js production compilation checks:

```bash
# Type check and build verification
npm run build
```

Key checks executed during build:
- TypeScript strict compiler validation (`tsconfig.json`)
- React Hook dependency rules
- Next.js serverless route build trace optimization
- Static page generation for `/`, `/auth`, `/library`, `/recommendations`

---

## 🐍 2. Backend FastAPI Tests

Navigate to `ml-service` and run Python health probes and unit tests:

```bash
cd ml-service

# Verify health check endpoint
curl -s http://127.0.0.1:8000/health | grep '"status":"ok"'

# Test recommendation output for 'Inception'
curl -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"title": "Inception", "n": 5}'
```

---

## ⚡ 3. Latency & Performance Benchmark Commands

You can test recommendation response latencies using `curl` or Apache Bench (`ab`):

```bash
# Inspect Server-Timing header
curl -i -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"title": "Interstellar", "n": 10}' | grep -i "Server-Timing"
```

Expected output:
```http
Server-Timing: total;dur=3.15
```
