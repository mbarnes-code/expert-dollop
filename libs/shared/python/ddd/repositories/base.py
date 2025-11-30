"""
Base repository interfaces following DDD patterns.

These abstract classes define the contract for data access,
allowing infrastructure implementations to be swapped without
affecting the domain layer.
"""

from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar

from ..entities.base import Entity, AggregateRoot

T = TypeVar('T', bound=Entity)
ID = TypeVar('ID')


class ReadOnlyRepository(ABC, Generic[T, ID]):
    """
    Abstract read-only repository interface.
    
    Provides query operations without modification capabilities.
    Useful for read models in CQRS implementations.
    """
    
    @abstractmethod
    def get_by_id(self, entity_id: ID) -> Optional[T]:
        """
        Retrieve an entity by its identifier.
        
        Args:
            entity_id: The unique identifier of the entity.
            
        Returns:
            The entity if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def get_all(self, limit: Optional[int] = None, offset: int = 0) -> List[T]:
        """
        Retrieve all entities with optional pagination.
        
        Args:
            limit: Maximum number of entities to return.
            offset: Number of entities to skip.
            
        Returns:
            List of entities.
        """
        pass
    
    @abstractmethod
    def count(self) -> int:
        """
        Count total number of entities.
        
        Returns:
            Total count of entities.
        """
        pass
    
    @abstractmethod
    def exists(self, entity_id: ID) -> bool:
        """
        Check if an entity exists by its identifier.
        
        Args:
            entity_id: The unique identifier to check.
            
        Returns:
            True if entity exists, False otherwise.
        """
        pass


class Repository(ReadOnlyRepository[T, ID], Generic[T, ID]):
    """
    Abstract repository interface with full CRUD operations.
    
    Extends ReadOnlyRepository with create, update, and delete operations.
    Implementations should handle transaction management.
    """
    
    @abstractmethod
    def add(self, entity: T) -> T:
        """
        Add a new entity to the repository.
        
        Args:
            entity: The entity to add.
            
        Returns:
            The added entity with any generated identifiers.
        """
        pass
    
    @abstractmethod
    def update(self, entity: T) -> T:
        """
        Update an existing entity.
        
        Args:
            entity: The entity with updated values.
            
        Returns:
            The updated entity.
        """
        pass
    
    @abstractmethod
    def delete(self, entity_id: ID) -> bool:
        """
        Delete an entity by its identifier.
        
        Args:
            entity_id: The unique identifier of the entity to delete.
            
        Returns:
            True if entity was deleted, False if not found.
        """
        pass
    
    @abstractmethod
    def add_batch(self, entities: List[T]) -> List[T]:
        """
        Add multiple entities in a batch operation.
        
        Args:
            entities: List of entities to add.
            
        Returns:
            List of added entities with generated identifiers.
        """
        pass
    
    @abstractmethod
    def delete_batch(self, entity_ids: List[ID]) -> int:
        """
        Delete multiple entities by their identifiers.
        
        Args:
            entity_ids: List of identifiers to delete.
            
        Returns:
            Number of entities deleted.
        """
        pass
