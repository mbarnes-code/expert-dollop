"""
Color Identity Value Object.

Represents the color identity of a card or deck in MTG.
"""

from dataclasses import dataclass
from typing import Any, Tuple
import itertools


@dataclass(frozen=True)
class ColorIdentity:
    """
    Immutable value object representing an MTG color identity.
    
    Color identity follows WUBRG ordering (White, Blue, Black, Red, Green).
    Empty color identity represents colorless.
    
    Attributes:
        colors: Tuple of color characters in WUBRG order
    """
    
    colors: Tuple[str, ...] = ()
    
    WUBRG_ORDER = ('W', 'U', 'B', 'R', 'G')
    
    def __post_init__(self):
        """Validate and sort colors on initialization."""
        # Validate colors
        for color in self.colors:
            if color not in self.WUBRG_ORDER:
                raise ValueError(f"Invalid color: {color}. Must be one of {self.WUBRG_ORDER}")
        # Sort colors to WUBRG order (frozen dataclass requires object.__setattr__)
        sorted_colors = tuple(sorted(self.colors, key=lambda c: self.WUBRG_ORDER.index(c)))
        object.__setattr__(self, 'colors', sorted_colors)
    
    @classmethod
    def from_string(cls, ci_string: str) -> 'ColorIdentity':
        """
        Create a ColorIdentity from a string like 'WUB' or '{W,U,B}'.
        
        Args:
            ci_string: Color identity string
            
        Returns:
            ColorIdentity instance
        """
        # Handle bracketed format like '{W,U,B}'
        if ci_string.startswith('{'):
            ci_string = ci_string[1:-1:2]  # Extract just the letters
        
        # Filter to valid colors and sort to WUBRG order
        valid_colors = [c for c in ci_string if c in cls.WUBRG_ORDER]
        colors = tuple(sorted(valid_colors, key=lambda c: cls.WUBRG_ORDER.index(c)))
        return cls(colors=colors)
    
    def to_string(self) -> str:
        """
        Convert to a string representation.
        
        Returns:
            String like 'WUB' or empty string for colorless
        """
        return ''.join(self.colors)
    
    def can_play(self, card_identity: 'ColorIdentity') -> bool:
        """
        Check if this color identity can play a card with the given identity.
        
        A deck can play a card if the deck's identity is a superset of the card's.
        
        Args:
            card_identity: The color identity of the card
            
        Returns:
            bool: True if the card can be played
        """
        return all(c in self.colors for c in card_identity.colors)
    
    @classmethod
    def all_identities(cls) -> list:
        """
        Generate all 32 possible color identities.
        
        Returns:
            List of all ColorIdentity instances
        """
        result = []
        for r in range(len(cls.WUBRG_ORDER) + 1):
            for combo in itertools.combinations(cls.WUBRG_ORDER, r):
                result.append(cls(colors=combo))
        return result
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, ColorIdentity):
            return False
        return self.colors == other.colors
    
    def __hash__(self) -> int:
        return hash(self.colors)
    
    def __str__(self) -> str:
        return self.to_string() or 'C'  # 'C' for colorless
    
    def __repr__(self) -> str:
        return f"ColorIdentity('{self.to_string()}')"
