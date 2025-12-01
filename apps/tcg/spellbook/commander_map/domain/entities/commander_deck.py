"""
Commander Deck Entity.

Represents a single commander deck with its associated metadata,
cards, and calculated properties following DDD Entity patterns.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, List, Optional

import numpy as np


@dataclass
class CommanderDeck:
    """
    A domain entity representing a Commander/EDH deck.
    
    This entity encapsulates all the information about a single deck including
    its commander(s), cards, color identity, and calculated metrics like price.
    
    Attributes:
        deck_id: Unique identifier for the deck
        url: Source URL where the deck was found
        commander: The primary commander card name
        partner: Optional partner commander card name
        companion: Optional companion card name
        color_identity: Color identity string (e.g., 'WUB')
        theme: Theme classification (e.g., 'voltron')
        tribe: Tribal classification (e.g., 'elves')
        cards: List of card names in the 99
        date: Date the deck was saved/fetched
        price: Calculated deck price
    """
    
    deck_id: Optional[int] = None
    url: Optional[str] = None
    commander: Optional[str] = None
    partner: str = ""
    companion: str = ""
    color_identity: Optional[str] = None
    theme: str = ""
    tribe: str = ""
    cards: List[str] = field(default_factory=list)
    date: Optional[str] = None
    price: float = 0.0
    
    def validate(self) -> bool:
        """
        Validate the deck entity state.
        
        Returns:
            bool: True if deck state is valid
        """
        if not self.commander:
            return False
        if not self.cards:
            return False
        return True
    
    def calculate_price(self, magic_cards: dict, include_commanders: bool = True) -> float:
        """
        Calculate the total price of the deck based on minimum card prices.
        
        Args:
            magic_cards: Dictionary mapping card names to card properties (needs 'min_price' key)
            include_commanders: Whether to include commander/partner/companion in price calculation
            
        Returns:
            float: Total deck price, also stored in self.price
        """
        deck_prices = [
            magic_cards.get(cardname, {}).get('min_price', 0.0)
            for cardname in self.cards
        ]
        
        if include_commanders:
            commanders = [self.commander, self.partner, self.companion]
            deck_prices += [
                magic_cards.get(cardname, {}).get('min_price', 0.0)
                for cardname in commanders if cardname
            ]
        
        self.price = float(np.nansum(deck_prices))
        return self.price
    
    def format_decklist(
        self,
        magic_cards: dict,
        include_commanders: bool = False
    ) -> List[str]:
        """
        Format the decklist for export with proper sorting and basic land calculation.
        
        Sorts cards by type (creatures > sorceries > instants > artifacts > enchantments > lands),
        then by mana value, then alphabetically. Adds appropriate basic lands.
        
        Args:
            magic_cards: Dictionary mapping card names to card properties
            include_commanders: Whether to include commanders at the start of the list
            
        Returns:
            List of formatted card entries (e.g., '1 Sol Ring')
        """
        from ..services.deck_formatter import DeckFormatterService
        formatter = DeckFormatterService()
        return formatter.format_decklist(self, magic_cards, include_commanders)
    
    def get_all_commanders(self) -> List[str]:
        """
        Get a list of all commanders (commander, partner, companion) that are non-empty.
        
        Returns:
            List of commander card names
        """
        commanders = [self.commander]
        if self.partner:
            commanders.append(self.partner)
        if self.companion:
            commanders.append(self.companion)
        return [c for c in commanders if c]
    
    def to_dict(self) -> dict:
        """
        Convert the deck entity to a dictionary representation.
        
        Returns:
            Dictionary representation of the deck
        """
        return {
            'deck_id': self.deck_id,
            'url': self.url,
            'commander': self.commander,
            'partner': self.partner,
            'companion': self.companion,
            'color_identity': self.color_identity,
            'theme': self.theme,
            'tribe': self.tribe,
            'cards': self.cards.copy(),
            'date': self.date,
            'price': self.price,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'CommanderDeck':
        """
        Create a CommanderDeck instance from a dictionary.
        
        Args:
            data: Dictionary containing deck data
            
        Returns:
            New CommanderDeck instance
        """
        return cls(
            deck_id=data.get('deck_id'),
            url=data.get('url'),
            commander=data.get('commander'),
            partner=data.get('partner', ''),
            companion=data.get('companion', ''),
            color_identity=data.get('color_identity'),
            theme=data.get('theme', ''),
            tribe=data.get('tribe', ''),
            cards=data.get('cards', []).copy(),
            date=data.get('date'),
            price=data.get('price', 0.0),
        )
