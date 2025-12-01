"""
Commander Map Aggregate Root.

This is the core aggregate root for the Commander Map bounded context.
It manages the collection of commander decks and provides UMAP dimensionality 
reduction and HDBSCAN clustering capabilities.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import scipy.sparse
from scipy.spatial import KDTree

from .commander_deck import CommanderDeck


@dataclass
class CommanderMapAggregate:
    """
    Aggregate Root for the Commander Map domain.
    
    This aggregate manages the complete collection of commander decks and provides:
    - UMAP dimensionality reduction for visualization
    - HDBSCAN clustering for deck grouping
    - Cluster analysis and defining card calculation
    - Average decklist computation per cluster
    
    Following DDD patterns, this is the entry point to the aggregate and ensures
    consistency of all contained entities.
    
    Attributes:
        decklist_matrix: Sparse matrix of decklists (n_decks x n_cards)
        commander_decks: DataFrame of deck metadata
        cdecks: Dictionary mapping deck_id to CommanderDeck entities
        coordinates: 2D UMAP coordinates for visualization
        cluster_embedding: Higher-dimensional embedding for clustering
        cluster_labels: Array of cluster assignments
    """
    
    decklist_matrix: Any = None  # scipy.sparse matrix
    commander_decks: Optional[pd.DataFrame] = None
    cdecks: Optional[Dict[int, CommanderDeck]] = None
    
    # Embeddings and clustering
    coordinates: Optional[np.ndarray] = None
    cluster_embedding: Optional[np.ndarray] = None
    cluster_labels: Optional[np.ndarray] = None
    
    # Cluster analysis results
    cluster_traits: Optional[pd.DataFrame] = None
    cluster_card_df: Optional[pd.DataFrame] = None
    cluster_noncard_df: Optional[pd.DataFrame] = None
    cluster_defining_cards: Optional[pd.DataFrame] = None
    average_decklists: Optional[Dict[int, int]] = None
    
    # Reference matrices for filtering
    date_matrix: Optional[np.ndarray] = None
    ci_matrix: Optional[np.ndarray] = None
    
    # Lookup dictionaries
    card_idx_lookup: Optional[Dict[str, int]] = None
    deck_date_idx_lookup: Optional[Dict[int, int]] = None
    card_date_idx_lookup: Optional[Dict[str, int]] = None
    deck_ci_idx_lookup: Optional[Dict[int, int]] = None
    card_ci_idx_lookup: Optional[Dict[str, int]] = None
    
    # Trait mapping
    trait_mapping_df: Optional[pd.DataFrame] = None
    
    def __post_init__(self):
        """Validate aggregate state after initialization."""
        self._validate_consistency()
    
    def _validate_consistency(self) -> None:
        """
        Validate that the decklist matrix and commander decks dataframe are consistent.
        
        Raises:
            ValueError: If matrix and dataframe dimensions don't match
        """
        if self.decklist_matrix is not None and self.commander_decks is not None:
            if self.decklist_matrix.shape[0] != self.commander_decks.shape[0]:
                raise ValueError(
                    'Decklist matrix and commander df must have the same number of elements.'
                )
            
            if self.cdecks is not None:
                if self.decklist_matrix.shape[0] != len(self.cdecks):
                    raise ValueError(
                        'Decklist matrix, commander df, and cdecks must have same number of elements.'
                    )
    
    def validate(self) -> bool:
        """
        Validate the aggregate state.
        
        Returns:
            bool: True if aggregate state is valid
        """
        try:
            self._validate_consistency()
            return True
        except ValueError:
            return False
    
    def reduce_dimensionality(
        self,
        method: str = 'UMAP',
        n_dims: Optional[int] = None,
        coordinates: bool = True,
        on_embedding: bool = False,
        **method_kwargs
    ) -> np.ndarray:
        """
        Reduce the dimensionality of the decklist matrix using UMAP.
        
        Args:
            method: Dimensionality reduction method (only 'UMAP' supported)
            n_dims: Number of dimensions (2 for coordinates, 4-6 for clustering)
            coordinates: If True, store result in coordinates; else in cluster_embedding
            on_embedding: If True, embed the existing cluster_embedding
            **method_kwargs: Additional arguments for UMAP (n_neighbors, min_dist, metric)
            
        Returns:
            np.ndarray: The embedding (n_decks x n_dims)
            
        Raises:
            NotImplementedError: If method is not 'UMAP'
            ValueError: If coordinates=True but n_dims != 2
        """
        from ..services.dimensionality_reduction_service import DimensionalityReductionService
        service = DimensionalityReductionService()
        
        embedding = service.reduce(
            data=self.cluster_embedding if on_embedding else self.decklist_matrix,
            method=method,
            n_dims=n_dims or (2 if coordinates else 6),
            **method_kwargs
        )
        
        # Handle disconnected points
        embedding = self._handle_disconnected_points(embedding, n_dims or 2)
        
        if coordinates:
            self.coordinates = embedding
            self.commander_decks[['x', 'y']] = embedding.round(6)
        else:
            self.cluster_embedding = embedding
        
        return embedding
    
    def _handle_disconnected_points(
        self,
        embedding: np.ndarray,
        n_dims: int
    ) -> np.ndarray:
        """
        Handle NaN entries in embedding by assigning disconnected points to nearest neighbors.
        
        Args:
            embedding: The embedding with potential NaN values
            n_dims: Number of dimensions in the embedding
            
        Returns:
            np.ndarray: Embedding with NaN values resolved
        """
        from ..services.clustering_service import ClusteringService
        clustering_svc = ClusteringService()
        return clustering_svc.handle_disconnected_points(
            embedding, self.cdecks, n_dims
        )
    
    def cluster_decks(
        self,
        method: str = 'HDBSCAN',
        **method_kwargs
    ) -> np.ndarray:
        """
        Cluster decks using HDBSCAN on the cluster embedding.
        
        Args:
            method: Clustering method (only 'HDBSCAN' supported)
            **method_kwargs: Arguments for HDBSCAN (min_cluster_size, min_samples)
            
        Returns:
            np.ndarray: Array of cluster labels
            
        Raises:
            ValueError: If cluster_embedding is None
            NotImplementedError: If method is not 'HDBSCAN'
        """
        if self.cluster_embedding is None:
            raise ValueError(
                'Must run reduce_dimensionality(..., coordinates=False) before clustering'
            )
        
        from ..services.clustering_service import ClusteringService
        service = ClusteringService()
        
        cluster_labels = service.cluster(
            embedding=self.cluster_embedding,
            method=method,
            n_decks=len(self.commander_decks),
            **method_kwargs
        )
        
        self.cluster_labels = cluster_labels
        self.commander_decks['clusterID'] = cluster_labels
        return cluster_labels
    
    def assign_unclustered(self, n_neighbors: int = 50) -> np.ndarray:
        """
        Assign unclustered decks (-1 labels) to clusters based on nearest neighbors.
        
        Args:
            n_neighbors: Number of neighbors to examine
            
        Returns:
            np.ndarray: Updated cluster labels
        """
        from ..services.clustering_service import ClusteringService
        service = ClusteringService()
        
        self.cluster_labels = service.assign_unclustered(
            cluster_labels=self.cluster_labels,
            cluster_embedding=self.cluster_embedding,
            n_neighbors=n_neighbors
        )
        
        self.commander_decks['clusterID'] = self.cluster_labels
        return self.cluster_labels
    
    def get_cluster_traits(
        self,
        topn: int = 20,
        min_perc: int = 1,
        drop_categories: Tuple[str, ...] = (),
        columns: Tuple[str, ...] = (
            'commander-partnerID', 'colorIdentityID', 'themeID', 'tribeID'
        )
    ) -> pd.DataFrame:
        """
        Get the defining traits (commanders, themes, tribes, etc.) for each cluster.
        
        Args:
            topn: Maximum traits to show per category
            min_perc: Minimum percentage threshold for inclusion
            drop_categories: Categories to exclude
            columns: Categories to analyze
            
        Returns:
            pd.DataFrame: Cluster traits with columns [clusterID, category, value, percent]
        """
        from ..services.cluster_analysis_service import ClusterAnalysisService
        service = ClusterAnalysisService()
        
        self.cluster_traits = service.get_cluster_traits(
            commander_decks=self.commander_decks,
            topn=topn,
            min_perc=min_perc,
            drop_categories=drop_categories,
            columns=columns
        )
        
        return self.cluster_traits
    
    def get_cluster_card_counts(
        self,
        color_rule: str = 'ignore',
        include_commanders: bool = False,
        chunksize: int = 1000,
        precomputed_noncard: Optional[Dict] = None,
        verbose: bool = False
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Calculate card counts per cluster, accounting for date and color identity restrictions.
        
        Args:
            color_rule: 'ignore' to skip color identity checks, else restrict by CI
            include_commanders: Whether to include commanders in counts
            chunksize: Chunk size for memory-efficient processing
            precomputed_noncard: Precomputed noncard data for optimization
            verbose: Whether to print progress
            
        Returns:
            Tuple of (cluster_card_df, cluster_noncard_df)
        """
        from ..services.cluster_analysis_service import ClusterAnalysisService
        service = ClusterAnalysisService()
        
        self.cluster_card_df, self.cluster_noncard_df = service.get_cluster_card_counts(
            commander_decks=self.commander_decks,
            decklist_matrix=self.decklist_matrix,
            card_idx_lookup=self.card_idx_lookup,
            date_matrix=self.date_matrix,
            ci_matrix=self.ci_matrix,
            deck_date_idx_lookup=self.deck_date_idx_lookup,
            card_date_idx_lookup=self.card_date_idx_lookup,
            deck_ci_idx_lookup=self.deck_ci_idx_lookup,
            card_ci_idx_lookup=self.card_ci_idx_lookup,
            color_rule=color_rule,
            include_commanders=include_commanders,
            chunksize=chunksize,
            precomputed_noncard=precomputed_noncard or {},
            verbose=verbose
        )
        
        return self.cluster_card_df, self.cluster_noncard_df
    
    def get_defining_cards(
        self,
        include_synergy: bool = True,
        n_scope: int = 200,
        verbose: bool = False
    ) -> pd.DataFrame:
        """
        Extract cards that define each cluster relative to all others.
        
        Args:
            include_synergy: Whether to calculate synergy scores
            n_scope: Number of top cards to analyze per cluster
            verbose: Whether to print progress
            
        Returns:
            pd.DataFrame: Defining cards with columns [clusterID, card, play_rate, synergy]
        """
        from ..services.cluster_analysis_service import ClusterAnalysisService
        service = ClusterAnalysisService()
        
        self.cluster_defining_cards = service.get_defining_cards(
            commander_decks=self.commander_decks,
            cluster_card_df=self.cluster_card_df,
            cluster_noncard_df=self.cluster_noncard_df,
            include_synergy=include_synergy,
            n_scope=n_scope,
            verbose=verbose
        )
        
        return self.cluster_defining_cards
    
    def calculate_average_decklists(
        self,
        ignore_clusters: Tuple[int, ...] = (),
        verbose: bool = False
    ) -> Dict[int, int]:
        """
        Calculate the average/representative decklist for each cluster.
        
        The "average" deck is the one with the highest mean synergy score.
        
        Args:
            ignore_clusters: Cluster IDs to skip
            verbose: Whether to print progress
            
        Returns:
            Dict mapping cluster_id to deck_id of representative deck
        """
        from ..services.cluster_analysis_service import ClusterAnalysisService
        service = ClusterAnalysisService()
        
        self.average_decklists = service.calculate_average_decklists(
            commander_decks=self.commander_decks,
            decklist_matrix=self.decklist_matrix,
            card_idx_lookup=self.card_idx_lookup,
            cluster_defining_cards=self.cluster_defining_cards,
            ignore_clusters=ignore_clusters,
            verbose=verbose
        )
        
        return self.average_decklists
    
    def get_trait_mapping(self) -> pd.DataFrame:
        """
        Create a mapping of traits (commanders, themes, tribes, colors) to integer IDs.
        
        Returns:
            pd.DataFrame: Trait mapping with columns [category, internal_slug, id]
        """
        from ..services.trait_mapping_service import TraitMappingService
        service = TraitMappingService()
        
        self.trait_mapping_df = service.get_trait_mapping(
            commander_decks=self.commander_decks,
            cdecks=self.cdecks
        )
        
        return self.trait_mapping_df
    
    def extract_deck_sources(self) -> None:
        """
        Extract deck sources from URLs and add siteID and path columns.
        
        Modifies self.commander_decks in place.
        """
        from ..services.url_extraction_service import UrlExtractionService
        service = UrlExtractionService()
        
        self.commander_decks['siteID'] = self.commander_decks['url'].apply(
            service.extract_source_from_url
        )
        self.commander_decks['path'] = self.commander_decks.apply(
            lambda row: service.fetch_decklist_ids_from_url(row['url'], row['siteID']),
            axis=1
        )
        
        # Convert site to integer
        unique_sites = sorted(list(set(self.commander_decks['siteID'])))
        site_mapping = dict(zip(unique_sites, range(len(unique_sites))))
        self.commander_decks['siteID'] = self.commander_decks['siteID'].replace(site_mapping)
    
    def copy_with_ref(
        self,
        decklist_matrix: Any,
        commander_deck_df: pd.DataFrame,
        commander_decks: Optional[Dict[int, CommanderDeck]]
    ) -> 'CommanderMapAggregate':
        """
        Create a new aggregate with new data but shared reference matrices.
        
        Args:
            decklist_matrix: New sparse decklist matrix
            commander_deck_df: New commander decks dataframe
            commander_decks: New dictionary of CommanderDeck entities
            
        Returns:
            New CommanderMapAggregate with shared references
        """
        import copy
        
        new_obj = CommanderMapAggregate(
            decklist_matrix=copy.copy(decklist_matrix),
            commander_decks=copy.copy(commander_deck_df),
            cdecks=copy.copy(commander_decks)
        )
        
        # Copy references to shared matrices
        new_obj.date_matrix = copy.copy(self.date_matrix)
        new_obj.ci_matrix = copy.copy(self.ci_matrix)
        new_obj.card_idx_lookup = copy.copy(self.card_idx_lookup)
        new_obj.deck_date_idx_lookup = copy.copy(self.deck_date_idx_lookup)
        new_obj.card_date_idx_lookup = copy.copy(self.card_date_idx_lookup)
        new_obj.deck_ci_idx_lookup = copy.copy(self.deck_ci_idx_lookup)
        new_obj.card_ci_idx_lookup = copy.copy(self.card_ci_idx_lookup)
        
        return new_obj
    
    def jsonify_map(
        self,
        magic_cards: dict,
        clusters: Optional[List[int]] = None,
        trait_mapping: Optional[dict] = None
    ) -> Any:
        """
        Convert map data to JSON-exportable format.
        
        Args:
            magic_cards: Dictionary of card data
            clusters: Specific clusters to export (None for all)
            trait_mapping: Trait to integer mapping for compression
            
        Returns:
            List of cluster data dictionaries, or single dict if one cluster
        """
        from ..services.export_service import ExportService
        service = ExportService()
        
        return service.jsonify_map(
            commander_decks=self.commander_decks,
            cluster_labels=self.cluster_labels,
            cluster_defining_cards=self.cluster_defining_cards,
            cluster_traits=self.cluster_traits,
            average_decklists=self.average_decklists,
            magic_cards=magic_cards,
            clusters=clusters,
            trait_mapping=trait_mapping
        )
