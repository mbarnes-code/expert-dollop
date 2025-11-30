"""
Base domain entity classes for Commander Spellbook.

Re-exports shared DDD base classes and provides Spellbook-specific extensions.

Note: The shared library should be installed with:
    pip install -e libs/shared/python
    
If running without installation, the domain package auto-configures the path.
"""

# Import utilities ensure shared libs are available
from .. import _imports  # noqa: F401

from ddd.entities.base import Entity, AggregateRoot, ValueObject, DomainEvent

__all__ = [
    'Entity',
    'AggregateRoot',
    'ValueObject',
    'DomainEvent',
]
