"""
Data Loading Application Service.

Orchestrates loading of magic cards and deck data.
"""

from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd
import requests
import scipy.sparse

from ...domain.services import CardService
from ...domain.entities import CommanderDeck


class DataLoadingService:
    """
    Application service for loading data.
    
    Orchestrates loading of Scryfall card data, EDHREC decks,
    and preprocessing for the Commander Map.
    """
    
    def __init__(self):
        self.card_service = CardService()
    
    def load_magic_cards(self) -> Dict[str, Any]:
        """
        Load magic cards from Scryfall with price and release data.
        
        Returns:
            Dictionary mapping card names to card properties
        """
        print('Loading magic cards...', end='')
        
        # Get oracle cards URL
        resp = requests.get('https://api.scryfall.com/bulk-data/oracle-cards')
        download_uri = resp.json()['download_uri']
        
        # Fetch cards
        magic_cards = self.card_service.fetch_cards(
            scryfall_url=download_uri,
            lower=False
        )
        
        # Get default cards for pricing
        default_resp = requests.get('https://api.scryfall.com/bulk-data/default-cards')
        default_uri = default_resp.json()['download_uri']
        default_cards = requests.get(default_uri).json()
        
        # Add price and release data
        magic_cards = self.card_service.find_price_and_release(
            magic_cards, default_cards
        )
        
        print(f'loaded {len(magic_cards)} cards')
        return magic_cards
    
    def load_decklists(
        self,
        sparse_path: str,
        columns_path: str
    ) -> Tuple[Any, Dict[str, int]]:
        """
        Load sparse decklist matrix from files.
        
        Args:
            sparse_path: Path to .npz sparse matrix file
            columns_path: Path to newline-delimited card names file
            
        Returns:
            Tuple of (decklist_matrix, card_idx_lookup)
        """
        decklist_matrix = scipy.sparse.load_npz(sparse_path)
        decklist_matrix = decklist_matrix.tocsr()
        
        card_idx_lookup = [line.strip() for line in open(columns_path)]
        card_idx_lookup = dict(zip(card_idx_lookup, range(len(card_idx_lookup))))
        
        return decklist_matrix, card_idx_lookup
    
    def load_commander_decks_df(
        self,
        path: str
    ) -> pd.DataFrame:
        """
        Load commander decks from CSV.
        
        Args:
            path: Path to commander-decks.csv
            
        Returns:
            DataFrame of commander decks
        """
        return pd.read_csv(path, dtype={'savedate': str}).fillna('')
    
    def load_date_matrix(
        self,
        path: str,
        commander_decks: pd.DataFrame,
        card_idx_lookup: Dict[str, int],
        magic_cards: Dict[str, Any]
    ) -> Tuple[np.ndarray, Dict[int, int], Dict[str, int]]:
        """
        Load and process the date matrix.
        
        Args:
            path: Path to date-matrix.csv
            commander_decks: DataFrame of decks
            card_idx_lookup: Card to index mapping
            magic_cards: Card properties
            
        Returns:
            Tuple of (date_matrix, deck_date_idx_lookup, card_date_idx_lookup)
        """
        df = pd.read_csv(path).set_index('deck_date')
        card_date_to_idx = dict(zip(df.columns, range(len(df.columns))))
        deck_date_to_idx = dict(zip(df.index, range(len(df.index))))
        date_matrix = df.values
        
        card_date_idx_lookup = {
            name: card_date_to_idx[magic_cards[name]['earliest_release']]
            for name in card_idx_lookup
        }
        
        deck_date_idx_lookup = {
            deck_id: deck_date_to_idx[save_date]
            for deck_id, save_date in zip(
                commander_decks['deckID'].values,
                commander_decks['savedate'].values
            )
        }
        
        return date_matrix, deck_date_idx_lookup, card_date_idx_lookup
    
    def load_ci_matrix(
        self,
        path: str,
        commander_decks: pd.DataFrame,
        card_idx_lookup: Dict[str, int],
        magic_cards: Dict[str, Any]
    ) -> Tuple[np.ndarray, Dict[int, int], Dict[str, int]]:
        """
        Load and process the color identity matrix.
        
        Args:
            path: Path to coloridentity-matrix.csv
            commander_decks: DataFrame of decks
            card_idx_lookup: Card to index mapping
            magic_cards: Card properties
            
        Returns:
            Tuple of (ci_matrix, deck_ci_idx_lookup, card_ci_idx_lookup)
        """
        df = pd.read_csv(path).fillna('').set_index('deck_ci')
        df.columns = df.index
        ci_idx_lookup = dict(zip(df.index, range(len(df.index))))
        ci_matrix = df.values
        
        card_ci_idx_lookup = {
            name: ci_idx_lookup[magic_cards[name]['color_identity']]
            for name in card_idx_lookup
        }
        
        deck_ci_idx_lookup = {
            deck_id: ci_idx_lookup[deck_ci]
            for deck_id, deck_ci in zip(
                commander_decks['deckID'].values,
                commander_decks['colorIdentityID'].values
            )
        }
        
        return ci_matrix, deck_ci_idx_lookup, card_ci_idx_lookup
    
    def load_cdecks(
        self,
        commander_decks: pd.DataFrame,
        decklist_matrix: Any,
        card_idx_lookup: Dict[str, int]
    ) -> Dict[int, CommanderDeck]:
        """
        Load CommanderDeck entities from data.
        
        Args:
            commander_decks: DataFrame of deck metadata
            decklist_matrix: Sparse matrix of decklists
            card_idx_lookup: Card to index mapping
            
        Returns:
            Dictionary mapping deck_id to CommanderDeck
        """
        cdecks = {}
        card_list = np.array(list(card_idx_lookup.keys()))
        
        for i, row in commander_decks.iterrows():
            cdeck = CommanderDeck(
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
            
            # Get cards from sparse matrix
            played_card_idx = decklist_matrix[i, :].indices
            cdeck.cards = list(card_list[played_card_idx])
            
            cdecks[i] = cdeck
        
        return cdecks
