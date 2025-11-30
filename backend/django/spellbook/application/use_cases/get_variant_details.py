"""
Get Variant Details use case.

Application service for retrieving detailed variant information.
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
from ...domain.repositories import VariantRepository, CardRepository, FeatureRepository


@dataclass
class CardDetailDTO:
    """Detailed card information."""
    id: int
    name: str
    type_line: str
    mana_value: int
    image_uri: Optional[str] = None


@dataclass
class FeatureDetailDTO:
    """Detailed feature information."""
    id: int
    name: str
    description: str


@dataclass
class GetVariantDetailsRequest:
    """Request DTO for Get Variant Details use case."""
    variant_id: Optional[int] = None
    unique_id: Optional[str] = None


@dataclass
class VariantDetailsDTO:
    """Detailed variant DTO with full information."""
    id: int
    unique_id: str
    name: str
    identity: str
    
    # Cards and features
    cards: List[CardDetailDTO] = field(default_factory=list)
    features_produced: List[FeatureDetailDTO] = field(default_factory=list)
    
    # Prerequisites and description
    mana_needed: str = ""
    mana_value_needed: int = 0
    easy_prerequisites: str = ""
    notable_prerequisites: str = ""
    description: str = ""
    notes: str = ""
    
    # Metadata
    bracket: Optional[int] = None
    popularity: Optional[int] = None
    
    # Prices
    price_tcgplayer: Optional[float] = None
    price_cardkingdom: Optional[float] = None
    price_cardmarket: Optional[float] = None
    
    # Legalities
    legalities: dict = field(default_factory=dict)


@dataclass
class GetVariantDetailsResponse:
    """Response DTO for Get Variant Details use case."""
    variant: Optional[VariantDetailsDTO] = None
    error: Optional[str] = None


class GetVariantDetailsUseCase(ApplicationService[GetVariantDetailsRequest, GetVariantDetailsResponse]):
    """
    Application service for getting detailed variant information.
    
    Assembles complete variant details including cards and features.
    """
    
    def __init__(
        self,
        variant_repository: VariantRepository,
        card_repository: CardRepository,
        feature_repository: FeatureRepository
    ):
        self._variant_repository = variant_repository
        self._card_repository = card_repository
        self._feature_repository = feature_repository
    
    def execute(self, request: GetVariantDetailsRequest) -> GetVariantDetailsResponse:
        """
        Execute the get variant details use case.
        
        Args:
            request: The request with variant ID or unique ID.
            
        Returns:
            Response with detailed variant information.
        """
        try:
            # Find the variant
            variant: Optional[VariantEntity] = None
            
            if request.unique_id:
                variant = self._variant_repository.get_by_unique_id(request.unique_id)
            elif request.variant_id:
                variant = self._variant_repository.get_by_id(request.variant_id)
            
            if not variant:
                return GetVariantDetailsResponse(error="Variant not found")
            
            # Assemble cards
            cards = []
            for card_id in variant.card_ids:
                card = self._card_repository.get_by_id(card_id)
                if card:
                    cards.append(CardDetailDTO(
                        id=card.id or 0,
                        name=card.name,
                        type_line=card.type_line,
                        mana_value=card.mana_value,
                        image_uri=card.image_uri_front_normal
                    ))
            
            # Assemble features
            features = []
            for feature_id in variant.feature_produced_ids:
                feature = self._feature_repository.get_by_id(feature_id)
                if feature:
                    features.append(FeatureDetailDTO(
                        id=feature.id or 0,
                        name=feature.name,
                        description=feature.description
                    ))
            
            # Build response DTO
            variant_dto = VariantDetailsDTO(
                id=variant.id or 0,
                unique_id=variant.unique_id,
                name=variant.name,
                identity=variant.identity,
                cards=cards,
                features_produced=features,
                mana_needed=variant.mana_needed,
                mana_value_needed=variant.mana_value_needed,
                easy_prerequisites=variant.easy_prerequisites,
                notable_prerequisites=variant.notable_prerequisites,
                description=variant.description,
                notes=variant.notes,
                bracket=variant.bracket,
                popularity=variant.popularity,
                price_tcgplayer=variant.price_tcgplayer,
                price_cardkingdom=variant.price_cardkingdom,
                price_cardmarket=variant.price_cardmarket,
                legalities=variant.legalities
            )
            
            return GetVariantDetailsResponse(variant=variant_dto)
            
        except Exception as e:
            return GetVariantDetailsResponse(error=str(e))
