"""
FastAPI Integration for DAPR

Provides FastAPI-specific utilities for integrating DAPR into applications.
Includes subscription routing and middleware support.
"""

from typing import Any, Callable, Dict, List, Optional, Union
from functools import wraps
from fastapi import FastAPI, Request, Response
from fastapi.routing import APIRoute

from .client import DaprClient
from .pubsub import Topic, DaprPubSubClient


class DaprFastAPI:
    """
    FastAPI integration for DAPR.
    
    Provides decorators and utilities for building DAPR-enabled FastAPI apps.
    
    Example:
        >>> app = FastAPI()
        >>> dapr = DaprFastAPI(app, app_id="tcg-service")
        >>> 
        >>> @dapr.subscribe(Topic.CARD_ADDED)
        >>> async def handle_card_added(event: dict):
        ...     print(f"Card added: {event}")
    """
    
    def __init__(
        self,
        app: FastAPI,
        app_id: Optional[str] = None,
        dapr_host: Optional[str] = None,
        dapr_port: Optional[int] = None
    ):
        """
        Initialize DAPR FastAPI integration.
        
        Args:
            app: FastAPI application instance
            app_id: Application ID
            dapr_host: DAPR sidecar host
            dapr_port: DAPR sidecar HTTP port
        """
        self.app = app
        self.client = DaprClient(app_id, dapr_host, dapr_port)
        self._subscriptions: List[Dict[str, Any]] = []
        
        # Register DAPR subscription endpoint
        @app.get("/dapr/subscribe")
        async def dapr_subscribe() -> List[Dict[str, Any]]:
            """DAPR subscription endpoint."""
            return self._subscriptions
        
        # Register startup/shutdown hooks
        @app.on_event("startup")
        async def startup() -> None:
            pass  # Client is lazy initialized
        
        @app.on_event("shutdown")
        async def shutdown() -> None:
            await self.client.close()
    
    def subscribe(
        self,
        topic: Union[Topic, str],
        pubsub_name: str = "pubsub",
        route: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Callable:
        """
        Decorator to subscribe to a DAPR pub/sub topic.
        
        Args:
            topic: Topic to subscribe to
            pubsub_name: Pub/Sub component name
            route: Custom route path (defaults to topic name)
            metadata: Optional subscription metadata
            
        Example:
            >>> @dapr.subscribe(Topic.CARD_ADDED)
            >>> async def handle_card_added(event: dict):
            ...     print(f"Card added: {event}")
        """
        topic_name = topic.value if isinstance(topic, Topic) else topic
        route_path = route or f"/events/{topic_name.replace('.', '/')}"
        
        def decorator(func: Callable) -> Callable:
            # Register subscription
            self._subscriptions.append({
                "pubsubname": pubsub_name,
                "topic": topic_name,
                "route": route_path,
                "metadata": metadata or {}
            })
            
            # Create route handler
            @self.app.post(route_path)
            @wraps(func)
            async def handler(request: Request) -> Response:
                try:
                    event_data = await request.json()
                    
                    # Extract data from CloudEvent if present
                    if isinstance(event_data, dict) and "data" in event_data:
                        data = event_data.get("data", event_data)
                    else:
                        data = event_data
                    
                    await func(data)
                    
                    return Response(
                        content='{"success": true}',
                        media_type="application/json",
                        status_code=200
                    )
                except Exception as e:
                    # Return error but don't fail (prevents retry storm)
                    return Response(
                        content='{"success": false, "status": "DROP"}',
                        media_type="application/json",
                        status_code=200
                    )
            
            return handler
        
        return decorator
    
    async def publish(
        self,
        topic: Union[Topic, str],
        data: Any,
        metadata: Optional[Dict[str, str]] = None
    ) -> None:
        """
        Publish an event to a topic.
        
        Args:
            topic: Topic to publish to
            data: Event data
            metadata: Optional metadata
        """
        await self.client.publish(topic, data, metadata)
    
    def get_client(self) -> DaprClient:
        """Get the underlying DAPR client."""
        return self.client


def create_dapr_app(
    title: str = "DAPR App",
    app_id: Optional[str] = None,
    **kwargs: Any
) -> tuple[FastAPI, DaprFastAPI]:
    """
    Create a FastAPI app with DAPR integration.
    
    Args:
        title: Application title
        app_id: DAPR application ID
        **kwargs: Additional FastAPI arguments
        
    Returns:
        Tuple of (FastAPI app, DaprFastAPI instance)
        
    Example:
        >>> app, dapr = create_dapr_app("TCG Service", app_id="tcg-service")
    """
    app = FastAPI(title=title, **kwargs)
    dapr = DaprFastAPI(app, app_id=app_id)
    return app, dapr
