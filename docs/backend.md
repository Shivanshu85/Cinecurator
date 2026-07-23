# Backend Architecture Guide (FastAPI Microservice)

## 🐍 Technology Stack

- **Framework:** FastAPI 0.111+
- **ASGI Server:** Uvicorn 0.30+
- **Data Science:** Scikit-Learn, NumPy, Pandas
- **Validation:** Pydantic v2
- **Deployment:** Render Web Service (Python 3.11 Runtime)

---

## 📂 Backend File Map

```text
ml-service/
 ├── app.py                     # Main FastAPI Application & HTTP Endpoints
 ├── Procfile                   # Production Gunicorn/Uvicorn Start Script
 ├── render.yaml                # Render Blueprint Deployment Configuration
 ├── requirements.txt           # Python Package Dependencies
 ├── model/
 │    └── recommender.py        # MovieRecommender TF-IDF ML Class
 └── data/                      # Movie Metadata & Vector Model Pickles
```

---

## ⚙️ Application Lifespan & Initialization

The FastAPI application uses an asynchronous lifespan context manager (`@asynccontextmanager`) to initialize and load the TF-IDF vector matrix into memory at startup:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
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
```

---

## 🔒 Production CORS & Security Middleware

CORS headers are configured dynamically via `ALLOWED_ORIGINS` environment variables to ensure only trusted frontend origins can communicate with the backend microservice:

```python
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
