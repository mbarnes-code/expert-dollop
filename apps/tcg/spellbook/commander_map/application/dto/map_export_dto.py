"""
Map Export Data Transfer Object.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class MapExportDTO:
    """
    DTO for complete map export data.
    
    Attributes:
        decks: List of deck export data
        clusters: List of cluster export data
        trait_mapping: Mapping of traits to integer IDs
        date: Date of export generation
    """
    
    decks: List[Dict[str, Any]] = field(default_factory=list)
    clusters: List[Dict[str, Any]] = field(default_factory=list)
    trait_mapping: Dict[str, Dict[str, int]] = field(default_factory=dict)
    date: Optional[str] = None
    
    def to_json(self) -> dict:
        """Convert to JSON-serializable dictionary."""
        return {
            'decks': self.decks,
            'clusters': self.clusters,
            'traitMapping': self.trait_mapping,
            'date': self.date,
        }
