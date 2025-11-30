"""
Repository interfaces for Commander Spellbook domain.

These abstract interfaces define the data access contracts for
the Spellbook bounded context.
"""

from .card import CardRepository
from .combo import ComboRepository
from .variant import VariantRepository
from .feature import FeatureRepository
from .template import TemplateRepository

__all__ = [
    'CardRepository',
    'ComboRepository',
    'VariantRepository',
    'FeatureRepository',
    'TemplateRepository',
]
