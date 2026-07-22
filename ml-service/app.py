import os
import time
import logging
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel, Field  # type: ignore
from model.recommender import MovieRecommender  # type: ignore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cinecurator_ml")

recommender = MovieRecommender()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load and initialize TF-IDF recommender at startup."""
    start_time = time.perf_counter()
    logger.info("Initializing CineCurator ML Recommender engine...")
    try:
        recommender.load()
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.info(f"Recommender loaded successfully with {recommender.movie_count} movies in {elapsed_ms:.2f} ms")
    except Exception as e:
        logger.warning(f"Could not load pre-trained recommender: {e}. Will train on first request.")
    yield
    logger.info("Shutting down CineCurator ML API")


app = FastAPI(
    title="CineCurator ML API",
    description="Production-grade Content-based movie recommendation microservice powered by TF-IDF & Cosine Similarity",
    version="1.0.0",
    lifespan=lifespan,
)

# Production CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time_ms = (time.perf_counter() - start_time) * 1000
    response.headers["Server-Timing"] = f"total;dur={process_time_ms:.2f}"
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms:.2f} ms)")
    return response


class RecommendRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Movie title to find recommendations for")
    genre: Optional[str] = None
    year: Optional[str] = None
    n: Optional[int] = Field(default=10, ge=1, le=50, description="Number of recommendations requested (1-50)")


class RecommendResponse(BaseModel):
    recommendations: List[str]
    source: str = "ml"


@app.get("/")
def root():
    return {
        "service": "CineCurator ML API",
        "status": "running",
        "version": "1.0.0",
        "ready": recommender.is_ready,
        "movie_count": getattr(recommender, "movie_count", 0),
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ready": recommender.is_ready,
        "movie_count": getattr(recommender, "movie_count", 0),
    }


@app.get("/ready")
def ready():
    if not recommender.is_ready:
        raise HTTPException(status_code=503, detail="Recommender model is not yet ready")
    return {
        "status": "ready",
        "model_loaded": True,
        "movie_count": getattr(recommender, "movie_count", 0),
    }


@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    if not recommender.is_ready:
        try:
            recommender.train()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Recommender not ready: {e}")

    titles = recommender.recommend(req.title, n=req.n or 10)
    if not titles:
        raise HTTPException(status_code=404, detail=f"Movie '{req.title}' not found in dataset")

    return RecommendResponse(recommendations=titles)  # type: ignore


@app.post("/train")
def train():
    try:
        recommender.train()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")
    return {"status": "trained", "movies": recommender.movie_count}
