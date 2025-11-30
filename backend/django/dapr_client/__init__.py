"""
Django DAPR Client Library

Provides DAPR integration for Django applications following DDD principles:
- Bounded Contexts: Each module owns its data via schema isolation
- No Direct DB Access: Modules use DAPR State API
- Event-Driven: Modules communicate via Pub/Sub
- Database Agnostic: Can swap backends without code changes
"""

from .state import DaprStateClient, StateStore, StateItem, StateOptions
from .pubsub import DaprPubSubClient, Topic, CloudEvent
from .client import DaprClient
from .views import DaprSubscriptionView, dapr_subscribe_handler

__all__ = [
    "DaprClient",
    "DaprStateClient",
    "DaprPubSubClient",
    "StateStore",
    "StateItem",
    "StateOptions",
    "Topic",
    "CloudEvent",
    "DaprSubscriptionView",
    "dapr_subscribe_handler",
]
