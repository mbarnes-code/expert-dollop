"""
Template repository interface.

Defines the data access contract for Template entities.
"""

from abc import abstractmethod
from typing import List, Optional

# Import utilities ensure shared libs are available
from .. import _imports  # noqa: F401

from ddd.repositories import Repository
from ..entities import TemplateEntity


class TemplateRepository(Repository[TemplateEntity, int]):
    """
    Repository interface for Template aggregate.
    
    Extends the base Repository with Template-specific query methods.
    """
    
    @abstractmethod
    def get_by_name(self, name: str) -> Optional[TemplateEntity]:
        """
        Get a template by its exact name.
        
        Args:
            name: The exact template name.
            
        Returns:
            The template if found, None otherwise.
        """
        pass
    
    @abstractmethod
    def search_by_name(self, query: str, limit: int = 10) -> List[TemplateEntity]:
        """
        Search templates by name using fuzzy matching.
        
        Args:
            query: The search query string.
            limit: Maximum number of results.
            
        Returns:
            List of matching templates.
        """
        pass
    
    @abstractmethod
    def get_templates_for_card(self, card_id: int) -> List[TemplateEntity]:
        """
        Get all templates that a card can satisfy.
        
        Args:
            card_id: The card ID to check.
            
        Returns:
            List of templates the card satisfies.
        """
        pass
    
    @abstractmethod
    def get_cards_for_template(self, template_id: int) -> List[int]:
        """
        Get all card IDs that satisfy a template.
        
        Args:
            template_id: The template ID.
            
        Returns:
            List of card IDs that satisfy the template.
        """
        pass
