"""
Django DAPR Pub/Sub Client

Provides synchronous event-driven communication using DAPR Pub/Sub API.
Uses httpx for synchronous HTTP requests (Django compatible).
"""

import os
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import httpx


class Topic(str, Enum):
    """
    Standard pub/sub topics for cross-module communication.
    Topics are organized by domain for clear event routing.
    """
    # User/Auth Events
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    
    # Security Events
    SECURITY_ALERT = "security.alert"
    SECURITY_AUDIT = "security.audit"
    SECURITY_COMPLIANCE = "security.compliance"
    
    # TCG Events
    CARD_ADDED = "tcg.card.added"
    CARD_UPDATED = "tcg.card.updated"
    DECK_CREATED = "tcg.deck.created"
    DECK_UPDATED = "tcg.deck.updated"
    COLLECTION_UPDATED = "tcg.collection.updated"
    TOURNAMENT_CREATED = "tcg.tournament.created"
    TOURNAMENT_STARTED = "tcg.tournament.started"
    TOURNAMENT_ENDED = "tcg.tournament.ended"
    
    # Productivity Events
    TASK_CREATED = "productivity.task.created"
    TASK_UPDATED = "productivity.task.updated"
    TASK_COMPLETED = "productivity.task.completed"
    PROJECT_CREATED = "productivity.project.created"
    DOCUMENT_CREATED = "productivity.document.created"
    
    # AI Events
    MODEL_TRAINED = "ai.model.trained"
    INFERENCE_COMPLETED = "ai.inference.completed"
    CHAT_MESSAGE = "ai.chat.message"
    
    # System Events
    SYSTEM_STARTUP = "system.startup"
    SYSTEM_SHUTDOWN = "system.shutdown"
    SYSTEM_ERROR = "system.error"


@dataclass
class CloudEvent:
    """
    CloudEvents specification compliant event envelope.
    """
    id: str
    source: str
    type: str
    data: Any
    specversion: str = "1.0"
    datacontenttype: str = "application/json"
    time: Optional[str] = None
    subject: Optional[str] = None
    
    def __post_init__(self) -> None:
        if self.time is None:
            self.time = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "id": self.id,
            "source": self.source,
            "type": self.type,
            "specversion": self.specversion,
            "datacontenttype": self.datacontenttype,
            "time": self.time,
            "data": self.data,
        }
        if self.subject:
            result["subject"] = self.subject
        return result


@dataclass
class SubscriptionRoute:
    """Defines a subscription route for a topic."""
    path: str
    topic: Union[Topic, str]
    pubsub_name: str = "pubsub"
    metadata: Dict[str, str] = field(default_factory=dict)


class DaprPubSubClient:
    """
    DAPR Pub/Sub Client for Django (synchronous).
    
    Enables event-driven communication between bounded contexts.
    
    Example:
        >>> client = DaprPubSubClient()
        >>> client.publish(Topic.CARD_ADDED, {"cardId": "123", "name": "Black Lotus"})
    """
    
    PUBSUB_NAME = "pubsub"
    
    def __init__(
        self,
        app_id: Optional[str] = None,
        dapr_host: Optional[str] = None,
        dapr_port: Optional[int] = None
    ):
        """
        Initialize the DAPR Pub/Sub Client.
        
        Args:
            app_id: Application ID for event sourcing
            dapr_host: DAPR sidecar host
            dapr_port: DAPR sidecar HTTP port
        """
        self.app_id = app_id or os.environ.get("APP_ID", "unknown")
        self.dapr_host = dapr_host or os.environ.get("DAPR_HOST", "localhost")
        self.dapr_port = dapr_port or int(os.environ.get("DAPR_HTTP_PORT", "3500"))
        self.base_url = f"http://{self.dapr_host}:{self.dapr_port}/v1.0"
        self._subscriptions: List[SubscriptionRoute] = []
    
    def _get_client(self) -> httpx.Client:
        """Create a new HTTP client."""
        return httpx.Client(timeout=30.0)
    
    def publish(
        self,
        topic: Union[Topic, str],
        data: Any,
        metadata: Optional[Dict[str, str]] = None,
        pubsub_name: Optional[str] = None
    ) -> None:
        """
        Publish an event to a topic.
        
        Args:
            topic: Topic to publish to
            data: Event data
            metadata: Optional metadata
            pubsub_name: Optional pub/sub component name
        """
        topic_name = topic.value if isinstance(topic, Topic) else topic
        pubsub = pubsub_name or self.PUBSUB_NAME
        
        url = f"{self.base_url}/publish/{pubsub}/{topic_name}"
        
        headers = {"Content-Type": "application/json"}
        if metadata:
            for key, value in metadata.items():
                headers[f"metadata.{key}"] = value
        
        with self._get_client() as client:
            response = client.post(url, json=data, headers=headers)
            response.raise_for_status()
    
    def publish_cloud_event(
        self,
        topic: Union[Topic, str],
        event: CloudEvent,
        pubsub_name: Optional[str] = None
    ) -> None:
        """
        Publish a CloudEvent to a topic.
        
        Args:
            topic: Topic to publish to
            event: CloudEvent to publish
            pubsub_name: Optional pub/sub component name
        """
        topic_name = topic.value if isinstance(topic, Topic) else topic
        pubsub = pubsub_name or self.PUBSUB_NAME
        
        url = f"{self.base_url}/publish/{pubsub}/{topic_name}"
        
        with self._get_client() as client:
            response = client.post(
                url,
                json=event.to_dict(),
                headers={"Content-Type": "application/cloudevents+json"}
            )
            response.raise_for_status()
    
    def publish_bulk(
        self,
        topic: Union[Topic, str],
        events: List[Dict[str, Any]],
        pubsub_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publish multiple events to a topic in bulk.
        
        Args:
            topic: Topic to publish to
            events: List of event entries
            pubsub_name: Optional pub/sub component name
            
        Returns:
            Response with failed entries if any
        """
        topic_name = topic.value if isinstance(topic, Topic) else topic
        pubsub = pubsub_name or self.PUBSUB_NAME
        
        url = f"{self.base_url}/publish/bulk/{pubsub}/{topic_name}"
        
        with self._get_client() as client:
            response = client.post(url, json=events)
            response.raise_for_status()
            
            return response.json() if response.text else {}
    
    def subscribe(
        self,
        topic: Union[Topic, str],
        path: str,
        pubsub_name: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> SubscriptionRoute:
        """
        Register a subscription route.
        
        Args:
            topic: Topic to subscribe to
            path: Route path for receiving events
            pubsub_name: Optional pub/sub component name
            metadata: Optional subscription metadata
            
        Returns:
            SubscriptionRoute object
        """
        topic_name = topic.value if isinstance(topic, Topic) else topic
        
        route = SubscriptionRoute(
            path=path,
            topic=topic_name,
            pubsub_name=pubsub_name or self.PUBSUB_NAME,
            metadata=metadata or {}
        )
        self._subscriptions.append(route)
        return route
    
    def get_subscriptions(self) -> List[Dict[str, Any]]:
        """
        Get all registered subscriptions in DAPR format.
        
        Returns:
            List of subscription configurations for DAPR
        """
        return [
            {
                "pubsubname": sub.pubsub_name,
                "topic": sub.topic if isinstance(sub.topic, str) else sub.topic.value,
                "route": sub.path,
                "metadata": sub.metadata,
            }
            for sub in self._subscriptions
        ]
