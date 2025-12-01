"""
Commander Map Domain Value Objects.

Value objects are immutable objects that represent descriptive aspects
of the domain with no conceptual identity.
"""

from .color_identity import ColorIdentity
from .card_type import CardType

__all__ = [
    'ColorIdentity',
    'CardType',
]
