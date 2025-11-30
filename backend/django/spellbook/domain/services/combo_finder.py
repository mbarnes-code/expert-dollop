"""
Combo finder domain service.

Provides domain logic for finding combos based on available cards.
"""

import sys
from abc import abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

# Add shared libs to path for imports
libs_path = Path(__file__).resolve().parents[6] / 'libs' / 'shared' / 'python'
if str(libs_path) not in sys.path:
    sys.path.insert(0, str(libs_path))

from ddd.services import DomainService
from ..entities import VariantEntity


@dataclass
class ComboSearchCriteria:
    """Criteria for searching combos."""
    card_ids: List[int]
    commander_ids: Optional[List[int]] = None
    identity: Optional[str] = None
    format_name: Optional[str] = None
    max_price: Optional[float] = None
    include_spoilers: bool = False


@dataclass
class ComboSearchResult:
    """Result of a combo search."""
    variants: List[VariantEntity]
    total_count: int
    included_cards_count: int
    almost_included_variants: List[VariantEntity]


class ComboFinderService(DomainService):
    """
    Domain service for finding combos with available cards.
    
    This service encapsulates the complex domain logic for matching
    a user's card collection to available combos/variants.
    """
    
    @abstractmethod
    def find_combos(self, criteria: ComboSearchCriteria) -> ComboSearchResult:
        """
        Find all combos that can be built with the given criteria.
        
        Args:
            criteria: The search criteria including available cards.
            
        Returns:
            Search result with matching variants.
        """
        pass
    
    @abstractmethod
    def find_almost_combos(
        self, 
        criteria: ComboSearchCriteria, 
        missing_cards_limit: int = 3
    ) -> List[VariantEntity]:
        """
        Find combos that are almost completable with given cards.
        
        Args:
            criteria: The search criteria including available cards.
            missing_cards_limit: Maximum number of missing cards allowed.
            
        Returns:
            List of variants that are almost complete.
        """
        pass
    
    def execute(self, *args, **kwargs):
        """Execute the combo finder service."""
        if 'criteria' in kwargs:
            return self.find_combos(kwargs['criteria'])
        return None
