"""
Combo domain entity.

Represents a combo (combination of cards) in the Commander Spellbook domain.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from .base import AggregateRoot


class ComboStatus(Enum):
    """Status of a combo in the system."""
    GENERATOR = 'G'
    UTILITY = 'U'
    DRAFT = 'D'
    NEEDS_REVIEW = 'NR'


@dataclass
class ComboEntity(AggregateRoot[int]):
    """
    Domain entity representing a combo (combination of cards and effects).
    
    Combos are recipes that describe how cards work together to produce
    specific effects or game states.
    """
    name: str = ""
    mana_needed: str = ""
    easy_prerequisites: str = ""
    notable_prerequisites: str = ""
    description: str = ""
    notes: str = ""
    comment: str = ""
    status: ComboStatus = ComboStatus.DRAFT
    
    # Behavior flags
    allow_many_cards: bool = False
    allow_multiple_copies: bool = False
    
    # Statistics
    variant_count: int = 0
    
    # Related entity IDs (maintaining aggregate boundaries)
    card_ids: List[int] = field(default_factory=list)
    template_ids: List[int] = field(default_factory=list)
    feature_needed_ids: List[int] = field(default_factory=list)
    feature_produced_ids: List[int] = field(default_factory=list)
    feature_removed_ids: List[int] = field(default_factory=list)
    
    # Card quantities in the combo
    card_quantities: Dict[int, int] = field(default_factory=dict)
    template_quantities: Dict[int, int] = field(default_factory=dict)
    
    def validate(self) -> bool:
        """Validate combo entity state."""
        # A combo should produce at least one feature
        if not self.feature_produced_ids:
            return False
        return True
    
    def is_generator(self) -> bool:
        """Check if this combo is a generator for variants."""
        return self.status == ComboStatus.GENERATOR
    
    def is_draft(self) -> bool:
        """Check if this combo is still in draft status."""
        return self.status == ComboStatus.DRAFT
    
    def get_card_quantity(self, card_id: int) -> int:
        """Get the quantity of a specific card in the combo."""
        return self.card_quantities.get(card_id, 0)
    
    def get_template_quantity(self, template_id: int) -> int:
        """Get the quantity of a specific template in the combo."""
        return self.template_quantities.get(template_id, 0)
