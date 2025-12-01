"""
Map Generation Application Service.

Orchestrates the complete Commander Map generation process.
"""

import json
import os
from typing import Any, Dict, Optional

import pandas as pd

from ...domain.entities import CommanderMapAggregate
from ...domain.services import TraitMappingService
from .data_loading_service import DataLoadingService


class MapGenerationService:
    """
    Application service for generating the Commander Map.
    
    Orchestrates the complete pipeline:
    1. Load preprocessed data
    2. Create embeddings
    3. Cluster decks
    4. Calculate cluster traits and defining cards
    5. Export results
    """
    
    def __init__(self):
        self.data_loader = DataLoadingService()
        self.trait_mapping_service = TraitMappingService()
    
    def generate_main_map_clusters(
        self,
        data_dir: str,
        include_commanders: bool = False,
        output_dir: str = '.'
    ) -> CommanderMapAggregate:
        """
        Generate the main map clusters.
        
        Args:
            data_dir: Directory containing preprocessed data
            include_commanders: Include commanders in matrix
            output_dir: Directory for output files
            
        Returns:
            CommanderMapAggregate with clustering complete
        """
        print('\nGenerating clusters for Commander Map...\n' + '-'*40 + '\n')
        
        # Load data
        magic_cards = self.data_loader.load_magic_cards()
        
        commander_map = self._load_commander_map(data_dir, magic_cards)
        
        # Load trait mapping
        trait_mapping = self.trait_mapping_service.build_trait_lookup(
            trait_mapping_path=f'{data_dir}/trait-mapping.csv'
        )
        
        # Run 6D embedding
        print('\nRunning the 6D main map embedding...', end='')
        commander_map.reduce_dimensionality(
            method='UMAP',
            n_dims=6,
            coordinates=False,
            metric='jaccard',
            n_neighbors=25,
            min_dist=0
        )
        
        # Export embedding
        embedding_df = pd.DataFrame(commander_map.cluster_embedding)
        embedding_df.to_csv(f'{output_dir}/map-embedding.csv', index=False)
        print('done')
        
        # Cluster
        commander_map.cluster_decks(method='HDBSCAN', min_cluster_size=15)
        commander_map.assign_unclustered()
        
        # Calculate traits and cards
        print('\nCalculating cluster traits of main map...', end='')
        commander_map.get_cluster_traits()
        print('done')
        
        print('\nCalculating defining cards...')
        commander_map.get_cluster_card_counts(
            color_rule='ignore',
            include_commanders=include_commanders,
            verbose=True
        )
        commander_map.get_defining_cards(
            include_synergy=True,
            n_scope=1000,
            verbose=True
        )
        
        # Calculate average decklists
        commander_map.calculate_average_decklists(verbose=True)
        
        # Export
        self._export_cluster_results(
            commander_map, magic_cards, trait_mapping, output_dir
        )
        
        return commander_map
    
    def generate_main_map_coordinates(
        self,
        data_dir: str,
        n_neighbors: int = 25,
        output_dir: str = '.'
    ) -> CommanderMapAggregate:
        """
        Generate 2D coordinates for the main map.
        
        Args:
            data_dir: Directory containing preprocessed data
            n_neighbors: UMAP n_neighbors parameter
            output_dir: Directory for output files
            
        Returns:
            CommanderMapAggregate with coordinates
        """
        print('\nCreating 2D coordinates for Commander Map...\n' + '-'*50 + '\n')
        
        # Load data
        print('Loading preprocessed data...', end='')
        commander_decks = self.data_loader.load_commander_decks_df(
            f'{data_dir}/map_intermediates/commander-decks.csv'
        )
        decklist_matrix, card_idx_lookup = self.data_loader.load_decklists(
            f'{data_dir}/map_intermediates/sparse-decklists.npz',
            f'{data_dir}/map_intermediates/sparse-columns.txt'
        )
        trait_mapping = self.trait_mapping_service.build_trait_lookup(
            trait_mapping_path=f'{data_dir}/trait-mapping.csv'
        )
        print('done')
        
        # Create map object
        commander_map = CommanderMapAggregate(
            decklist_matrix=decklist_matrix,
            commander_decks=commander_decks,
            cdecks=None
        )
        
        # Run 2D embedding
        print('\nRunning the 2D main map embedding...')
        commander_map.reduce_dimensionality(
            method='UMAP',
            metric='jaccard',
            coordinates=True,
            n_dims=2,
            n_neighbors=n_neighbors
        )
        
        # Replace traits with integers
        commander_map.commander_decks = self.trait_mapping_service.replace_traits_with_ints(
            commander_map.commander_decks, trait_mapping
        )
        
        # Export
        col_order = [
            'siteID', 'path', 'x', 'y', 'commanderID', 'partnerID',
            'colorIdentityID', 'tribeID', 'themeID', 'price'
        ]
        export_df = commander_map.commander_decks.copy()[col_order]
        export_df[['x', 'y']] = export_df[['x', 'y']].round(6)
        export_df.to_csv(f'{output_dir}/commander-map-coordinates.csv', index=False)
        
        return commander_map
    
    def _load_commander_map(
        self,
        data_dir: str,
        magic_cards: Dict[str, Any]
    ) -> CommanderMapAggregate:
        """Load all data and create CommanderMapAggregate."""
        print('\nLoading preprocessed data...', end='')
        
        commander_decks = self.data_loader.load_commander_decks_df(
            f'{data_dir}/map_intermediates/commander-decks.csv'
        )
        
        decklist_matrix, card_idx_lookup = self.data_loader.load_decklists(
            f'{data_dir}/map_intermediates/sparse-decklists.npz',
            f'{data_dir}/map_intermediates/sparse-columns.txt'
        )
        
        date_matrix, deck_date_idx_lookup, card_date_idx_lookup = self.data_loader.load_date_matrix(
            f'{data_dir}/map_intermediates/date-matrix.csv',
            commander_decks, card_idx_lookup, magic_cards
        )
        
        ci_matrix, deck_ci_idx_lookup, card_ci_idx_lookup = self.data_loader.load_ci_matrix(
            f'{data_dir}/map_intermediates/coloridentity-matrix.csv',
            commander_decks, card_idx_lookup, magic_cards
        )
        
        # Load cdecks
        cdecks = self.data_loader.load_cdecks(
            commander_decks, decklist_matrix, card_idx_lookup
        )
        
        # Create aggregate
        commander_map = CommanderMapAggregate(
            decklist_matrix=decklist_matrix,
            commander_decks=commander_decks,
            cdecks=cdecks
        )
        
        # Set references
        commander_map.date_matrix = date_matrix
        commander_map.ci_matrix = ci_matrix
        commander_map.card_idx_lookup = card_idx_lookup
        commander_map.deck_date_idx_lookup = deck_date_idx_lookup
        commander_map.card_date_idx_lookup = card_date_idx_lookup
        commander_map.deck_ci_idx_lookup = deck_ci_idx_lookup
        commander_map.card_ci_idx_lookup = card_ci_idx_lookup
        
        print('done')
        return commander_map
    
    def _export_cluster_results(
        self,
        commander_map: CommanderMapAggregate,
        magic_cards: Dict[str, Any],
        trait_mapping: Dict[str, Dict[str, int]],
        output_dir: str
    ) -> None:
        """Export cluster analysis results."""
        print('\nExporting cluster files...', end='')
        
        cluster_json = commander_map.jsonify_map(
            magic_cards, trait_mapping=trait_mapping
        )
        
        with open(f'{output_dir}/edh-map-clusters.json', 'w') as f:
            json.dump(cluster_json, f)
        
        commander_map.commander_decks[['clusterID']].to_csv(
            f'{output_dir}/commander-map-clusters.csv', index=False
        )
        
        # Export individual clusters
        os.makedirs(f'{output_dir}/clusters', exist_ok=True)
        for clust, c_json in enumerate(cluster_json):
            with open(f'{output_dir}/clusters/{clust}.json', 'w') as f:
                json.dump(c_json, f)
        
        print('done')
