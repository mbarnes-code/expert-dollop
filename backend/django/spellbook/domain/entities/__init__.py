"""
Domain entities for Commander Spellbook.

Following DDD principles, these abstract base classes define the core
domain entities that can be implemented by different infrastructure layers.
"""

from .base import Entity, AggregateRoot, ValueObject
from .card import CardEntity
from .combo import ComboEntity
from .variant import VariantEntity
from .feature import FeatureEntity
from .template import TemplateEntity

__all__ = [
    'Entity',
    'AggregateRoot',
    'ValueObject',
    'CardEntity',
    'ComboEntity',
    'VariantEntity',
    'FeatureEntity',
    'TemplateEntity',
]
