# Developer Getting Started Guide

This guide provides step-by-step instructions to clone, configure, and run **CineCurator** locally on your development machine.

---

## 🛠️ Prerequisites

Ensure your system meets the following software requirements:

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.17.0` | `20.x` (LTS) |
| **npm** | `>= 9.0.0` | `10.x` |
| **Python** | `>= 3.10.0` | `3.11.x` |
| **Git** | `>= 2.30.0` | Latest |

---

## 📦 1. Repository Setup

```bash
# Clone repository
git clone https://github.com/Shivanshu85/Cinecurator.git
cd Cinecurator

# Copy environment template for frontend
cp .env.example .env.local
```

---

## 💻 2. Frontend Setup (Next.js 14)

Install Node.js dependencies:

```bash
npm install
```

Configure your `.env.local` file with appropriate API keys:

```env
# Server-Side API Keys (Isolated from Client Bundle)
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Client-Facing Environment Keys
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend FastAPI Microservice URL
NEXT_PUBLIC_ML_SERVICE_URL=http://127.0.0.1:8000
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend application will be running at `http://localhost:3000`.

---

## 🐍 3. Backend Setup (FastAPI ML Service)

Navigate to the `ml-service` directory and set up a virtual environment:

```bash
cd ml-service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI development server with Uvicorn
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI microservice will be running at `http://127.0.0.1:8000`.
You can view Interactive OpenAPI Swagger documentation at `http://127.0.0.1:8000/docs`.

---

## 🧪 4. Verifying Installation

1. Open `http://localhost:3000` in your web browser.
2. Type a movie title into the hero search input (e.g., *"Inception"* or *"The Dark Knight"*).
3. Verify that recommendations load instantly from the local FastAPI service (`http://127.0.0.1:8000/recommend`).
4. Click **Watch Trailer** on any movie card to verify YouTube trailer modal playback.
