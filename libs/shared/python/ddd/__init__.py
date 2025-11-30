"""
Shared DDD (Domain-Driven Design) Library.

This library provides common DDD abstractions that can be used across
multiple bounded contexts in the modular monolith architecture.

Includes:
- Base entity classes (Entity, AggregateRoot, ValueObject)
- Repository interfaces
- Service abstractions
- Domain event handling
"""

from .entities import Entity, AggregateRoot, ValueObject
from .repositories import Repository, ReadOnlyRepository
from .services import DomainService, ApplicationService, QueryService, CommandHandler

__all__ = [
    # Entities
    'Entity',
    'AggregateRoot',
    'ValueObject',
    # Repositories
    'Repository',
    'ReadOnlyRepository',
    # Services
    'DomainService',
    'ApplicationService',
    'QueryService',
    'CommandHandler',
]
