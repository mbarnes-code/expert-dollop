"""
Feature repository interface.

Defines the data access contract for Feature entities.
"""

import sys
from abc import abstractmethod
from pathlib import Path
from typing import List, Optional

# Add shared libs to path for imports
libs_path = Path(__file__).resolve().parents[6] / 'libs' / 'shared' / 'python'
if str(libs_path) not in sys.path:
    sys.path.insert(0, str(libs_path))

from ddd.repositories import Repository
from ..entities import FeatureEntity


class FeatureRepository(Repository[FeatureEntity, int]):
    """
    Repository interface for Feature aggregate.
    
    Extends the base Repository with Feature-specific query methods.
    """
    
    @abstractmethod
    def get_by_name(self, name: str) -> Optional[FeatureEntity]:
        """
        Get a feature by its exact name.
        
        Args:
            name: The exact feature name.
            
        Returns:
            The feature if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def search_by_name(self, query: str, limit: int = 10) -> List[FeatureEntity]:
        """
        Search features by name using fuzzy matching.
        
        Args:
            query: The search query string.
            limit: Maximum number of results.
            
        Returns:
            List of matching features.
        """
        pass
    
    @abstractmethod
    def get_utility_features(self) -> List[FeatureEntity]:
        """
        Get all utility features.
        
        Returns:
            List of utility features.
        """
        pass
    
    @abstractmethod
    def get_popular_features(self, limit: int = 20) -> List[FeatureEntity]:
        """
        Get the most popular features by variant count.
        
        Args:
            limit: Maximum number of results.
            
        Returns:
            List of popular features sorted by variant count.
        """
        pass
