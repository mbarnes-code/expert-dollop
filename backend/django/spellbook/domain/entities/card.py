"""
Card domain entity.

Represents a Magic: The Gathering card in the Commander Spellbook domain.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from uuid import UUID

from .base import AggregateRoot


@dataclass
class CardEntity(AggregateRoot):
    """
    Domain entity representing a Magic: The Gathering card.
    
    This is a core aggregate root in the Spellbook bounded context,
    representing cards that can be used in combos and variants.
    """
    name: str = ""
    name_unaccented: str = ""
    oracle_id: Optional[UUID] = None
    type_line: str = ""
    oracle_text: str = ""
    keywords: List[str] = field(default_factory=list)
    mana_value: int = 0
    identity: str = ""
    
    # Card properties
    reserved: bool = False
    reprinted: bool = False
    tutor: bool = False
    mass_land_denial: bool = False
    extra_turn: bool = False
    game_changer: bool = False
    spoiler: bool = False
    
    # Set information
    latest_printing_set: str = ""
    
    # Image URIs
    image_uri_front_png: Optional[str] = None
    image_uri_front_large: Optional[str] = None
    image_uri_front_normal: Optional[str] = None
    image_uri_front_small: Optional[str] = None
    image_uri_front_art_crop: Optional[str] = None
    image_uri_back_png: Optional[str] = None
    image_uri_back_large: Optional[str] = None
    image_uri_back_normal: Optional[str] = None
    image_uri_back_small: Optional[str] = None
    image_uri_back_art_crop: Optional[str] = None
    
    # Statistics
    variant_count: int = 0
    
    def validate(self) -> bool:
        """Validate card entity state."""
        if not self.name:
            return False
        return True
    
    def is_of_type(self, card_type: str) -> bool:
        """Check if card is of a specific type."""
        return card_type in self.type_line
    
    def has_keyword(self, keyword: str) -> bool:
        """Check if card has a specific keyword."""
        return keyword.lower() in [k.lower() for k in self.keywords]
    
    @property
    def scryfall_link(self) -> Optional[str]:
        """Generate Scryfall link for the card."""
        if self.oracle_id:
            return f"https://scryfall.com/search?q=oracleid:{self.oracle_id}"
        return None
