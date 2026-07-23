# CineCurator Product & Engineering Roadmap

This document outlines the strategic vision, feature roadmap, and architectural milestones for **CineCurator**.

---

## 🎯 Strategic Vision

CineCurator aims to become the premier open-source AI movie discovery engine, combining sub-millisecond vector search performance with cinematic visual design and resilient multi-tier fallback architecture.

---

## 🚩 Milestone Overview

```text
  Phase 1: Foundation (COMPLETED)   ➔   Phase 2: Hybrid ML (IN PROGRESS)   ➔   Phase 3: Community & Social (PLANNED)
 ┌───────────────────────────────┐     ┌───────────────────────────────┐      ┌──────────────────────────────────┐
 │ • Next.js 14 App Router       │     │ • Hybrid Vector Embeddings    │      │ • Public Shareable Watchlists    │
 │ • FastAPI Microservice        │     │ • WebAssembly Client Search   │      │ • Collaborative Watch Parties    │
 │ • TF-IDF + Cosine Similarity  │     │ • Multi-Language Metadata     │      │ • Custom AI Taste Profiles       │
 │ • 4-Tier Resilient Fallback   │     │ • Instant Offline Search      │      │ • Native Mobile Apps (React)     │
 └───────────────────────────────┘     └───────────────────────────────┘      └──────────────────────────────────┘
```

---

## 📅 Roadmap Schedule

### Q3 2026 — Phase 2: Hybrid ML & Performance (Current Focus)
- [x] **Sub-Millisecond Vector Search:** Implement `np.argpartition` top-K matrix lookup in FastAPI backend.
- [x] **Global Cinematic Trailer Player:** React `createPortal` modal with 16:9 YouTube iframe embedding.
- [ ] **Dense Embedding Models:** Integrate sentence-transformers (e.g., `all-MiniLM-L6-v2`) for semantic plot understanding alongside TF-IDF keyword vectorization.
- [ ] **Client-Side WASM Fallback:** Compile TF-IDF vector search to WebAssembly (Rust/Pyodide) for 100% offline recommendations in browser.
- [ ] **Multi-Select Filtering:** Allow filtering recommendations by release decade, minimum IMDb rating, and content maturity rating.

### Q4 2026 — Phase 3: Personalization & Social Discovery
- [ ] **Hybrid Collaborative Filtering:** Combine user library bookmarks with content similarity to produce personalized daily recommendation feeds.
- [ ] **Shareable Movie Playlists:** Allow users to export and share custom movie collections via unique URLs (e.g., `/library/share/xyz`).
- [ ] **Streaming Availability Badges:** Display real-time streaming provider badges (Netflix, Prime Video, HBO Max, Disney+) using JustWatch / TMDB provider APIs.
- [ ] **Visual Graph Network:** Interactive node graph visualizing movie similarity relationships using D3.js / Canvas.

### Q1 2027 — Phase 4: Platform Expansion & Ecosystem
- [ ] **GraphQL API Endpoint:** Expose a unified GraphQL endpoint for third-party developers.
- [ ] **Mobile Applications:** React Native cross-platform mobile companion app for iOS and Android.
- [ ] **TV OS Support:** Smart TV browser-optimized navigation controls for Apple TV and Android TV.

---

## 💡 Suggesting New Features

Have an idea for CineCurator? Submit a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml) or join the conversation in [GitHub Discussions](https://github.com/Shivanshu85/Cinecurator/discussions).
