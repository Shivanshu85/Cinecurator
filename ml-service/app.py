from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import List, Optional
from contextlib import asynccontextmanager
from model.recommender import MovieRecommender  # type: ignore
import logging

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
    description="Content-based movie recommendation service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    return {"status": "ok", "ready": recommender.is_ready}


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
