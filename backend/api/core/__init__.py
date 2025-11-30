"""
Core API abstractions for the expert-dollop platform.
This module provides shared utilities that work with both FastAPI and Django.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from dataclasses import dataclass
from enum import Enum

T = TypeVar('T')


class APIBackend(Enum):
    """Supported API backend frameworks."""
    FASTAPI = "fastapi"
    DJANGO = "django"


@dataclass
class APIResponse(Generic[T]):
    """Standard API response wrapper."""
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    message: Optional[str] = None


class BaseRepository(ABC, Generic[T]):
    """Abstract base repository for data access."""
    
    @abstractmethod
    async def get(self, id: str) -> Optional[T]:
        """Get a single item by ID."""
        pass
    
    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> List[T]:
        """List items with pagination."""
        pass
    
    @abstractmethod
    async def create(self, item: T) -> T:
        """Create a new item."""
        pass
    
    @abstractmethod
    async def update(self, id: str, item: T) -> Optional[T]:
        """Update an existing item."""
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete an item by ID."""
        pass


class BaseService(ABC, Generic[T]):
    """Abstract base service for business logic."""
    
    def __init__(self, repository: BaseRepository[T]):
        self.repository = repository
    
    async def get(self, id: str) -> APIResponse[T]:
        """Get an item with standard response."""
        try:
            item = await self.repository.get(id)
            if item is None:
                return APIResponse(success=False, error="Not found")
            return APIResponse(success=True, data=item)
        except Exception as e:
            return APIResponse(success=False, error=str(e))
    
    async def list(self, skip: int = 0, limit: int = 100) -> APIResponse[List[T]]:
        """List items with standard response."""
        try:
            items = await self.repository.list(skip, limit)
            return APIResponse(success=True, data=items)
        except Exception as e:
            return APIResponse(success=False, error=str(e))
