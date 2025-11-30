"""
Base domain entity classes following DDD patterns.

These abstract classes provide the foundation for all domain entities
in the Commander Spellbook bounded context.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
from uuid import UUID


@dataclass
class ValueObject(ABC):
    """
    Abstract base class for Value Objects.
    
    Value Objects are immutable and compared by their attribute values
    rather than identity. They represent descriptive aspects of the domain.
    """
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.__dict__ == other.__dict__
    
    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))


@dataclass
class Entity(ABC):
    """
    Abstract base class for Domain Entities.
    
    Entities are objects with a distinct identity that runs through time
    and different representations. They are compared by their identity.
    """
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.id == other.id
    
    def __hash__(self) -> int:
        return hash(self.id)
    
    @abstractmethod
    def validate(self) -> bool:
        """Validate the entity state."""
        pass


@dataclass
class AggregateRoot(Entity):
    """
    Abstract base class for Aggregate Roots.
    
    An Aggregate is a cluster of domain objects that can be treated as a single unit.
    The Aggregate Root is the entry point to the aggregate and ensures consistency.
    """
    _domain_events: list = field(default_factory=list, repr=False)
    
    def add_domain_event(self, event: Any) -> None:
        """Add a domain event to be dispatched after persistence."""
        self._domain_events.append(event)
    
    def clear_domain_events(self) -> list:
        """Clear and return all pending domain events."""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
    
    @property
    def domain_events(self) -> list:
        """Get pending domain events."""
        return self._domain_events.copy()
