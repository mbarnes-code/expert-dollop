"""
Find My Combos use case.

Application service for finding combos based on user's card collection.
"""

import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

# Add shared libs to path for imports
libs_path = Path(__file__).resolve().parents[6] / 'libs' / 'shared' / 'python'
if str(libs_path) not in sys.path:
    sys.path.insert(0, str(libs_path))

from ddd.services import ApplicationService
from ...domain.entities import VariantEntity
from ...domain.repositories import CardRepository, VariantRepository
from ...domain.services import ComboFinderService


@dataclass
class FindMyCombosRequest:
    """Request DTO for Find My Combos use case."""
    card_names: List[str]
    commander_names: Optional[List[str]] = None
    identity: Optional[str] = None
    format_name: Optional[str] = None
    max_price: Optional[float] = None
    include_spoilers: bool = False
    include_almost: bool = True
    almost_missing_limit: int = 3


@dataclass
class VariantDTO:
    """Data transfer object for variant information."""
    id: int
    unique_id: str
    name: str
    identity: str
    card_names: List[str]
    feature_names: List[str]
    mana_needed: str
    description: str
    notes: str
    bracket: Optional[int] = None
    price_tcgplayer: Optional[float] = None


@dataclass
class FindMyCombosResponse:
    """Response DTO for Find My Combos use case."""
    included_variants: List[VariantDTO] = field(default_factory=list)
    almost_included_variants: List[VariantDTO] = field(default_factory=list)
    total_included_count: int = 0
    cards_matched_count: int = 0
    error: Optional[str] = None


class FindMyCombosUseCase(ApplicationService[FindMyCombosRequest, FindMyCombosResponse]):
    """
    Application service for finding combos with user's cards.
    
    This use case orchestrates:
    1. Resolving card names to card entities
    2. Using the combo finder service to find matching variants
    3. Transforming results to DTOs
    """
    
    def __init__(
        self,
        card_repository: CardRepository,
        variant_repository: VariantRepository,
        combo_finder: ComboFinderService
    ):
        self._card_repository = card_repository
        self._variant_repository = variant_repository
        self._combo_finder = combo_finder
    
    def execute(self, request: FindMyCombosRequest) -> FindMyCombosResponse:
        """
        Execute the find my combos use case.
        
        Args:
            request: The request containing card names and filters.
            
        Returns:
            Response with matching combos/variants.
        """
        try:
            # Resolve card names to IDs
            card_ids = []
            for name in request.card_names:
                card = self._card_repository.get_by_name(name)
                if card and card.id:
                    card_ids.append(card.id)
            
            if not card_ids:
                return FindMyCombosResponse(
                    error="No valid cards found from the provided names"
                )
            
            # Find variants using the domain service
            from ...domain.services.combo_finder import ComboSearchCriteria
            criteria = ComboSearchCriteria(
                card_ids=card_ids,
                identity=request.identity,
                format_name=request.format_name,
                max_price=request.max_price,
                include_spoilers=request.include_spoilers
            )
            
            result = self._combo_finder.find_combos(criteria)
            
            # Transform to DTOs
            included_dtos = [self._to_dto(v) for v in result.variants]
            
            almost_dtos = []
            if request.include_almost:
                almost_variants = self._combo_finder.find_almost_combos(
                    criteria, 
                    request.almost_missing_limit
                )
                almost_dtos = [self._to_dto(v) for v in almost_variants]
            
            return FindMyCombosResponse(
                included_variants=included_dtos,
                almost_included_variants=almost_dtos,
                total_included_count=result.total_count,
                cards_matched_count=result.included_cards_count
            )
            
        except Exception as e:
            return FindMyCombosResponse(error=str(e))
    
    def _to_dto(self, variant: VariantEntity) -> VariantDTO:
        """Transform variant entity to DTO."""
        return VariantDTO(
            id=variant.id or 0,
            unique_id=variant.unique_id,
            name=variant.name,
            identity=variant.identity,
            card_names=[],  # Would need to resolve from card_ids
            feature_names=[],  # Would need to resolve from feature_produced_ids
            mana_needed=variant.mana_needed,
            description=variant.description,
            notes=variant.notes,
            bracket=variant.bracket,
            price_tcgplayer=variant.price_tcgplayer
        )
