"""
Card Type Value Object.

Represents the type of an MTG card for sorting and categorization.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List


class CardTypeCategory(Enum):
    """Enumeration of main card type categories in MTG."""
    
    CREATURE = "Creature"
    SORCERY = "Sorcery"
    INSTANT = "Instant"
    ARTIFACT = "Artifact"
    ENCHANTMENT = "Enchantment"
    PLANESWALKER = "Planeswalker"
    NONBASIC_LAND = "Nonbasic Land"
    BASIC_LAND = "Basic Land"
    LAND = "Land"
    
    @property
    def sort_order(self) -> int:
        """Get the sort order for this card type."""
        order = [
            CardTypeCategory.CREATURE,
            CardTypeCategory.SORCERY,
            CardTypeCategory.INSTANT,
            CardTypeCategory.ARTIFACT,
            CardTypeCategory.ENCHANTMENT,
            CardTypeCategory.PLANESWALKER,
            CardTypeCategory.NONBASIC_LAND,
            CardTypeCategory.BASIC_LAND,
        ]
        try:
            return order.index(self)
        except ValueError:
            return len(order)


@dataclass(frozen=True)
class CardType:
    """
    Immutable value object representing an MTG card type.
    
    Extracts and categorizes the primary card type from a type line.
    
    Attributes:
        category: The primary card type category
        type_line: The full type line from the card
    """
    
    category: CardTypeCategory
    type_line: str
    
    BASIC_LANDS = frozenset([
        'Mountain', 'Forest', 'Island', 'Plains', 'Swamp', 'Wastes',
        'Snow-Covered Mountain', 'Snow-Covered Forest', 'Snow-Covered Island',
        'Snow-Covered Plains', 'Snow-Covered Swamp'
    ])
    
    @classmethod
    def from_type_line(cls, card_name: str, type_line: str) -> 'CardType':
        """
        Create a CardType from a card's type line.
        
        Args:
            card_name: The card's name (for basic land detection)
            type_line: The full type line (e.g., "Legendary Creature — Elf Warrior")
            
        Returns:
            CardType instance
        """
        possible_types = [
            CardTypeCategory.LAND,
            CardTypeCategory.CREATURE,
            CardTypeCategory.SORCERY,
            CardTypeCategory.INSTANT,
            CardTypeCategory.ARTIFACT,
            CardTypeCategory.ENCHANTMENT,
            CardTypeCategory.PLANESWALKER,
        ]
        
        # Find the first matching type
        main_type = None
        for card_type in possible_types:
            if card_type.value in type_line:
                main_type = card_type
                break
        
        if main_type is None:
            main_type = CardTypeCategory.CREATURE  # Default fallback
        
        # Special handling for lands
        if main_type == CardTypeCategory.LAND:
            if card_name in cls.BASIC_LANDS:
                main_type = CardTypeCategory.BASIC_LAND
            else:
                main_type = CardTypeCategory.NONBASIC_LAND
        
        return cls(category=main_type, type_line=type_line)
    
    def is_permanent(self) -> bool:
        """Check if this card type is a permanent."""
        permanents = {
            CardTypeCategory.CREATURE,
            CardTypeCategory.ARTIFACT,
            CardTypeCategory.ENCHANTMENT,
            CardTypeCategory.PLANESWALKER,
            CardTypeCategory.LAND,
            CardTypeCategory.BASIC_LAND,
            CardTypeCategory.NONBASIC_LAND,
        }
        return self.category in permanents
    
    def is_land(self) -> bool:
        """Check if this card type is a land."""
        return self.category in {
            CardTypeCategory.LAND,
            CardTypeCategory.BASIC_LAND,
            CardTypeCategory.NONBASIC_LAND,
        }
    
    def __str__(self) -> str:
        return self.category.value
