"""
Clustering Service.

Handles HDBSCAN-based clustering of deck embeddings.
"""

from typing import Any, Dict, Optional

import numpy as np
from scipy.spatial import KDTree


class ClusteringService:
    """
    Domain service for clustering deck embeddings.
    
    Uses HDBSCAN for density-based clustering of deck data,
    with post-processing to assign unclustered points.
    """
    
    def cluster(
        self,
        embedding: np.ndarray,
        method: str = 'HDBSCAN',
        n_decks: int = 0,
        **kwargs
    ) -> np.ndarray:
        """
        Cluster the embedding using HDBSCAN.
        
        Args:
            embedding: The deck embedding (n_samples x n_dims)
            method: Clustering method (only 'HDBSCAN' supported)
            n_decks: Number of decks (for small dataset handling)
            **kwargs: Additional HDBSCAN parameters
            
        Returns:
            np.ndarray: Cluster labels
            
        Raises:
            NotImplementedError: If method is not 'HDBSCAN'
        """
        if method != 'HDBSCAN':
            raise NotImplementedError('Only HDBSCAN implemented.')
        
        np.random.seed(0)
        
        # Handle very small datasets
        if n_decks <= 10:
            print('Too few decks to cluster, assigning all to one cluster.')
            return np.zeros(n_decks).astype(int)
        
        return self._hdbscan_cluster(embedding, **kwargs)
    
    def _hdbscan_cluster(
        self,
        embedding: np.ndarray,
        **kwargs
    ) -> np.ndarray:
        """
        Perform HDBSCAN clustering.
        
        Args:
            embedding: The deck embedding
            **kwargs: HDBSCAN parameters
            
        Returns:
            np.ndarray: Cluster labels
        """
        import hdbscan
        
        # Set defaults
        if 'min_cluster_size' not in kwargs:
            kwargs['min_cluster_size'] = 15
        
        if 'min_samples' not in kwargs:
            kwargs['min_samples'] = kwargs['min_cluster_size']
        
        clusterer = hdbscan.HDBSCAN(
            prediction_data=True,
            gen_min_span_tree=True,
            core_dist_n_jobs=1,
            **kwargs
        )
        
        return clusterer.fit_predict(embedding)
    
    def assign_unclustered(
        self,
        cluster_labels: np.ndarray,
        cluster_embedding: np.ndarray,
        n_neighbors: int = 50
    ) -> np.ndarray:
        """
        Assign unclustered points (-1 labels) to clusters based on nearest neighbors.
        
        Args:
            cluster_labels: Current cluster labels (with -1 for unclustered)
            cluster_embedding: The embedding used for clustering
            n_neighbors: Number of neighbors to examine
            
        Returns:
            np.ndarray: Updated cluster labels with no -1 values
        """
        unclustered_count = np.sum(cluster_labels == -1)
        
        if unclustered_count == 0:
            print('No decks unclustered, returning original assignments.')
            return cluster_labels
        
        if unclustered_count == len(cluster_labels):
            print('No decks clustered. Assigning all to one cluster.')
            return np.zeros(len(cluster_labels), dtype=int)
        
        # Separate clustered and unclustered
        unclustered = np.where(cluster_labels == -1)[0]
        clustered = np.where(cluster_labels != -1)[0]
        
        clustered_embedding = cluster_embedding[clustered, :]
        unclustered_embedding = cluster_embedding[unclustered, :]
        
        # Reduce neighbors if needed
        if clustered_embedding.shape[0] < n_neighbors + 1:
            print('Fewer clustered decks than n_neighbors, reducing')
            n_neighbors = clustered_embedding.shape[0] - 1
        
        # Use KDTree for efficient neighbor search
        kdtree = KDTree(clustered_embedding)
        _, indices = kdtree.query(unclustered_embedding, n_neighbors)
        
        # Get cluster assignments of neighbors and take majority vote
        umap_indices = clustered[indices]
        cluster_assignments_neighbors = cluster_labels[umap_indices]
        cluster_assignments = np.array([
            np.bincount(row).argmax() for row in cluster_assignments_neighbors
        ])
        
        # Update labels
        result = cluster_labels.copy()
        result[unclustered] = cluster_assignments
        return result
    
    def handle_disconnected_points(
        self,
        embedding: np.ndarray,
        cdecks: Optional[Dict] = None,
        n_dims: int = 2
    ) -> np.ndarray:
        """
        Handle NaN entries in embedding by assigning to nearest similar deck.
        
        Args:
            embedding: The embedding with potential NaN values
            cdecks: Dictionary of CommanderDeck objects for similarity
            n_dims: Number of dimensions
            
        Returns:
            np.ndarray: Embedding with NaN values resolved
        """
        nan_entries = np.isnan(embedding).any(axis=1)
        
        if np.sum(nan_entries) == 0:
            return embedding
        
        disconnected_idx = np.where(nan_entries)[0]
        connected_idx = np.where(~nan_entries)[0]
        
        if len(connected_idx) == 0:
            # All points disconnected, use random embedding
            return np.random.uniform(size=embedding.shape)
        
        disconnected_assignments = []
        for d in disconnected_idx:
            if cdecks:
                d_deck = cdecks.get(d)
                if d_deck:
                    # Find decks with same commander
                    decks_with_comm = [
                        i for i, cdeck in cdecks.items()
                        if cdeck.commander == d_deck.commander and i != d
                    ]
                    
                    if decks_with_comm:
                        # Use Jaccard similarity
                        jaccard_distances = [
                            self._jaccard(d_deck.cards, cdecks[i].cards)
                            for i in decks_with_comm
                        ]
                        smallest_deck_idx = decks_with_comm[np.argmax(jaccard_distances)]
                    else:
                        smallest_deck_idx = np.random.choice(connected_idx)
                else:
                    smallest_deck_idx = np.random.choice(connected_idx)
            else:
                smallest_deck_idx = np.random.choice(connected_idx)
            
            disconnected_assignments.append(smallest_deck_idx)
        
        # Assign with small noise to avoid overlap
        noise = np.random.uniform(0.001, 0.002, size=(n_dims,)) * np.random.choice([1, -1], size=(n_dims,))
        embedding[disconnected_idx] = embedding[np.array(disconnected_assignments)] + noise
        
        return embedding
    
    @staticmethod
    def _jaccard(list1: list, list2: list) -> float:
        """Calculate Jaccard similarity between two lists."""
        set1, set2 = set(list1), set(list2)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return intersection / union if union > 0 else 0.0
    
    @staticmethod
    def get_parameters(n_decks: int) -> tuple:
        """
        Get recommended UMAP/HDBSCAN parameters based on dataset size.
        
        Args:
            n_decks: Number of decks
            
        Returns:
            Tuple of (n_neighbors, min_cluster_size)
        """
        if n_decks < 300:
            return 4, 4
        elif n_decks < 500:
            return 6, 6
        elif n_decks < 1000:
            return 8, 6
        elif n_decks < 2000:
            return 10, 6
        elif n_decks < 5000:
            return 12, 6
        elif n_decks < 20000:
            return 15, 8
        else:
            return 25, 12
