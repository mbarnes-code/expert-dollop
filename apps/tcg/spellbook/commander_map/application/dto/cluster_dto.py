"""
Cluster Data Transfer Object.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ClusterDTO:
    """
    DTO for cluster data.
    
    Attributes:
        cluster_id: Unique cluster identifier
        traits: Dictionary of traits (commanders, themes, etc.)
        defining_cards: List of cards that define the cluster
        average_price: Average deck price in cluster
        average_deck_id: ID of representative deck
        deck_count: Number of decks in cluster
    """
    
    cluster_id: int
    traits: Dict[str, List[tuple]] = field(default_factory=dict)
    defining_cards: List[Dict[str, Any]] = field(default_factory=list)
    average_price: float = 0.0
    average_deck_id: Optional[int] = None
    deck_count: int = 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        result = {
            'clusterID': self.cluster_id,
            'averagePrice': int(self.average_price),
            'averageDeck': str(self.average_deck_id) if self.average_deck_id else None,
        }
        result.update(self.traits)
        result['definingCards'] = self.defining_cards
        return result
