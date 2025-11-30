"""
DAPR Client Module for Expert-Dollop Platform

This module provides a database-agnostic abstraction layer using DAPR
for state management and pub/sub messaging, enforcing DDD principles:
- Bounded Contexts: Each module owns its data via schema isolation
- No Direct DB Access: Modules use DAPR State API
- Event-Driven: Modules communicate via Pub/Sub
- Database Agnostic: Can swap backends without code changes
"""

from .state import DaprStateClient, StateStore
from .pubsub import DaprPubSubClient, Topic
from .client import DaprClient

__all__ = [
    "DaprClient",
    "DaprStateClient",
    "DaprPubSubClient",
    "StateStore",
    "Topic",
]
