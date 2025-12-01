# Commander Map

A UMAP/HDBSCAN-based analysis tool for Magic: The Gathering Commander decks, migrated from the [Lucky Paper Commander Map](https://luckypaper.co/resources/commander-map) project.

## Overview

The Commander Map uses dimensionality reduction (UMAP) and clustering (HDBSCAN) to visualize and analyze the Commander deck metagame. It processes deck data from EDHREC to create:

- A 2D visualization of the entire Commander format
- Clusters of similar decks
- Defining cards and traits for each cluster
- Submaps for individual commanders, themes, tribes, and color identities

## Architecture

This module follows **Domain-Driven Design (DDD)** principles as part of a modular monolith:

```
commander_map/
├── domain/                 # Core business logic
│   ├── entities/           # CommanderDeck, CommanderMapAggregate
│   ├── value_objects/      # ColorIdentity, CardType
│   └── services/           # Domain services (clustering, analysis, etc.)
├── application/            # Use case orchestration
│   ├── dto/                # Data Transfer Objects
│   └── services/           # Application services
├── infrastructure/         # External concerns
│   ├── repositories/       # Data persistence
│   └── external/           # Scryfall API client
└── adapters/               # Anti-corruption layer
    └── legacy_adapter.py   # Strangler Fig pattern support
```

## Strangler Fig Pattern

This module implements the **Strangler Fig pattern** for gradual migration from legacy scripts. The `adapters/` layer provides backwards compatibility:

```python
# Legacy code continues to work
from commander_map.adapters import LegacyCommanderMapAdapter

legacy_map = LegacyCommanderMapAdapter.from_legacy_data(
    decklist_matrix=matrix,
    commander_decks=df,
    cdecks=cdecks
)

# Legacy interface still works
legacy_map.reduce_dimensionality(method='UMAP', n_dims=2)
legacy_map.cluster_decks(method='HDBSCAN')
```

## Installation

```bash
cd apps/tcg/spellbook/commander_map
pip install -e .
```

## Dependencies

- **numpy** >= 1.21.0
- **pandas** >= 1.1.3
- **scipy** >= 1.7.1
- **umap-learn** >= 0.5.1
- **scikit-learn** >= 1.0.2
- **hdbscan** >= 0.8.0
- **requests** >= 2.24.0
- **pydash** >= 5.1.0
- **inflect** >= 5.3.0

## Usage

### High-Level API

```python
from commander_map.application import MapGenerationService

# Generate main map clusters
service = MapGenerationService()
commander_map = service.generate_main_map_clusters(
    data_dir='/path/to/preprocessed/data',
    include_commanders=False,
    output_dir='./output'
)
```

### Domain-Level API

```python
from commander_map.domain import CommanderMapAggregate, CommanderDeck

# Create a deck
deck = CommanderDeck(
    commander="Krenko, Mob Boss",
    color_identity="R",
    cards=["Sol Ring", "Lightning Bolt", ...]
)

# Create and analyze a map
commander_map = CommanderMapAggregate(
    decklist_matrix=sparse_matrix,
    commander_decks=deck_df,
    cdecks=deck_dict
)

# Run UMAP embedding
commander_map.reduce_dimensionality(
    method='UMAP',
    n_dims=6,
    coordinates=False,
    n_neighbors=25
)

# Cluster decks
commander_map.cluster_decks(method='HDBSCAN', min_cluster_size=15)
commander_map.assign_unclustered()

# Analyze clusters
commander_map.get_cluster_traits()
commander_map.get_cluster_card_counts(color_rule='ignore')
commander_map.get_defining_cards(include_synergy=True)
```

### Fetching Card Data

```python
from commander_map.infrastructure import ScryfallApiClient

client = ScryfallApiClient()

# Get bulk card data
oracle_cards = client.fetch_bulk_data('oracle-cards')

# Search for specific cards
goblins = client.search_cards('type:goblin commander:legal')
```

## Key Concepts

### CommanderDeck

Represents a single Commander deck with:
- Commander, partner, and companion
- Color identity
- Theme and tribe classifications
- Card list
- Price calculation

### CommanderMapAggregate

The aggregate root that manages:
- UMAP dimensionality reduction
- HDBSCAN clustering
- Cluster trait analysis
- Defining card calculation
- Average decklist computation

### Services

Domain services handle specific concerns:
- `DimensionalityReductionService`: UMAP embeddings
- `ClusteringService`: HDBSCAN clustering
- `ClusterAnalysisService`: Trait and card analysis
- `CardService`: Scryfall card operations
- `CompanionService`: Companion validation

## License

MIT License - See LICENSE file for details.
