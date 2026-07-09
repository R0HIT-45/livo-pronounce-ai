from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.request_logger import log_requests
from app.core.config import settings

from app.api.v1.health import router as health_router
from app.api.v1.analyze import router as analyze_router

app = FastAPI(
    title="Livo Pronounce AI",
    description="AI-powered pronunciation assessment API",
    version=settings.VERSION,
)

app.middleware("http")(log_requests)
# -----------------------------
# CORS Configuration
# -----------------------------
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API Routers
# -----------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

app.include_router(
    analyze_router,
    prefix="/api/v1",
    tags=["Speech Analysis"]
)


@app.get("/")
def root():
    return {
        "application": "Livo Pronounce AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
app.include_router(health_router)