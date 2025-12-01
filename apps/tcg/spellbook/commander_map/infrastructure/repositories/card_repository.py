"""
Card Repository Implementation.

Handles card data persistence and retrieval.
"""

import json
import os
from typing import Any, Dict, List, Optional

from ...domain.services import CardService


class CardRepository:
    """
    Repository for card data persistence.
    
    Handles saving card play data and loading card references.
    """
    
    def __init__(self, data_dir: str):
        """
        Initialize the repository.
        
        Args:
            data_dir: Base directory for data files
        """
        self.data_dir = data_dir
        self.card_service = CardService()
    
    def load_edhrec_to_scryfall(self) -> Dict[str, str]:
        """
        Load the EDHREC to Scryfall name mapping.
        
        Returns:
            Dictionary mapping EDHREC names to Scryfall names
        """
        path = os.path.join(self.data_dir, 'edhrec-to-scryfall.json')
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return {}
    
    def load_duplicates(self, path: str) -> List[str]:
        """
        Load list of known duplicate cards.
        
        Args:
            path: Path to duplicates.txt
            
        Returns:
            List of card names
        """
        with open(path) as f:
            return [line.strip() for line in f]
    
    def save_card_play_data(
        self,
        card_idx_lookup: Dict[str, int],
        decklist_matrix: Any,
        cdecks: Dict,
        include_commanders: bool,
        output_dir: str
    ) -> None:
        """
        Save which decks play each card.
        
        Args:
            card_idx_lookup: Card to index mapping
            decklist_matrix: Sparse decklist matrix
            cdecks: Dictionary of CommanderDeck objects
            include_commanders: Whether commanders are in matrix
            output_dir: Output directory
        """
        os.makedirs(output_dir, exist_ok=True)
        
        cardnames = list(card_idx_lookup.keys())
        csc_matrix = decklist_matrix.tocsc()
        
        # Build deck play data
        deck_play_cards = {}
        for i, cardname in enumerate(cardnames):
            deck_play_cards[cardname] = csc_matrix[:, i].indices.astype(str).tolist()
        
        # Add commanders if not in matrix
        if not include_commanders:
            for i, cdeck in cdecks.items():
                for commander in [cdeck.commander, cdeck.partner, cdeck.companion]:
                    if commander:
                        if commander not in deck_play_cards:
                            deck_play_cards[commander] = []
                        deck_play_cards[commander].append(str(i))
        
        # Save individual files
        for cardname, decks in deck_play_cards.items():
            filename = self.card_service.kebab(cardname)
            with open(os.path.join(output_dir, f'{filename}.csv'), 'w') as f:
                f.write('\n'.join(decks))
