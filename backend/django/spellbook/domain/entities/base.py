"""
Base domain entity classes for Commander Spellbook.

Re-exports shared DDD base classes and provides Spellbook-specific extensions.
"""

import sys
from pathlib import Path

# Add shared libs to path for imports
libs_path = Path(__file__).resolve().parents[6] / 'libs' / 'shared' / 'python'
if str(libs_path) not in sys.path:
    sys.path.insert(0, str(libs_path))

# Re-export from shared library
from ddd.entities.base import Entity, AggregateRoot, ValueObject, DomainEvent

__all__ = [
    'Entity',
    'AggregateRoot',
    'ValueObject',
    'DomainEvent',
]
