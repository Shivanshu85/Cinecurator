import os
import logging
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from model.recommender import MovieRecommender  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

recommender = MovieRecommender()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the recommender at startup; ignore if not yet trained."""
    try:
        recommender.load()
        logger.info("Recommender loaded successfully")
    except Exception as e:
        logger.warning(f"Could not load recommender: {e}. Will train on first request.")
    yield


app = FastAPI(
    title="CineCurator ML API",
    description="Production-grade Content-based movie recommendation microservice",
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


class RecommendRequest(BaseModel):
    title: str
    genre: Optional[str] = None
    year: Optional[str] = None
    n: Optional[int] = 10


class RecommendResponse(BaseModel):
    recommendations: List[str]
    source: str = "ml"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ready": recommender.is_ready,
        "movie_count": getattr(recommender, "movie_count", 0),
    }


@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    if not recommender.is_ready:
        try:
            recommender.train()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Recommender not ready: {e}")

    titles = recommender.recommend(req.title, n=req.n)
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
