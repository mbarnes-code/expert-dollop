"""
Search Variants use case.

Application service for searching variants with various filters.
"""

from dataclasses import dataclass, field
from typing import List, Optional

# Domain imports (handles shared lib path setup)
from ...domain.entities import VariantEntity
from ...domain.repositories import VariantRepository

from ddd.services import ApplicationService


@dataclass
class SearchVariantsRequest:
    """Request DTO for Search Variants use case."""
    query: Optional[str] = None
    identity: Optional[str] = None
    format_name: Optional[str] = None
    feature_ids: Optional[List[int]] = None
    card_ids: Optional[List[int]] = None
    min_cards: Optional[int] = None
    max_cards: Optional[int] = None
    max_price: Optional[float] = None
    include_spoilers: bool = False
    page: int = 1
    page_size: int = 20


@dataclass
class VariantSummaryDTO:
    """Summary DTO for variant search results."""
    id: int
    unique_id: str
    name: str
    identity: str
    card_count: int
    bracket: Optional[int] = None
    price_tcgplayer: Optional[float] = None


@dataclass
class SearchVariantsResponse:
    """Response DTO for Search Variants use case."""
    variants: List[VariantSummaryDTO] = field(default_factory=list)
    total_count: int = 0
    page: int = 1
    page_size: int = 20
    has_next: bool = False
    error: Optional[str] = None


class SearchVariantsUseCase(ApplicationService[SearchVariantsRequest, SearchVariantsResponse]):
    """
    Application service for searching variants.
    
    Provides flexible variant search with multiple filter options.
    """
    
    def __init__(self, variant_repository: VariantRepository):
        self._variant_repository = variant_repository
    
    def execute(self, request: SearchVariantsRequest) -> SearchVariantsResponse:
        """
        Execute the variant search use case.
        
        Args:
            request: The search request with filters.
            
        Returns:
            Response with matching variants.
        """
        try:
            # Calculate pagination
            offset = (request.page - 1) * request.page_size
            limit = request.page_size + 1  # +1 to check for next page
            
            # Get variants based on filters
            variants: List[VariantEntity] = []
            
            if request.identity:
                variants = self._variant_repository.search_by_identity(request.identity)
            elif request.format_name:
                variants = self._variant_repository.get_legal_variants(
                    request.format_name, 
                    limit=limit
                )
            else:
                variants = self._variant_repository.get_all(limit=limit, offset=offset)
            
            # Check if there are more results
            has_next = len(variants) > request.page_size
            if has_next:
                variants = variants[:request.page_size]
            
            # Transform to DTOs
            variant_dtos = [
                VariantSummaryDTO(
                    id=v.id or 0,
                    unique_id=v.unique_id,
                    name=v.name,
                    identity=v.identity,
                    card_count=v.card_count,
                    bracket=v.bracket,
                    price_tcgplayer=v.price_tcgplayer
                )
                for v in variants
            ]
            
            return SearchVariantsResponse(
                variants=variant_dtos,
                total_count=self._variant_repository.count(),
                page=request.page,
                page_size=request.page_size,
                has_next=has_next
            )
            
        except Exception as e:
            return SearchVariantsResponse(error=str(e))
