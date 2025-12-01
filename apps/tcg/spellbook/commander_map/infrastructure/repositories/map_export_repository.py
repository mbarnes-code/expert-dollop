"""
Map Export Repository Implementation.

Handles export of map data to various formats.
"""

import json
import os
from typing import Any, Dict, List, Optional

import pandas as pd


class MapExportRepository:
    """
    Repository for map export data.
    
    Handles saving cluster data, trait mappings, and submap exports.
    """
    
    def __init__(self, output_dir: str):
        """
        Initialize the repository.
        
        Args:
            output_dir: Base directory for output files
        """
        self.output_dir = output_dir
        self._ensure_directories()
    
    def _ensure_directories(self) -> None:
        """Create necessary output directories."""
        subdirs = ['submaps', 'cards', 'traits', 'clusters', 'decks']
        for subdir in subdirs:
            os.makedirs(os.path.join(self.output_dir, subdir), exist_ok=True)
    
    def save_cluster_json(
        self,
        cluster_data: List[Dict],
        filename: str = 'edh-map-clusters.json'
    ) -> None:
        """
        Save cluster data to JSON.
        
        Args:
            cluster_data: List of cluster dictionaries
            filename: Output filename
        """
        path = os.path.join(self.output_dir, filename)
        with open(path, 'w') as f:
            json.dump(cluster_data, f)
    
    def save_individual_clusters(self, cluster_data: List[Dict]) -> None:
        """
        Save each cluster as an individual JSON file.
        
        Args:
            cluster_data: List of cluster dictionaries
        """
        cluster_dir = os.path.join(self.output_dir, 'clusters')
        for i, cluster in enumerate(cluster_data):
            path = os.path.join(cluster_dir, f'{i}.json')
            with open(path, 'w') as f:
                json.dump(cluster, f)
    
    def save_trait_mapping(
        self,
        trait_mapping_df: pd.DataFrame,
        filename: str = 'trait-mapping.csv'
    ) -> None:
        """
        Save trait mapping to CSV.
        
        Args:
            trait_mapping_df: DataFrame with trait mappings
            filename: Output filename
        """
        path = os.path.join(self.output_dir, filename)
        trait_mapping_df.to_csv(path, index=False)
    
    def save_trait_file(
        self,
        field: str,
        data: pd.DataFrame
    ) -> None:
        """
        Save individual trait file.
        
        Args:
            field: Trait field name (e.g., 'commanderID')
            data: DataFrame with trait data
        """
        path = os.path.join(self.output_dir, 'traits', f'{field}.csv')
        data.to_csv(path, index=False)
    
    def save_submap(
        self,
        category: str,
        name: str,
        cluster_json: Any,
        coordinates_df: pd.DataFrame
    ) -> None:
        """
        Save a submap's data.
        
        Args:
            category: Submap category (e.g., 'tribeID')
            name: Submap name (kebab-case)
            cluster_json: Cluster data as JSON
            coordinates_df: DataFrame with coordinates
        """
        submap_dir = os.path.join(self.output_dir, 'submaps', category, name)
        os.makedirs(submap_dir, exist_ok=True)
        
        # Save cluster JSON
        with open(os.path.join(submap_dir, 'edh-submap-clusters.json'), 'w') as f:
            json.dump(cluster_json, f)
        
        # Save coordinates CSV
        coordinates_df.to_csv(os.path.join(submap_dir, 'edh-submap.csv'), index=False)
    
    def save_submap_info(
        self,
        category: str,
        name: str,
        info_json: Dict
    ) -> None:
        """
        Save a submap's defining info.
        
        Args:
            category: Submap category
            name: Submap name
            info_json: Info data as dictionary
        """
        submap_dir = os.path.join(self.output_dir, 'submaps', category, name)
        os.makedirs(submap_dir, exist_ok=True)
        
        with open(os.path.join(submap_dir, 'submap.json'), 'w') as f:
            json.dump(info_json, f)
    
    def save_embedding(
        self,
        embedding: Any,
        filename: str = 'map-embedding.csv'
    ) -> None:
        """
        Save embedding data to CSV.
        
        Args:
            embedding: Numpy array of embeddings
            filename: Output filename
        """
        path = os.path.join(self.output_dir, filename)
        pd.DataFrame(embedding).to_csv(path, index=False)
