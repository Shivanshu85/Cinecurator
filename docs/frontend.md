# Frontend Architecture Guide (Next.js 14)

## 🎨 Technology Stack

- **Framework:** Next.js 14.2.29 (App Router)
- **Library:** React 18
- **Language:** TypeScript 5.x
- **Styling:** Vanilla CSS & Tailwind CSS (Dark Cinematic Theme)
- **Data Fetching:** TanStack React Query v5
- **State Management:** Zustand v4
- **Icons & Fonts:** Google Material Symbols & Google Fonts Inter

---

## 📁 Directory Structure Overview

```text
app/
 ├── api/                       # Next.js Serverless Route Handlers
 │    ├── movie/route.ts        # Single Movie Metadata Proxy
 │    ├── recommend/route.ts    # Recommendation Engine Proxy
 │    └── tmdb-image/route.ts   # TMDB High-Res Image Proxy
 ├── auth/                      # Supabase Auth Portal & Callback
 ├── library/                   # User Saved Movie Library & Watchlist
 ├── movie/[id]/                # Cinematic Movie Details Page
 ├── recommendations/           # Complete Recommendation Grid View
 ├── globals.css                # Master CSS Design Tokens & Animations
 └── layout.tsx                 # Root Layout with Query & Trailer Providers

components/
 ├── Footer.tsx                 # Footer with Links & Disclaimer
 ├── HeroPosterMosaic.tsx       # Netflix-style Animated Background Grid
 ├── MovieCard.tsx              # Standard Responsive Poster Card
 ├── MovieCardFeatured.tsx      # Hero Spotlight Movie Card with Trailer Trigger
 ├── Navbar.tsx                 # Navigation Bar with Auth Status
 ├── QueryProvider.tsx          # React Query Context Provider
 └── SkeletonCard.tsx           # Skeleton Loaders for UX Skeletons
```

---

## 🎬 Global Cinematic Trailer Modal

The trailer player component (`context/TrailerContext.tsx`) utilizes React `createPortal` to render directly onto `document.body`. This architectural choice provides three key advantages:

1. **Zero Stacking Context Leakage:** Prevents background section cards (`transform`, `blur-3xl`, `z-index`) from overlapping the player.
2. **Strict Aspect Ratio:** Enforces a 16:9 (`aspect-video`) container bounded by viewport width (`max-w-4xl`) and height (`max-h-[80vh]`).
3. **Clean Audio Cleanup:** Immediately unmounts the YouTube iframe on close to terminate video and audio streams instantly.
