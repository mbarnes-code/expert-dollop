"""
Template domain entity.

Represents a template (abstract card requirement) in the Commander Spellbook domain.
"""

from dataclasses import dataclass, field
from typing import List, Optional

from .base import AggregateRoot


@dataclass
class TemplateEntity(AggregateRoot[int]):
    """
    Domain entity representing a template (abstract card requirement).
    
    Templates represent abstract requirements like "Any sacrifice outlet"
    or "Any creature that can be sacrificed" that can be filled by
    multiple specific cards.
    """
    name: str = ""
    scryfall_query: str = ""
    scryfall_uri: Optional[str] = None
    
    # Statistics
    variant_count: int = 0
    
    # Related cards that satisfy this template
    replacement_card_ids: List[int] = field(default_factory=list)
    
    def validate(self) -> bool:
        """Validate template entity state."""
        if not self.name:
            return False
        return True
    
    def has_replacements(self) -> bool:
        """Check if template has replacement cards."""
        return len(self.replacement_card_ids) > 0
