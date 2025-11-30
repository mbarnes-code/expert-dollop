"""
Variant repository interface.

Defines the data access contract for Variant entities.
"""

from abc import abstractmethod
from typing import List, Optional

# Import utilities ensure shared libs are available
from .. import _imports  # noqa: F401

from ddd.repositories import Repository
from ..entities import VariantEntity
from ..entities.variant import VariantStatus


class VariantRepository(Repository[VariantEntity, int]):
    """
    Repository interface for Variant aggregate.
    
    Extends the base Repository with Variant-specific query methods.
    """
    
    @abstractmethod
    def get_by_unique_id(self, unique_id: str) -> Optional[VariantEntity]:
        """
        Get a variant by its unique string ID.
        
        Args:
            unique_id: The unique string identifier.
            
        Returns:
            The variant if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def get_by_status(self, status: VariantStatus, limit: Optional[int] = None) -> List[VariantEntity]:
        """
        Get variants by status.
        
        Args:
            status: The variant status to filter by.
            limit: Maximum number of results.
            
        Returns:
            List of variants with the given status.
        """
        pass
    
    @abstractmethod
    def get_variants_with_card(self, card_id: int) -> List[VariantEntity]:
        """
        Get all variants that contain a specific card.
        
        Args:
            card_id: The card ID to search for.
            
        Returns:
            List of variants containing the card.
        """
        pass
    
    @abstractmethod
    def get_variants_producing_feature(self, feature_id: int) -> List[VariantEntity]:
        """
        Get all variants that produce a specific feature.
        
        Args:
            feature_id: The feature ID to search for.
            
        Returns:
            List of variants producing the feature.
        """
        pass
    
    @abstractmethod
    def get_legal_variants(self, format_name: str, limit: Optional[int] = None) -> List[VariantEntity]:
        """
        Get all variants legal in a specific format.
        
        Args:
            format_name: The format to check legality for.
            limit: Maximum number of results.
            
        Returns:
            List of legal variants.
        """
        pass
    
    @abstractmethod
    def search_by_identity(self, identity: str) -> List[VariantEntity]:
        """
        Search variants by color identity.
        
        Args:
            identity: The color identity string (e.g., "WUB").
            
        Returns:
            List of variants matching the identity.
        """
        pass
    
    @abstractmethod
    def find_by_cards(self, card_ids: List[int]) -> List[VariantEntity]:
        """
        Find variants that can be built with the given cards.
        
        Args:
            card_ids: List of available card IDs.
            
        Returns:
            List of buildable variants.
        """
        pass
