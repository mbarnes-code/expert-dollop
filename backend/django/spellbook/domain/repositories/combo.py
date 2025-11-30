"""
Combo repository interface.

Defines the data access contract for Combo entities.
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
from ..entities import ComboEntity
from ..entities.combo import ComboStatus


class ComboRepository(Repository[ComboEntity, int]):
    """
    Repository interface for Combo aggregate.
    
    Extends the base Repository with Combo-specific query methods.
    """
    
    @abstractmethod
    def get_by_status(self, status: ComboStatus, limit: Optional[int] = None) -> List[ComboEntity]:
        """
        Get combos by status.
        
        Args:
            status: The combo status to filter by.
            limit: Maximum number of results.
            
        Returns:
            List of combos with the given status.
        """
        pass
    
    @abstractmethod
    def get_generators(self, limit: Optional[int] = None) -> List[ComboEntity]:
        """
        Get all generator combos.
        
        Args:
            limit: Maximum number of results.
            
        Returns:
            List of generator combos.
        """
        pass
    
    @abstractmethod
    def get_combos_using_card(self, card_id: int) -> List[ComboEntity]:
        """
        Get all combos that use a specific card.
        
        Args:
            card_id: The card ID to search for.
            
        Returns:
            List of combos using the card.
        """
        pass
    
    @abstractmethod
    def get_combos_producing_feature(self, feature_id: int) -> List[ComboEntity]:
        """
        Get all combos that produce a specific feature.
        
        Args:
            feature_id: The feature ID to search for.
            
        Returns:
            List of combos producing the feature.
        """
        pass
    
    @abstractmethod
    def get_combos_needing_feature(self, feature_id: int) -> List[ComboEntity]:
        """
        Get all combos that need a specific feature.
        
        Args:
            feature_id: The feature ID to search for.
            
        Returns:
            List of combos needing the feature.
        """
        pass
