"""
Card repository interface.

Defines the data access contract for Card entities.
"""

from abc import abstractmethod
from typing import List, Optional

# Import utilities ensure shared libs are available
from .. import _imports  # noqa: F401

from ddd.repositories import Repository
from ..entities import CardEntity


class CardRepository(Repository[CardEntity, int]):
    """
    Repository interface for Card aggregate.
    
    Extends the base Repository with Card-specific query methods.
    """
    
    @abstractmethod
    def get_by_name(self, name: str) -> Optional[CardEntity]:
        """
        Get a card by its exact name.
        
        Args:
            name: The exact card name.
            
        Returns:
            The card if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def get_by_oracle_id(self, oracle_id: str) -> Optional[CardEntity]:
        """
        Get a card by its Scryfall Oracle ID.
        
        Args:
            oracle_id: The Scryfall Oracle UUID.
            
        Returns:
            The card if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def search_by_name(self, query: str, limit: int = 10) -> List[CardEntity]:
        """
        Search cards by name using fuzzy matching.
        
        Args:
            query: The search query string.
            limit: Maximum number of results.
            
        Returns:
            List of matching cards.
        """
        pass
    
    @abstractmethod
    def get_by_type(self, type_line: str, limit: Optional[int] = None) -> List[CardEntity]:
        """
        Get cards by type line.
        
        Args:
            type_line: The type to search for (e.g., "Creature", "Artifact").
            limit: Maximum number of results.
            
        Returns:
            List of cards matching the type.
        """
        pass
    
    @abstractmethod
    def get_cards_with_keyword(self, keyword: str) -> List[CardEntity]:
        """
        Get all cards with a specific keyword.
        
        Args:
            keyword: The keyword to search for.
            
        Returns:
            List of cards with the keyword.
        """
        pass
