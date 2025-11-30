"""
Combo repository interface.

Defines the data access contract for Combo entities.
"""

from abc import abstractmethod
from typing import List, Optional

# Import utilities ensure shared libs are available
from .. import _imports  # noqa: F401

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
