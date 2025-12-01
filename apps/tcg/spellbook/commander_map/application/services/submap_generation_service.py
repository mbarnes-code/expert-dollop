"""
Submap Generation Application Service.

Orchestrates generation of submaps for commanders, themes, tribes, etc.
"""

import json
import os
from collections import defaultdict
from typing import Any, Dict, Optional

import inflect
import numpy as np
import pandas as pd
import scipy.stats

from ...domain.entities import CommanderMapAggregate
from ...domain.services import CardService, ClusteringService, TraitMappingService
from .data_loading_service import DataLoadingService


class SubmapGenerationService:
    """
    Application service for generating Commander Map submaps.
    
    Creates individual submaps for each commander, theme, tribe,
    and color identity with clustering and defining cards.
    """
    
    def __init__(self):
        self.data_loader = DataLoadingService()
        self.trait_mapping_service = TraitMappingService()
        self.card_service = CardService()
        self.clustering_service = ClusteringService()
    
    def generate_submaps(
        self,
        data_dir: str,
        submap_file: str,
        include_commanders: bool = False
    ) -> None:
        """
        Generate all submaps from a submap specification file.
        
        Args:
            data_dir: Directory containing preprocessed data
            submap_file: Path to CSV with category/value/count columns
            include_commanders: Include commanders in matrix counts
        """
        print('\nCreating submaps for Commander Map...\n' + '-'*53 + '\n')
        
        # Load data
        magic_cards = self.data_loader.load_magic_cards()
        commander_map = self._load_commander_map(data_dir, magic_cards)
        
        # Load submap spec
        submap_df = pd.read_csv(submap_file).fillna('')
        
        # Load trait mapping
        trait_mapping = self.trait_mapping_service.build_trait_lookup(
            trait_mapping_path=f'{data_dir}/trait-mapping.csv'
        )
        
        # Build override dict
        override_dict = self._build_override_dict(f'{data_dir}/trait-mapping.csv')
        
        print('\nCreating submaps...\n' + '-'*20)
        self._create_submaps(
            submap_df,
            commander_map,
            magic_cards,
            include_commanders,
            trait_mapping,
            override_dict,
            data_dir
        )
        
        print('Finished exporting all submaps')
    
    def _load_commander_map(
        self,
        data_dir: str,
        magic_cards: Dict[str, Any]
    ) -> CommanderMapAggregate:
        """Load complete commander map data."""
        print('Loading preprocessed data...', end='')
        
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
        
        cdecks = self.data_loader.load_cdecks(
            commander_decks, decklist_matrix, card_idx_lookup
        )
        
        commander_map = CommanderMapAggregate(
            decklist_matrix=decklist_matrix,
            commander_decks=commander_decks,
            cdecks=cdecks
        )
        
        commander_map.date_matrix = date_matrix
        commander_map.ci_matrix = ci_matrix
        commander_map.card_idx_lookup = card_idx_lookup
        commander_map.deck_date_idx_lookup = deck_date_idx_lookup
        commander_map.card_date_idx_lookup = card_date_idx_lookup
        commander_map.deck_ci_idx_lookup = deck_ci_idx_lookup
        commander_map.card_ci_idx_lookup = card_ci_idx_lookup
        
        print('done')
        return commander_map
    
    def _build_override_dict(self, trait_mapping_path: str) -> Dict:
        """Build override dictionary from trait mapping."""
        slug_override = pd.read_csv(trait_mapping_path).fillna('')
        override_dict = defaultdict(dict)
        
        for _, row in slug_override.iterrows():
            info_dict = {}
            category = row['category']
            internal_slug = row['internal_slug']
            edhrec_slug = row.get('folder_slug', '')
            
            info_dict['edhrec_slug'] = edhrec_slug
            override_dict[category][internal_slug] = info_dict
        
        return dict(override_dict)
    
    def _create_submaps(
        self,
        grouped_data: pd.DataFrame,
        commander_map: CommanderMapAggregate,
        magic_cards: Dict[str, Any],
        include_commanders: bool,
        trait_mapping: Dict,
        override_dict: Dict,
        out_dir: str
    ) -> None:
        """Create all submaps from grouped data."""
        np.random.seed(0)
        p = inflect.engine()
        
        for index in grouped_data.index:
            category, value = grouped_data.loc[index, ['category', 'value']]
            
            # Determine output folder name
            out_value = self._get_output_folder_name(
                category, value, override_dict, p
            )
            
            output_dir = f'{out_dir}/submaps/{category}/{out_value}'
            if category == 'partnerID':
                output_dir = output_dir.replace('partnerID', 'commander-partnerID')
            
            # Extract submap data
            if category != 'partnerID':
                submap_decks = commander_map.commander_decks[
                    commander_map.commander_decks[category] == value
                ].reset_index(drop=True).copy()
            else:
                submap_decks = commander_map.commander_decks[
                    (commander_map.commander_decks['commanderID'] == value) |
                    (commander_map.commander_decks['partnerID'] == value)
                ].reset_index(drop=True).copy()
            
            submap_matrix = commander_map.decklist_matrix[submap_decks['deckID'].values, :]
            submap_cdecks = {
                deck_id: commander_map.cdecks[deck_id]
                for deck_id in submap_decks['deckID'].values
            }
            
            print(index, value, f'{len(submap_decks)} decklists')
            
            # Remove absent cards
            card_counts = submap_matrix.sum(axis=0).A1
            played_cards = np.array(list(commander_map.card_idx_lookup.keys()))[card_counts > 0]
            submap_matrix = submap_matrix[:, card_counts > 0]
            submap_card_idx = {name: i for i, name in enumerate(played_cards)}
            
            # Create submap aggregate
            submap = CommanderMapAggregate(
                decklist_matrix=submap_matrix,
                commander_decks=submap_decks,
                cdecks=submap_cdecks
            )
            
            submap.date_matrix = commander_map.date_matrix
            submap.ci_matrix = commander_map.ci_matrix
            submap.card_idx_lookup = submap_card_idx
            submap.deck_date_idx_lookup = commander_map.deck_date_idx_lookup
            submap.card_date_idx_lookup = commander_map.card_date_idx_lookup
            submap.deck_ci_idx_lookup = commander_map.deck_ci_idx_lookup
            submap.card_ci_idx_lookup = commander_map.card_ci_idx_lookup
            
            # Process submap
            self._process_submap(
                submap, category, value, magic_cards, include_commanders,
                trait_mapping, output_dir
            )
    
    def _get_output_folder_name(
        self,
        category: str,
        value: str,
        override_dict: Dict,
        p
    ) -> str:
        """Get the output folder name for a submap."""
        if category == 'colorIdentityID':
            return value.lower() if value else 'c'
        elif category == 'themeID':
            return override_dict.get('themeID', {}).get(
                value, {}
            ).get('edhrec_slug', value).lower()
        elif category == 'tribeID':
            override_value = override_dict.get('tribeID', {}).get(
                value, {}
            ).get('edhrec_slug', '').lower()
            return override_value if override_value else p.plural(value).lower()
        else:
            return self.card_service.kebab(value.lower())
    
    def _process_submap(
        self,
        submap: CommanderMapAggregate,
        category: str,
        value: str,
        magic_cards: Dict[str, Any],
        include_commanders: bool,
        trait_mapping: Dict,
        output_dir: str
    ) -> None:
        """Process a single submap through embedding, clustering, and export."""
        print('Running UMAP and clustering...')
        
        # 2D embedding
        submap.reduce_dimensionality(method='UMAP', n_dims=2, coordinates=True)
        
        # Clustering with iterative refinement
        n_neighbors, min_cluster_size = self.clustering_service.get_parameters(
            len(submap.commander_decks)
        )
        
        entropy, max_cluster_perc = 0, 1
        num_iter = 0
        
        while entropy < 1 and max_cluster_perc > 0.8 and min_cluster_size > 1:
            print(f'On iteration {num_iter}...')
            
            submap.reduce_dimensionality(
                method='UMAP', n_dims=4, coordinates=False,
                n_neighbors=n_neighbors, min_dist=0
            )
            submap.cluster_decks(method='HDBSCAN', min_cluster_size=min_cluster_size)
            submap.assign_unclustered(n_neighbors=15)
            
            cluster_sizes = submap.commander_decks.groupby('clusterID').size()
            cluster_sizes = cluster_sizes / cluster_sizes.sum()
            entropy = scipy.stats.entropy(cluster_sizes)
            max_cluster_perc = np.max(cluster_sizes)
            num_iter += 1
            
            if len(submap.commander_decks) <= 200:
                break
            
            min_cluster_size -= 1
        
        # Get traits and cards
        drop_categories = [category] if category != 'commander-partnerID' else [category, 'colorIdentityID']
        submap.get_cluster_traits(drop_categories=tuple(drop_categories))
        submap.get_cluster_card_counts(
            color_rule='ignore',
            include_commanders=include_commanders,
            verbose=True
        )
        
        include_synergy = len(set(submap.cluster_labels)) > 1
        submap.get_defining_cards(include_synergy=include_synergy, n_scope=200, verbose=True)
        submap.calculate_average_decklists(verbose=True)
        
        # Export
        os.makedirs(output_dir, exist_ok=True)
        
        cluster_json = submap.jsonify_map(magic_cards, trait_mapping=trait_mapping)
        with open(f'{output_dir}/edh-submap-clusters.json', 'w') as f:
            json.dump(cluster_json, f)
        
        # Export coordinates
        submap.commander_decks = self.trait_mapping_service.replace_traits_with_ints(
            submap.commander_decks, trait_mapping
        )
        
        col_order = [
            'deckID', 'siteID', 'path', 'x', 'y', 'commanderID', 'partnerID',
            'colorIdentityID', 'tribeID', 'themeID', 'price', 'clusterID'
        ]
        export_df = submap.commander_decks[col_order].copy()
        export_df[['x', 'y']] = export_df[['x', 'y']].round(6)
        export_df.to_csv(f'{output_dir}/edh-submap.csv', index=False)
        
        print('\n')
