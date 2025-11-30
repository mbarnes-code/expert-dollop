"""
DDD Entity base classes.

Provides abstract base classes for domain entities following
Domain-Driven Design patterns.
"""

from .base import Entity, AggregateRoot, ValueObject

__all__ = [
    'Entity',
    'AggregateRoot',
    'ValueObject',
]
