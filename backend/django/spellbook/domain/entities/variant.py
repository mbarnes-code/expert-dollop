"""
Variant domain entity.

Represents a variant (specific instance of a combo with concrete cards) 
in the Commander Spellbook domain.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

from .base import AggregateRoot


class VariantStatus(Enum):
    """Status of a variant in the system."""
    NEW = 'N'
    NOT_WORKING = 'NW'
    OK = 'OK'
    RESTORE = 'R'
    DRAFT = 'D'
    EXAMPLE = 'E'


class LegalityFormat(Enum):
    """Magic: The Gathering format for legality checks."""
    COMMANDER = 'commander'
    PAUPER_COMMANDER_MAIN = 'pauper_commander_main'
    PAUPER_COMMANDER = 'pauper_commander'
    OATHBREAKER = 'oathbreaker'
    PREDH = 'predh'
    BRAWL = 'brawl'
    VINTAGE = 'vintage'
    LEGACY = 'legacy'
    MODERN = 'modern'
    PIONEER = 'pioneer'
    STANDARD = 'standard'
    PAUPER = 'pauper'


@dataclass
class VariantEntity(AggregateRoot[int]):
    """
    Domain entity representing a variant (specific combo instance).
    
    Variants are concrete instances of combos with specific cards filled in
    for any template requirements.
    """
    name: str = ""
    unique_id: str = ""
    
    # Prerequisites and description
    mana_needed: str = ""
    mana_value_needed: int = 0
    easy_prerequisites: str = ""
    notable_prerequisites: str = ""
    description: str = ""
    notes: str = ""
    
    # Card identity
    identity: str = ""
    
    # Status
    status: VariantStatus = VariantStatus.DRAFT
    spoiler: bool = False
    
    # Bracket/power level
    bracket: Optional[int] = None
    
    # Popularity/usage
    popularity: Optional[int] = None
    
    # Card flags
    reserved: bool = False
    game_changer: bool = False
    mass_land_denial: bool = False
    extra_turn: bool = False
    
    # Related entity IDs
    card_ids: List[int] = field(default_factory=list)
    template_ids: List[int] = field(default_factory=list)
    feature_produced_ids: List[int] = field(default_factory=list)
    combo_ids: List[int] = field(default_factory=list)
    
    # Legality by format
    legalities: Dict[str, bool] = field(default_factory=dict)
    
    # Price information
    price_tcgplayer: Optional[float] = None
    price_cardkingdom: Optional[float] = None
    price_cardmarket: Optional[float] = None
    
    def validate(self) -> bool:
        """Validate variant entity state."""
        if not self.unique_id:
            return False
        if not self.card_ids and not self.template_ids:
            return False
        return True
    
    def is_legal_in(self, format_name: str) -> bool:
        """Check if variant is legal in a specific format."""
        return self.legalities.get(format_name, False)
    
    def is_budget_friendly(self, max_price: float = 50.0) -> bool:
        """Check if variant is budget-friendly based on TCGPlayer price."""
        if self.price_tcgplayer is None:
            return True  # Unknown price, assume budget-friendly
        return self.price_tcgplayer <= max_price
    
    @property
    def card_count(self) -> int:
        """Get total number of cards in the variant."""
        return len(self.card_ids)
