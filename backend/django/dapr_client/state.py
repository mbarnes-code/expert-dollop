"""
Django DAPR State Client

Provides synchronous state management using DAPR State API.
Uses httpx for synchronous HTTP requests (Django compatible).
"""

import os
from typing import Any, Dict, List, Optional, TypeVar, Generic
from dataclasses import dataclass
from enum import Enum
import httpx


class StateStore(str, Enum):
    """
    Available state stores mapped to PostgreSQL schemas (bounded contexts).
    Each state store enforces schema isolation for DDD compliance.
    """
    MAIN = "statestore-main"
    TCG = "statestore-tcg"
    NEMESIS = "statestore-nemesis"
    DISPATCH = "statestore-dispatch"
    HEXSTRIKE = "statestore-hexstrike"
    MEALIE = "statestore-mealie"
    GHOSTWRITER = "statestore-ghostwriter"
    NEMSIS = "statestore-nemsis"


@dataclass
class StateOptions:
    """Options for state operations."""
    consistency: str = "strong"  # "strong" or "eventual"
    concurrency: str = "first-write"  # "first-write" or "last-write"


@dataclass
class StateItem:
    """Represents a state item."""
    key: str
    value: Any
    etag: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None
    options: Optional[StateOptions] = None


T = TypeVar('T')


class DaprStateClient(Generic[T]):
    """
    DAPR State Client for Django (synchronous).
    
    Provides database-agnostic state management for Django applications.
    
    Example:
        >>> client = DaprStateClient(StateStore.TCG)
        >>> client.save("card-123", {"name": "Black Lotus"})
        >>> card = client.get("card-123")
        >>> print(card)  # {"name": "Black Lotus"}
    """
    
    def __init__(
        self,
        store: StateStore,
        dapr_host: Optional[str] = None,
        dapr_port: Optional[int] = None
    ):
        """
        Initialize the DAPR State Client.
        
        Args:
            store: The state store (bounded context) to use
            dapr_host: DAPR sidecar host
            dapr_port: DAPR sidecar HTTP port
        """
        self.store = store
        self.dapr_host = dapr_host or os.environ.get("DAPR_HOST", "localhost")
        self.dapr_port = dapr_port or int(os.environ.get("DAPR_HTTP_PORT", "3500"))
        self.base_url = f"http://{self.dapr_host}:{self.dapr_port}/v1.0"
    
    def _get_client(self) -> httpx.Client:
        """Create a new HTTP client."""
        return httpx.Client(timeout=30.0)
    
    def get(self, key: str) -> Optional[T]:
        """
        Get state by key from the bounded context.
        
        Args:
            key: The state key
            
        Returns:
            The state value or None if not found
        """
        url = f"{self.base_url}/state/{self.store.value}/{key}"
        with self._get_client() as client:
            response = client.get(url)
            
            if response.status_code == 204:
                return None
            
            response.raise_for_status()
            return response.json()
    
    def get_bulk(self, keys: List[str]) -> Dict[str, Optional[T]]:
        """
        Get multiple states by keys.
        
        Args:
            keys: List of state keys
            
        Returns:
            Dictionary mapping keys to their values
        """
        url = f"{self.base_url}/state/{self.store.value}/bulk"
        with self._get_client() as client:
            response = client.post(url, json={"keys": keys})
            response.raise_for_status()
            
            results = response.json()
            return {item["key"]: item.get("data") for item in results}
    
    def save(
        self,
        key: str,
        value: T,
        etag: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        options: Optional[StateOptions] = None
    ) -> None:
        """
        Save state to the bounded context.
        
        Args:
            key: The state key
            value: The state value
            etag: Optional ETag for concurrency control
            metadata: Optional metadata
            options: Optional state options
        """
        url = f"{self.base_url}/state/{self.store.value}"
        
        item: Dict[str, Any] = {
            "key": key,
            "value": value,
        }
        
        if etag:
            item["etag"] = etag
        if metadata:
            item["metadata"] = metadata
        if options:
            item["options"] = {
                "consistency": options.consistency,
                "concurrency": options.concurrency,
            }
        
        with self._get_client() as client:
            response = client.post(url, json=[item])
            response.raise_for_status()
    
    def save_bulk(self, items: List[StateItem]) -> None:
        """
        Save multiple states at once.
        
        Args:
            items: List of state items to save
        """
        url = f"{self.base_url}/state/{self.store.value}"
        
        payload = []
        for item in items:
            entry: Dict[str, Any] = {
                "key": item.key,
                "value": item.value,
            }
            if item.etag:
                entry["etag"] = item.etag
            if item.metadata:
                entry["metadata"] = item.metadata
            if item.options:
                entry["options"] = {
                    "consistency": item.options.consistency,
                    "concurrency": item.options.concurrency,
                }
            payload.append(entry)
        
        with self._get_client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
    
    def delete(self, key: str, etag: Optional[str] = None) -> None:
        """
        Delete state by key.
        
        Args:
            key: The state key to delete
            etag: Optional ETag for concurrency control
        """
        url = f"{self.base_url}/state/{self.store.value}/{key}"
        
        headers = {}
        if etag:
            headers["If-Match"] = etag
        
        with self._get_client() as client:
            response = client.delete(url, headers=headers)
            response.raise_for_status()
    
    def transaction(self, operations: List[Dict[str, Any]]) -> None:
        """
        Execute a state transaction (atomic operations).
        
        Args:
            operations: List of operations (upsert/delete)
        """
        url = f"{self.base_url}/state/{self.store.value}/transaction"
        with self._get_client() as client:
            response = client.post(url, json={"operations": operations})
            response.raise_for_status()
    
    def query(
        self,
        filter_query: Dict[str, Any],
        sort: Optional[List[Dict[str, str]]] = None,
        page: Optional[Dict[str, Any]] = None
    ) -> List[T]:
        """
        Query state using DAPR query API.
        
        Args:
            filter_query: Query filter
            sort: Optional sort configuration
            page: Optional pagination configuration
            
        Returns:
            List of matching state items
        """
        url = f"{self.base_url}/state/{self.store.value}/query"
        
        payload: Dict[str, Any] = {"filter": filter_query}
        if sort:
            payload["sort"] = sort
        if page:
            payload["page"] = page
        
        with self._get_client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            
            result = response.json()
            return [item.get("data") for item in result.get("results", [])]
