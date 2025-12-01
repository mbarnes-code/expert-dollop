"""
Export Service.

Handles export of map data to JSON format.
"""

from collections import defaultdict
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd


class ExportService:
    """
    Domain service for exporting Commander Map data.
    
    Converts cluster data to JSON-exportable format with optional
    trait compression.
    """
    
    BASICS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']
    
    def jsonify_map(
        self,
        commander_decks: pd.DataFrame,
        cluster_labels: np.ndarray,
        cluster_defining_cards: pd.DataFrame,
        cluster_traits: pd.DataFrame,
        average_decklists: Dict[int, int],
        magic_cards: Dict[str, Any],
        clusters: Optional[List[int]] = None,
        trait_mapping: Optional[Dict[str, Dict[str, int]]] = None
    ) -> Any:
        """
        Convert map data to JSON-exportable format.
        
        Args:
            commander_decks: DataFrame with deck data
            cluster_labels: Array of cluster labels
            cluster_defining_cards: DataFrame of defining cards
            cluster_traits: DataFrame of cluster traits
            average_decklists: Dict mapping cluster_id to deck_id
            magic_cards: Dictionary of card data
            clusters: Specific clusters to export (None for all)
            trait_mapping: Trait to integer mapping for compression
            
        Returns:
            List of cluster data dicts, or single dict if one cluster
        """
        if clusters is None:
            clusters = sorted(set(cluster_labels))
        
        # Filter data to specified clusters
        defining_cards = cluster_defining_cards[
            cluster_defining_cards['clusterID'].isin(clusters)
        ]
        traits = cluster_traits[
            cluster_traits['clusterID'].isin(clusters)
        ]
        decks = commander_decks[
            commander_decks['clusterID'].isin(clusters)
        ]
        
        # Rename for consistency
        rename_dict = {'commander-partnerID': 'commanderID'}
        
        # Drop basic lands from defining cards
        defining_cards = defining_cards[
            ~defining_cards['card'].isin(self.BASICS)
        ]
        
        # Drop empty traits
        traits = traits[
            ~((traits['category'].isin(['tribeID', 'themeID'])) & 
              (traits['value'] == ''))
        ]
        
        clusters = sorted(set(traits['clusterID']))
        
        # Calculate average prices
        valid_prices = decks[np.isfinite(decks['price'])]
        average_prices = valid_prices.groupby('clusterID')['price'].mean()
        
        json_data = []
        for clust in clusters:
            cluster_json = defaultdict(list)
            
            if len(clusters) > 1:
                cluster_json['clusterID'] = clust
            
            clust_cards = defining_cards[
                defining_cards['clusterID'] == clust
            ].drop(columns=['clusterID'])
            
            clust_traits = traits[
                traits['clusterID'] == clust
            ].drop(columns=['clusterID'])
            
            avg_price = average_prices.get(clust, 0)
            avg_deck_id = average_decklists.get(clust, 0)
            
            # Add traits
            for _, row in clust_traits.iterrows():
                category, value, percent = row.values
                category = rename_dict.get(category, category)
                
                if trait_mapping:
                    value = self._convert_trait_value(
                        category, value, trait_mapping
                    )
                
                cluster_json[category].append([value, percent])
            
            # Add defining cards
            for _, row in clust_cards.iterrows():
                cluster_json['definingCards'].append(list(row.values))
            
            cluster_json['averagePrice'] = int(avg_price)
            cluster_json['averageDeck'] = str(avg_deck_id)
            
            json_data.append(dict(cluster_json))
        
        if len(json_data) == 1:
            return json_data[0]
        
        return json_data
    
    def _convert_trait_value(
        self,
        category: str,
        value: str,
        trait_mapping: Dict[str, Dict[str, int]]
    ) -> str:
        """
        Convert a trait value to its integer representation.
        
        Args:
            category: The trait category
            value: The trait value
            trait_mapping: The mapping dictionary
            
        Returns:
            String representation of the integer ID
        """
        if category == 'commanderID' and ' + ' in value:
            # Handle partner pairs
            parts = value.split(' + ')
            ids = [
                str(trait_mapping['commanderID'].get(p, p))
                for p in parts
            ]
            return '+'.join(ids)
        
        return str(trait_mapping.get(category, {}).get(value, value))
