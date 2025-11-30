"""
URL configuration for MTG project.

Includes DAPR integration for state management and pub/sub messaging.
"""
import sys
import os

# Add dapr_client to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# DAPR subscription configuration
DAPR_SUBSCRIPTIONS = [
    {
        "pubsubname": "pubsub",
        "topic": "tcg.card.added",
        "route": "/events/tcg/card/added",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "tcg.deck.created",
        "route": "/events/tcg/deck/created",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "user.created",
        "route": "/events/user/created",
        "metadata": {}
    }
]


def dapr_subscribe(request):
    """DAPR subscription endpoint."""
    return JsonResponse(DAPR_SUBSCRIPTIONS, safe=False)


def handle_card_added(request):
    """Handle TCG card added events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[MTG] Card added event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def handle_deck_created(request):
    """Handle TCG deck created events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[MTG] Deck created event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def handle_user_created(request):
    """Handle user created events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[MTG] User created event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def health_check(request):
    """Health check endpoint."""
    return JsonResponse({"status": "healthy", "service": "django-mtg", "dapr": "enabled"})


def api_info(request):
    """API information endpoint."""
    return JsonResponse({
        "service": "django-mtg",
        "version": "0.1.0",
        "dapr": {
            "enabled": True,
            "state_store": "statestore-tcg",
            "pubsub": "pubsub",
        },
        "ddd_compliance": {
            "bounded_contexts": True,
            "no_direct_db_access": True,
            "event_driven": True,
            "database_agnostic": True,
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rest_framework.urls')),
    
    # Health and info
    path('health', health_check),
    path('api/v1/info', api_info),
    
    # DAPR subscription endpoint
    path('dapr/subscribe', dapr_subscribe),
    
    # DAPR event handlers
    path('events/tcg/card/added', handle_card_added),
    path('events/tcg/deck/created', handle_deck_created),
    path('events/user/created', handle_user_created),
]
