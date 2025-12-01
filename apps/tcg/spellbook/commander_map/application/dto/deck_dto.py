"""
Deck Data Transfer Object.
"""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class DeckDTO:
    """
    DTO for transferring deck data across layers.
    
    Attributes:
        deck_id: Unique deck identifier
        url: Source URL
        commander: Primary commander name
        partner: Partner commander name
        companion: Companion card name
        color_identity: Color identity string
        theme: Theme classification
        tribe: Tribal classification
        cards: List of card names
        save_date: Date the deck was saved
        price: Total deck price
        x: X coordinate on map
        y: Y coordinate on map
        cluster_id: Assigned cluster
    """
    
    deck_id: Optional[int] = None
    url: Optional[str] = None
    commander: Optional[str] = None
    partner: str = ""
    companion: str = ""
    color_identity: str = ""
    theme: str = ""
    tribe: str = ""
    cards: List[str] = field(default_factory=list)
    save_date: Optional[str] = None
    price: float = 0.0
    x: float = 0.0
    y: float = 0.0
    cluster_id: Optional[int] = None
    site_id: Optional[int] = None
    path: str = ""
    
    @classmethod
    def from_entity(cls, deck) -> 'DeckDTO':
        """Create DTO from CommanderDeck entity."""
        return cls(
            deck_id=deck.deck_id,
            url=deck.url,
            commander=deck.commander,
            partner=deck.partner,
            companion=deck.companion,
            color_identity=deck.color_identity,
            theme=deck.theme,
            tribe=deck.tribe,
            cards=deck.cards.copy(),
            save_date=deck.date,
            price=deck.price,
        )
    
    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            'deck_id': self.deck_id,
            'url': self.url,
            'commander': self.commander,
            'partner': self.partner,
            'companion': self.companion,
            'color_identity': self.color_identity,
            'theme': self.theme,
            'tribe': self.tribe,
            'cards': self.cards,
            'save_date': self.save_date,
            'price': self.price,
            'x': self.x,
            'y': self.y,
            'cluster_id': self.cluster_id,
            'site_id': self.site_id,
            'path': self.path,
        }
