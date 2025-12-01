"""
Dimensionality Reduction Service.

Handles UMAP-based dimensionality reduction for deck embeddings.
"""

from typing import Any, Optional

import numpy as np


class DimensionalityReductionService:
    """
    Domain service for reducing dimensionality of deck data.
    
    Uses UMAP to create embeddings suitable for visualization (2D)
    or clustering (higher dimensions).
    """
    
    def reduce(
        self,
        data: Any,
        method: str = 'UMAP',
        n_dims: int = 2,
        **kwargs
    ) -> np.ndarray:
        """
        Reduce dimensionality of the input data.
        
        Args:
            data: Sparse matrix or dense array of deck data
            method: Reduction method (only 'UMAP' supported)
            n_dims: Target number of dimensions
            **kwargs: Additional UMAP parameters (n_neighbors, min_dist, metric)
            
        Returns:
            np.ndarray: Reduced embedding (n_samples x n_dims)
            
        Raises:
            NotImplementedError: If method is not 'UMAP'
        """
        if method != 'UMAP':
            raise NotImplementedError('Only UMAP is implemented.')
        
        return self._umap_reduce(data, n_dims, **kwargs)
    
    def _umap_reduce(
        self,
        data: Any,
        n_dims: int,
        **kwargs
    ) -> np.ndarray:
        """
        Perform UMAP dimensionality reduction.
        
        Args:
            data: Input data matrix
            n_dims: Number of output dimensions
            **kwargs: UMAP parameters
            
        Returns:
            np.ndarray: UMAP embedding
        """
        import umap.umap_ as umap
        
        np.random.seed(0)
        random_state = np.random.RandomState(0)
        
        # Set default metric based on data type
        if 'metric' not in kwargs:
            kwargs['metric'] = 'jaccard'
        
        embedder = umap.UMAP(
            n_components=n_dims,
            random_state=random_state,
            verbose=True,
            **kwargs
        )
        
        try:
            embedding = embedder.fit_transform(data)
        except Exception:
            print('Failed to embed. Using random embedding.')
            n_samples = data.shape[0] if hasattr(data, 'shape') else len(data)
            embedding = np.random.uniform(size=(n_samples, n_dims))
        
        return embedding
