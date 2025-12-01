"""
Commander Map Module for TCG Spellbook.

A UMAP/HDBSCAN-based analysis tool for Magic: The Gathering Commander decks.
This module provides dimensionality reduction and clustering capabilities
to visualize and analyze the Commander deck metagame.

Architecture:
    This module follows Domain-Driven Design (DDD) principles as a modular monolith:
    
    - domain/: Core business logic (entities, value objects, domain services)
    - application/: Use case orchestration (DTOs, application services)
    - infrastructure/: Data persistence and external integrations
    - adapters/: Anti-corruption layer for Strangler Fig pattern migration

Dependencies:
    - numpy: Numerical operations
    - pandas: Data manipulation
    - scipy: Sparse matrices and scientific computing
    - umap-learn: UMAP dimensionality reduction
    - hdbscan: Density-based clustering
    - scikit-learn: Machine learning utilities
    - requests: HTTP client for Scryfall API
    - pydash: Utility functions
    - inflect: Pluralization utilities

Usage:
    # High-level application services
    from commander_map.application import MapGenerationService
    
    service = MapGenerationService()
    commander_map = service.generate_main_map_clusters(
        data_dir='/path/to/preprocessed/data',
        include_commanders=False
    )
    
    # Direct domain access
    from commander_map.domain import CommanderMapAggregate, CommanderDeck
    
    # Legacy compatibility (Strangler Fig pattern)
    from commander_map.adapters import LegacyCommanderMapAdapter
"""

__version__ = "0.1.0"

# Domain exports
from .domain import (
    CommanderDeck,
    CommanderMapAggregate,
    ColorIdentity,
    CardType,
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

# Application exports
from .application import (
    DeckDTO,
    ClusterDTO,
    MapExportDTO,
    DataLoadingService,
    MapGenerationService,
    SubmapGenerationService,
)

# Infrastructure exports
from .infrastructure import (
    DeckRepository,
    CardRepository,
    MapExportRepository,
    ScryfallApiClient,
)

# Adapter exports (for Strangler Fig migration)
from .adapters import (
    LegacyCommanderMapAdapter,
    LegacyCommanderDeckAdapter,
)

__all__ = [
    # Version
    '__version__',
    
    # Domain - Entities
    'CommanderDeck',
    'CommanderMapAggregate',
    
    # Domain - Value Objects
    'ColorIdentity',
    'CardType',
    
    # Domain - Services
    'DimensionalityReductionService',
    'ClusteringService',
    'ClusterAnalysisService',
    'DeckFormatterService',
    'CompanionService',
    'CardService',
    'TraitMappingService',
    'UrlExtractionService',
    'ExportService',
    
    # Application - DTOs
    'DeckDTO',
    'ClusterDTO',
    'MapExportDTO',
    
    # Application - Services
    'DataLoadingService',
    'MapGenerationService',
    'SubmapGenerationService',
    
    # Infrastructure - Repositories
    'DeckRepository',
    'CardRepository',
    'MapExportRepository',
    
    # Infrastructure - External
    'ScryfallApiClient',
    
    # Adapters (Strangler Fig)
    'LegacyCommanderMapAdapter',
    'LegacyCommanderDeckAdapter',
]
