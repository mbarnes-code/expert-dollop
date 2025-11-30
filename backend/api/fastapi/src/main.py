"""
FastAPI Application Entry Point
Expert-Dollop Platform

Implements DAPR service mesh for state management and pub/sub messaging.
Follows DDD principles:
- Bounded Contexts: Each module owns its data
- No Direct DB Access: Uses DAPR State API
- Event-Driven: Uses DAPR Pub/Sub
- Database Agnostic: Can swap backends without code changes
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, List
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from core.dapr import DaprClient, StateStore, Topic

# DAPR Client instance
dapr_client: DaprClient | None = None

# Store subscriptions for DAPR
_subscriptions: List[Dict[str, Any]] = [
    {
        "pubsubname": "pubsub",
        "topic": "user.created",
        "route": "/events/user/created",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "tcg.card.added",
        "route": "/events/tcg/card/added",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "security.alert",
        "route": "/events/security/alert",
        "metadata": {}
    }
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    global dapr_client
    # Startup
    dapr_client = DaprClient(app_id="fastapi")
    yield
    # Shutdown
    if dapr_client:
        await dapr_client.close()


# Create the main FastAPI application
app = FastAPI(
    title="Expert-Dollop API",
    description="Domain-based monorepo API with DAPR service mesh for DDD compliance",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
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
        "dapr_enabled": True,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "dapr": "enabled"}


@app.get("/api/v1/info")
async def api_info():
    """API information endpoint."""
    return {
        "api_version": "v1",
        "framework": "FastAPI",
        "dapr": {
            "enabled": True,
            "state_stores": [store.value for store in StateStore],
            "pubsub": "pubsub",
        },
        "domains": ["security", "productivity", "ai", "tcg"],
        "ddd_compliance": {
            "bounded_contexts": True,
            "no_direct_db_access": True,
            "event_driven": True,
            "database_agnostic": True,
        },
        "databases": {
            "postgres_schemas": [
                "dispatch", "hexstrike", "mealie", "tcg",
                "nemesis", "main", "ghostwriter", "nemsis"
            ],
            "redis_databases": 9,
        },
    }


# ==================== DAPR Endpoints ====================

@app.get("/dapr/subscribe")
async def dapr_subscribe() -> List[Dict[str, Any]]:
    """
    DAPR subscription endpoint.
    Returns list of pub/sub subscriptions for DAPR sidecar.
    """
    return _subscriptions


# ==================== State API Endpoints ====================

@app.get("/api/v1/state/{store}/{key}")
async def get_state(store: str, key: str):
    """
    Get state from a bounded context.
    Uses DAPR State API (no direct DB access).
    """
    try:
        state_store = StateStore(f"statestore-{store}")
        value = await dapr_client.get_state(state_store, key)
        return {"key": key, "value": value, "store": store}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid store: {store}")


@app.post("/api/v1/state/{store}/{key}")
async def save_state(store: str, key: str, request: Request):
    """
    Save state to a bounded context.
    Uses DAPR State API (no direct DB access).
    """
    try:
        state_store = StateStore(f"statestore-{store}")
        data = await request.json()
        await dapr_client.save_state(state_store, key, data)
        return {"success": True, "key": key, "store": store}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid store: {store}")


@app.delete("/api/v1/state/{store}/{key}")
async def delete_state(store: str, key: str):
    """
    Delete state from a bounded context.
    Uses DAPR State API (no direct DB access).
    """
    try:
        state_store = StateStore(f"statestore-{store}")
        await dapr_client.delete_state(state_store, key)
        return {"success": True, "key": key, "store": store}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid store: {store}")


# ==================== Pub/Sub Event Handlers ====================

@app.post("/events/user/created")
async def handle_user_created(request: Request):
    """Handle user created events."""
    event = await request.json()
    data = event.get("data", event)
    print(f"User created event received: {data}")
    # Process user created event
    return {"success": True}


@app.post("/events/tcg/card/added")
async def handle_card_added(request: Request):
    """Handle TCG card added events."""
    event = await request.json()
    data = event.get("data", event)
    print(f"Card added event received: {data}")
    # Process card added event
    return {"success": True}


@app.post("/events/security/alert")
async def handle_security_alert(request: Request):
    """Handle security alert events."""
    event = await request.json()
    data = event.get("data", event)
    print(f"Security alert event received: {data}")
    # Process security alert event
    return {"success": True}


# ==================== Publish Endpoints ====================

@app.post("/api/v1/publish/{topic}")
async def publish_event(topic: str, request: Request):
    """
    Publish an event to a topic.
    Uses DAPR Pub/Sub (event-driven communication).
    """
    data = await request.json()
    await dapr_client.publish(topic, data)
    return {"success": True, "topic": topic}


# Import and include domain routers when available
# from .routers import security, productivity, ai, tcg
# app.include_router(security.router, prefix="/api/v1/security", tags=["security"])
# app.include_router(productivity.router, prefix="/api/v1/productivity", tags=["productivity"])
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
# app.include_router(tcg.router, prefix="/api/v1/tcg", tags=["tcg"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
