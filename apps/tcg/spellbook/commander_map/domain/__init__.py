"""
Commander Map Domain Layer.

This layer contains the core business logic for the Commander Map,
following Domain-Driven Design (DDD) patterns:

- Entities: Core domain objects (CommanderDeck, CommanderMapAggregate)
- Value Objects: Immutable descriptive objects (ColorIdentity, CardType)
- Services: Domain logic that doesn't fit in entities
"""

from .entities import CommanderDeck, CommanderMapAggregate
from .value_objects import ColorIdentity, CardType
from .services import (
    DimensionalityReductionService,
    ClusteringService,
    ClusterAnalysisService,
    DeckFormatterService,
    CompanionService,
    CardService,
    TraitMappingService,
    UrlExtractionService,
    ExportService,
)

__all__ = [
    # Entities
    'CommanderDeck',
    'CommanderMapAggregate',
    # Value Objects
    'ColorIdentity',
    'CardType',
    # Services
    'DimensionalityReductionService',
    'ClusteringService',
    'ClusterAnalysisService',
    'DeckFormatterService',
    'CompanionService',
    'CardService',
    'TraitMappingService',
    'UrlExtractionService',
    'ExportService',
]
