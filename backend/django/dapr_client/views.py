"""
Django DAPR Views

Provides Django views for DAPR subscription handling.
"""

import json
from typing import Any, Callable, Dict, List, Optional
from functools import wraps

from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


# Global subscription registry
_subscriptions: List[Dict[str, Any]] = []


def register_subscription(
    topic: str,
    path: str,
    pubsub_name: str = "pubsub",
    metadata: Optional[Dict[str, str]] = None
) -> None:
    """
    Register a subscription for DAPR.
    
    Args:
        topic: Topic to subscribe to
        path: Route path for receiving events
        pubsub_name: Pub/Sub component name
        metadata: Optional subscription metadata
    """
    _subscriptions.append({
        "pubsubname": pubsub_name,
        "topic": topic,
        "route": path,
        "metadata": metadata or {}
    })


def get_subscriptions() -> List[Dict[str, Any]]:
    """Get all registered subscriptions."""
    return _subscriptions


@method_decorator(csrf_exempt, name='dispatch')
class DaprSubscriptionView(View):
    """
    DAPR Subscription endpoint view.
    
    Returns list of pub/sub subscriptions for DAPR sidecar.
    Add to urls.py:
        path('dapr/subscribe', DaprSubscriptionView.as_view()),
    """
    
    def get(self, request: HttpRequest) -> JsonResponse:
        """Return subscriptions list."""
        return JsonResponse(get_subscriptions(), safe=False)


@csrf_exempt
def dapr_subscribe_handler(request: HttpRequest) -> JsonResponse:
    """
    Function-based DAPR subscription handler.
    
    Add to urls.py:
        path('dapr/subscribe', dapr_subscribe_handler),
    """
    return JsonResponse(get_subscriptions(), safe=False)


def dapr_event_handler(
    topic: str,
    pubsub_name: str = "pubsub",
    metadata: Optional[Dict[str, str]] = None
) -> Callable:
    """
    Decorator for DAPR event handlers.
    
    Automatically registers the subscription and handles CloudEvent extraction.
    
    Example:
        >>> @dapr_event_handler("tcg.card.added")
        ... def handle_card_added(event_data: dict) -> None:
        ...     print(f"Card added: {event_data}")
    
    Args:
        topic: Topic to subscribe to
        pubsub_name: Pub/Sub component name
        metadata: Optional subscription metadata
    """
    def decorator(func: Callable) -> Callable:
        # Path derived from topic
        path = f"/events/{topic.replace('.', '/')}"
        
        # Register subscription
        register_subscription(topic, path, pubsub_name, metadata)
        
        @wraps(func)
        @csrf_exempt
        def handler(request: HttpRequest) -> JsonResponse:
            if request.method != 'POST':
                return JsonResponse({"error": "Method not allowed"}, status=405)
            
            try:
                # Parse event
                body = json.loads(request.body.decode('utf-8'))
                
                # Extract data from CloudEvent if present
                if isinstance(body, dict) and "data" in body:
                    data = body.get("data", body)
                else:
                    data = body
                
                # Call handler
                result = func(data)
                
                return JsonResponse({"success": True})
                
            except Exception as e:
                # Return success to prevent retry storm, but log error
                print(f"Error handling event for {topic}: {e}")
                return JsonResponse({"success": False, "status": "DROP"})
        
        # Attach metadata to handler
        handler._dapr_topic = topic
        handler._dapr_path = path
        
        return handler
    
    return decorator


class DaprEventViewMixin:
    """
    Mixin for class-based DAPR event handlers.
    
    Example:
        >>> class CardAddedHandler(DaprEventViewMixin, View):
        ...     topic = "tcg.card.added"
        ...     
        ...     def handle_event(self, event_data: dict) -> None:
        ...         print(f"Card added: {event_data}")
    """
    
    topic: str = ""
    pubsub_name: str = "pubsub"
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)  # type: ignore
    
    def post(self, request: HttpRequest) -> JsonResponse:
        """Handle incoming event."""
        try:
            body = json.loads(request.body.decode('utf-8'))
            
            # Extract data from CloudEvent if present
            if isinstance(body, dict) and "data" in body:
                data = body.get("data", body)
            else:
                data = body
            
            # Call handler
            self.handle_event(data)
            
            return JsonResponse({"success": True})
            
        except Exception as e:
            print(f"Error handling event for {self.topic}: {e}")
            return JsonResponse({"success": False, "status": "DROP"})
    
    def handle_event(self, event_data: Dict[str, Any]) -> None:
        """
        Override this method to handle the event.
        
        Args:
            event_data: The event data
        """
        raise NotImplementedError("Subclasses must implement handle_event()")
