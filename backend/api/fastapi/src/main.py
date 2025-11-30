"""
FastAPI Application Entry Point
Expert-Dollop Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Create the main FastAPI application
app = FastAPI(
    title="Expert-Dollop API",
    description="Domain-based monorepo API with modular backend support",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
origins = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Expert-Dollop API",
        "version": "0.1.0",
        "status": "running",
        "backend": "FastAPI",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/v1/info")
async def api_info():
    """API information endpoint."""
    return {
        "api_version": "v1",
        "framework": "FastAPI",
        "domains": ["security", "productivity", "ai", "tcg"],
        "databases": {
            "postgres_schemas": [
                "dispatch", "hexstrike", "mealie", "tcg",
                "nemesis", "main", "ghostwriter", "nemsis"
            ],
            "redis_databases": 9,
        },
    }


# Import and include domain routers when available
# from .routers import security, productivity, ai, tcg
# app.include_router(security.router, prefix="/api/v1/security", tags=["security"])
# app.include_router(productivity.router, prefix="/api/v1/productivity", tags=["productivity"])
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
# app.include_router(tcg.router, prefix="/api/v1/tcg", tags=["tcg"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
