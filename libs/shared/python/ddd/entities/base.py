"""
Base domain entity classes following DDD patterns.

These abstract classes provide the foundation for all domain entities
across bounded contexts in the modular monolith.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar


@dataclass(frozen=True)
class ValueObject(ABC):
    """
    Abstract base class for Value Objects.
    
    Value Objects are immutable and compared by their attribute values
    rather than identity. They represent descriptive aspects of the domain.
    
    Example:
        @dataclass(frozen=True)
        class ManaValue(ValueObject):
            value: int
            colors: tuple[str, ...]
    """
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.__dict__ == other.__dict__
    
    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))


T = TypeVar('T')


@dataclass
class Entity(ABC, Generic[T]):
    """
    Abstract base class for Domain Entities.
    
    Entities are objects with a distinct identity that runs through time
    and different representations. They are compared by their identity.
    
    Type parameter T represents the ID type (int, UUID, str, etc.)
    """
    id: Optional[T] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        if self.id is None or other.id is None:
            return False
        return self.id == other.id
    
    def __hash__(self) -> int:
        return hash(self.id) if self.id else hash(id(self))
    
    @abstractmethod
    def validate(self) -> bool:
        """
        Validate the entity state.
        
        Returns:
            bool: True if entity state is valid, False otherwise.
        """
        pass


@dataclass
class DomainEvent:
    """
    Base class for domain events.
    
    Domain events represent something significant that happened in the domain.
    """
    occurred_at: datetime = field(default_factory=datetime.utcnow)
    event_type: str = ""
    
    def __post_init__(self):
        if not self.event_type:
            self.event_type = self.__class__.__name__


@dataclass
class AggregateRoot(Entity[T], Generic[T]):
    """
    Abstract base class for Aggregate Roots.
    
    An Aggregate is a cluster of domain objects that can be treated as a single unit.
    The Aggregate Root is the entry point to the aggregate and ensures consistency.
    
    Features:
    - Domain event collection for eventual consistency
    - Version tracking for optimistic concurrency
    """
    _domain_events: List[DomainEvent] = field(default_factory=list, repr=False)
    _version: int = field(default=0, repr=False)
    
    def add_domain_event(self, event: DomainEvent) -> None:
        """Add a domain event to be dispatched after persistence."""
        self._domain_events.append(event)
    
    def clear_domain_events(self) -> List[DomainEvent]:
        """Clear and return all pending domain events."""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
    
    @property
    def domain_events(self) -> List[DomainEvent]:
        """Get pending domain events."""
        return self._domain_events.copy()
    
    @property
    def version(self) -> int:
        """Get aggregate version for optimistic concurrency."""
        return self._version
    
    def increment_version(self) -> None:
        """Increment version after successful persistence."""
        self._version += 1
