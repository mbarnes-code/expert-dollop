"""
DAPR Client - Unified Client for State and Pub/Sub

Provides a unified interface for all DAPR operations.
"""

import os
from typing import Any, Dict, List, Optional, Union

from .state import DaprStateClient, StateStore, StateItem, StateOptions
from .pubsub import DaprPubSubClient, Topic, CloudEvent


class DaprClient:
    """
    Unified DAPR Client for state management and pub/sub.
    
    This client provides a single interface for interacting with DAPR,
    implementing DDD principles through bounded context isolation.
    
    Example:
        >>> async with DaprClient(app_id="tcg-service") as client:
        ...     # State operations
        ...     await client.save_state(StateStore.TCG, "card-123", {"name": "Black Lotus"})
        ...     card = await client.get_state(StateStore.TCG, "card-123")
        ...     
        ...     # Pub/Sub operations
        ...     await client.publish(Topic.CARD_ADDED, {"cardId": "123"})
    """
    
    def __init__(
        self,
        app_id: Optional[str] = None,
        dapr_host: Optional[str] = None,
        dapr_port: Optional[int] = None
    ):
        """
        Initialize the unified DAPR Client.
        
        Args:
            app_id: Application ID for event sourcing
            dapr_host: DAPR sidecar host
            dapr_port: DAPR sidecar HTTP port
        """
        self.app_id = app_id or os.environ.get("APP_ID", "unknown")
        self.dapr_host = dapr_host or os.environ.get("DAPR_HOST", "localhost")
        self.dapr_port = dapr_port or int(os.environ.get("DAPR_HTTP_PORT", "3500"))
        
        # State clients for each bounded context
        self._state_clients: Dict[StateStore, DaprStateClient[Any]] = {}
        
        # Pub/Sub client
        self._pubsub_client = DaprPubSubClient(
            app_id=self.app_id,
            dapr_host=self.dapr_host,
            dapr_port=self.dapr_port
        )
    
    def _get_state_client(self, store: StateStore) -> DaprStateClient[Any]:
        """Get or create a state client for a bounded context."""
        if store not in self._state_clients:
            self._state_clients[store] = DaprStateClient(
                store=store,
                dapr_host=self.dapr_host,
                dapr_port=self.dapr_port
            )
        return self._state_clients[store]
    
    async def close(self) -> None:
        """Close all clients."""
        for client in self._state_clients.values():
            await client.close()
        await self._pubsub_client.close()
    
    async def __aenter__(self) -> "DaprClient":
        return self
    
    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()
    
    # ==================== State Operations ====================
    
    async def get_state(
        self,
        store: StateStore,
        key: str
    ) -> Optional[Any]:
        """
        Get state from a bounded context.
        
        Args:
            store: The state store (bounded context)
            key: The state key
            
        Returns:
            The state value or None if not found
        """
        client = self._get_state_client(store)
        return await client.get(key)
    
    async def get_bulk_state(
        self,
        store: StateStore,
        keys: List[str]
    ) -> Dict[str, Optional[Any]]:
        """
        Get multiple states from a bounded context.
        
        Args:
            store: The state store (bounded context)
            keys: List of state keys
            
        Returns:
            Dictionary mapping keys to their values
        """
        client = self._get_state_client(store)
        return await client.get_bulk(keys)
    
    async def save_state(
        self,
        store: StateStore,
        key: str,
        value: Any,
        etag: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        options: Optional[StateOptions] = None
    ) -> None:
        """
        Save state to a bounded context.
        
        Args:
            store: The state store (bounded context)
            key: The state key
            value: The state value
            etag: Optional ETag for concurrency
            metadata: Optional metadata
            options: Optional state options
        """
        client = self._get_state_client(store)
        await client.save(key, value, etag, metadata, options)
    
    async def save_bulk_state(
        self,
        store: StateStore,
        items: List[StateItem]
    ) -> None:
        """
        Save multiple states to a bounded context.
        
        Args:
            store: The state store (bounded context)
            items: List of state items
        """
        client = self._get_state_client(store)
        await client.save_bulk(items)
    
    async def delete_state(
        self,
        store: StateStore,
        key: str,
        etag: Optional[str] = None
    ) -> None:
        """
        Delete state from a bounded context.
        
        Args:
            store: The state store (bounded context)
            key: The state key
            etag: Optional ETag for concurrency
        """
        client = self._get_state_client(store)
        await client.delete(key, etag)
    
    async def execute_state_transaction(
        self,
        store: StateStore,
        operations: List[Dict[str, Any]]
    ) -> None:
        """
        Execute a state transaction in a bounded context.
        
        Args:
            store: The state store (bounded context)
            operations: List of operations
        """
        client = self._get_state_client(store)
        await client.transaction(operations)
    
    async def query_state(
        self,
        store: StateStore,
        filter_query: Dict[str, Any],
        sort: Optional[List[Dict[str, str]]] = None,
        page: Optional[Dict[str, Any]] = None
    ) -> List[Any]:
        """
        Query state in a bounded context.
        
        Args:
            store: The state store (bounded context)
            filter_query: Query filter
            sort: Optional sort configuration
            page: Optional pagination
            
        Returns:
            List of matching state items
        """
        client = self._get_state_client(store)
        return await client.query(filter_query, sort, page)
    
    # ==================== Pub/Sub Operations ====================
    
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
        await self._pubsub_client.publish(topic, data, metadata)
    
    async def publish_cloud_event(
        self,
        topic: Union[Topic, str],
        event: CloudEvent
    ) -> None:
        """
        Publish a CloudEvent to a topic.
        
        Args:
            topic: Topic to publish to
            event: CloudEvent to publish
        """
        await self._pubsub_client.publish_cloud_event(topic, event)
    
    async def publish_bulk(
        self,
        topic: Union[Topic, str],
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Publish multiple events to a topic.
        
        Args:
            topic: Topic to publish to
            events: List of event entries
            
        Returns:
            Response with any failed entries
        """
        return await self._pubsub_client.publish_bulk(topic, events)
    
    def subscribe(
        self,
        topic: Union[Topic, str],
        path: str,
        metadata: Optional[Dict[str, str]] = None
    ):
        """
        Register a subscription route.
        
        Args:
            topic: Topic to subscribe to
            path: Route path
            metadata: Optional metadata
        """
        return self._pubsub_client.subscribe(topic, path, metadata=metadata)
    
    def get_subscriptions(self) -> List[Dict[str, Any]]:
        """Get all registered subscriptions."""
        return self._pubsub_client.get_subscriptions()
