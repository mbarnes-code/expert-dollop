"""
Feature domain entity.

Represents a feature (effect or characteristic) in the Commander Spellbook domain.
"""

from dataclasses import dataclass, field
from typing import List, Optional

from .base import AggregateRoot


@dataclass
class FeatureEntity(AggregateRoot[int]):
    """
    Domain entity representing a feature (effect or characteristic).
    
    Features represent the effects that cards can produce or require,
    such as "Infinite mana", "Draw cards", etc.
    """
    name: str = ""
    description: str = ""
    
    # Feature behavior
    uncountable: bool = False
    utility: bool = False
    
    # Statistics
    variant_count: int = 0
    
    def validate(self) -> bool:
        """Validate feature entity state."""
        if not self.name:
            return False
        return True
    
    def is_utility(self) -> bool:
        """Check if this is a utility feature."""
        return self.utility
