"""
Deck Repository Implementation.

Handles persistence and retrieval of deck data.
"""

import json
import os
from typing import Any, Dict, List, Optional

import pandas as pd
import scipy.sparse

from ...domain.entities import CommanderDeck


class DeckRepository:
    """
    Repository for deck data persistence.
    
    Handles loading and saving of deck data from/to CSV and sparse matrix formats.
    """
    
    def __init__(self, data_dir: str):
        """
        Initialize the repository.
        
        Args:
            data_dir: Base directory for data files
        """
        self.data_dir = data_dir
    
    def get_all_decks(self) -> pd.DataFrame:
        """
        Load all commander decks from CSV.
        
        Returns:
            DataFrame of deck metadata
        """
        path = os.path.join(self.data_dir, 'map_intermediates', 'commander-decks.csv')
        return pd.read_csv(path, dtype={'savedate': str}).fillna('')
    
    def get_deck_by_id(self, deck_id: int) -> Optional[CommanderDeck]:
        """
        Get a single deck by ID.
        
        Args:
            deck_id: The deck identifier
            
        Returns:
            CommanderDeck if found, None otherwise
        """
        df = self.get_all_decks()
        row = df[df['deckID'] == deck_id]
        
        if row.empty:
            return None
        
        row = row.iloc[0]
        return CommanderDeck(
            deck_id=row['deckID'],
            url=row['url'],
            commander=row['commanderID'],
            partner=row['partnerID'],
            companion=row.get('companionID', ''),
            color_identity=row['colorIdentityID'],
            theme=row['themeID'],
            tribe=row['tribeID'],
            date=row['savedate'],
            price=row.get('price', 0.0),
        )
    
    def get_decklist_matrix(self) -> tuple:
        """
        Load the sparse decklist matrix.
        
        Returns:
            Tuple of (sparse_matrix, card_idx_lookup)
        """
        matrix_path = os.path.join(self.data_dir, 'map_intermediates', 'sparse-decklists.npz')
        columns_path = os.path.join(self.data_dir, 'map_intermediates', 'sparse-columns.txt')
        
        matrix = scipy.sparse.load_npz(matrix_path).tocsr()
        
        with open(columns_path) as f:
            cards = [line.strip() for line in f]
        
        card_idx_lookup = dict(zip(cards, range(len(cards))))
        
        return matrix, card_idx_lookup
    
    def save_deck_coordinates(
        self,
        df: pd.DataFrame,
        output_path: str
    ) -> None:
        """
        Save deck coordinates to CSV.
        
        Args:
            df: DataFrame with coordinate data
            output_path: Path to save CSV
        """
        df.to_csv(output_path, index=False)
    
    def save_cluster_assignments(
        self,
        df: pd.DataFrame,
        output_path: str
    ) -> None:
        """
        Save cluster assignments to CSV.
        
        Args:
            df: DataFrame with clusterID column
            output_path: Path to save CSV
        """
        df[['clusterID']].to_csv(output_path, index=False)
    
    def export_decks_json(
        self,
        decks: Dict[int, CommanderDeck],
        magic_cards: Dict[str, Any],
        trait_mapping: Dict,
        duplicates: List[str],
        output_dir: str,
        chunksize: int = 100
    ) -> None:
        """
        Export decks to JSON files in chunks.
        
        Args:
            decks: Dictionary of deck_id to CommanderDeck
            magic_cards: Card properties
            trait_mapping: Trait to int mapping
            duplicates: List of duplicate card names
            output_dir: Output directory
            chunksize: Decks per file
        """
        os.makedirs(output_dir, exist_ok=True)
        
        id_list = list(decks.keys())
        chunks = [id_list[i:i+chunksize] for i in range(0, len(id_list), chunksize)]
        
        for i, chunk in enumerate(chunks):
            chunk_name = str(i * chunksize)
            chunk_data = {}
            
            for deck_id in chunk:
                cdeck = decks[deck_id]
                formatted = cdeck.format_decklist(magic_cards)
                
                deck_json = {
                    'main': formatted,
                    'commanderID': str(trait_mapping['commanderID'].get(cdeck.commander, cdeck.commander)),
                    'price': str(int(cdeck.price)),
                }
                
                if cdeck.partner:
                    deck_json['partnerID'] = str(trait_mapping['commanderID'].get(cdeck.partner, cdeck.partner))
                
                if cdeck.companion:
                    deck_json['companionID'] = str(trait_mapping['commanderID'].get(cdeck.companion, cdeck.companion))
                
                dups_in_deck = sorted(set(duplicates) & set(cdeck.cards))
                if dups_in_deck:
                    deck_json['duplicates'] = dups_in_deck
                
                chunk_data[str(deck_id)] = deck_json
            
            with open(os.path.join(output_dir, f'{chunk_name}.json'), 'w') as f:
                json.dump(chunk_data, f)
