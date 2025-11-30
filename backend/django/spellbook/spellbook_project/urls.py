"""
URL configuration for Spellbook project.

Provides API endpoints following the strangler fig pattern,
allowing gradual migration from the legacy Commander Spellbook backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

# DAPR subscription configuration for event-driven architecture
DAPR_SUBSCRIPTIONS = [
    {
        "pubsubname": "pubsub",
        "topic": "spellbook.card.updated",
        "route": "/events/spellbook/card/updated",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "spellbook.variant.created",
        "route": "/events/spellbook/variant/created",
        "metadata": {}
    },
    {
        "pubsubname": "pubsub",
        "topic": "spellbook.combo.validated",
        "route": "/events/spellbook/combo/validated",
        "metadata": {}
    }
]


def dapr_subscribe(request):
    """DAPR subscription endpoint."""
    return JsonResponse(DAPR_SUBSCRIPTIONS, safe=False)


def handle_card_updated(request):
    """Handle spellbook card updated events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[Spellbook] Card updated event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def handle_variant_created(request):
    """Handle spellbook variant created events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[Spellbook] Variant created event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def handle_combo_validated(request):
    """Handle spellbook combo validated events."""
    import json
    if request.method == 'POST':
        event = json.loads(request.body)
        data = event.get("data", event)
        print(f"[Spellbook] Combo validated event: {data}")
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Method not allowed"}, status=405)


def health_check(request):
    """Health check endpoint."""
    return JsonResponse({
        "status": "healthy",
        "service": "django-spellbook",
        "dapr": "enabled",
        "pattern": "strangler-fig"
    })


def api_info(request):
    """API information endpoint."""
    return JsonResponse({
        "service": "django-spellbook",
        "version": "0.1.0",
        "description": "Commander Spellbook API - Strangler Fig Integration",
        "dapr": {
            "enabled": True,
            "state_store": "statestore-spellbook",
            "pubsub": "pubsub",
        },
        "ddd_compliance": {
            "bounded_contexts": True,
            "aggregate_roots": ["Card", "Combo", "Variant", "Feature", "Template"],
            "repository_pattern": True,
            "domain_services": True,
            "application_services": True,
            "strangler_fig_pattern": True,
        },
        "endpoints": {
            "variants": "/api/v1/variants/",
            "cards": "/api/v1/cards/",
            "features": "/api/v1/features/",
            "templates": "/api/v1/templates/",
            "find_my_combos": "/api/v1/find-my-combos/",
            "estimate_bracket": "/api/v1/estimate-bracket/",
        }
    })


# API Router
router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rest_framework.urls')),
    
    # Health and info
    path('health', health_check),
    path('api/v1/info', api_info),
    
    # API routes (to be expanded with viewsets)
    path('api/v1/', include(router.urls)),
    
    # DAPR subscription endpoint
    path('dapr/subscribe', dapr_subscribe),
    
    # DAPR event handlers
    path('events/spellbook/card/updated', handle_card_updated),
    path('events/spellbook/variant/created', handle_variant_created),
    path('events/spellbook/combo/validated', handle_combo_validated),
]
