"""
Commander Map Adapters Layer.

This layer implements the Strangler Fig pattern through an anti-corruption layer,
providing compatibility with the legacy scripts while allowing gradual migration.
"""

from .legacy_adapter import LegacyCommanderMapAdapter, LegacyCommanderDeckAdapter

__all__ = [
    'LegacyCommanderMapAdapter',
    'LegacyCommanderDeckAdapter',
]
