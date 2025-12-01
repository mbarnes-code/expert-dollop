"""
Card Service.

Handles card-related operations like fetching from Scryfall and type extraction.
"""

import re
import string
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import numpy as np
import pydash
import requests


class CardService:
    """
    Domain service for card-related operations.
    
    Handles fetching cards from Scryfall, extracting types,
    calculating prices, and other card utilities.
    """
    
    POSSIBLE_CARD_TYPES = [
        'Land', 'Creature', 'Sorcery', 'Instant',
        'Artifact', 'Enchantment', 'Planeswalker'
    ]
    
    BASIC_LANDS = [
        'Mountain', 'Forest', 'Island', 'Plains', 'Swamp', 'Wastes'
    ] + [f'Snow-Covered {land}' for land in ['Mountain', 'Forest', 'Island', 'Plains', 'Swamp']]
    
    def fetch_cards(
        self,
        scryfall_url: str,
        replace_json: Optional[str] = None,
        lower: bool = False
    ) -> Dict[str, Any]:
        """
        Fetch cards from Scryfall and create a card dictionary.
        
        Args:
            scryfall_url: URL to fetch cards from
            replace_json: Optional path to name replacement JSON
            lower: Whether to lowercase card names
            
        Returns:
            Dictionary mapping card names to card data
        """
        rename_dict = {}
        if replace_json:
            import json
            with open(replace_json) as f:
                rename_dict = json.load(f)
        
        resp = requests.get(scryfall_url)
        json_data = resp.json()
        
        magic_cards = {}
        for card_data in json_data:
            if card_data.get('layout') == 'token':
                continue
            
            name = card_data['name'].lower() if lower else card_data['name']
            magic_cards[name] = card_data
            
            # Handle split/transform/modal cards
            if card_data.get('layout') in ['flip', 'transform', 'modal_dfc', 'adventure']:
                self._handle_split_card(magic_cards, card_data, name, rename_dict)
            
            # Handle renames
            if name in rename_dict or name.lower() in rename_dict:
                correct = rename_dict.get(name.lower())
                if not lower:
                    correct = string.capwords(correct.lower())
                magic_cards[correct] = magic_cards[name]
        
        # Mark specific cards as normal (not tokens)
        token_exceptions = [
            'Llanowar Elves', "Ajani's Pridemate", 'Cloud Sprite', 'Storm Crow',
            'Goldmeadow Harrier', 'Kobolds of Kher Keep', 'Festering Goblin',
            'Metallic Sliver', 'Spark Elemental'
        ]
        for cardname in token_exceptions:
            if cardname in magic_cards:
                magic_cards[cardname]['layout'] = 'normal'
                magic_cards[cardname]['set_type'] = 'normal'
        
        # Sort color identities
        self._sort_color_identities(magic_cards)
        
        return magic_cards
    
    def _handle_split_card(
        self,
        magic_cards: Dict,
        card_data: Dict,
        name: str,
        rename_dict: Dict
    ) -> None:
        """Handle split/transform/modal DFC cards."""
        parts = name.split(' // ')
        if len(parts) != 2:
            # Handle unexpected card name formats gracefully
            return
        
        left_name, right_name = parts
        
        for subname in [left_name, right_name]:
            magic_cards[subname] = card_data['card_faces'][0].copy()
            magic_cards[subname]['cmc'] = card_data['cmc']
            magic_cards[subname]['color_identity'] = card_data['color_identity']
            magic_cards[subname]['original_name'] = name
            
            if subname in rename_dict:
                correct = rename_dict[subname]
                magic_cards[correct] = magic_cards[subname]
    
    def _sort_color_identities(self, magic_cards: Dict) -> None:
        """Sort all color identities to WUBRG order."""
        order = ['W', 'U', 'B', 'R', 'G']
        
        for key in magic_cards:
            ci = magic_cards[key].get('color_identity', [])
            if isinstance(ci, list):
                magic_cards[key]['color_identity'] = ''.join(
                    sorted(ci, key=lambda c: order.index(c) if c in order else 99)
                )
    
    def find_price_and_release(
        self,
        magic_cards: Dict[str, Any],
        default_card_json: List[Dict]
    ) -> Dict[str, Any]:
        """
        Add minimum price and earliest release date to cards.
        
        Args:
            magic_cards: Dictionary of card data
            default_card_json: List of card data from Scryfall default cards
            
        Returns:
            Updated magic_cards dictionary
        """
        default_names = {card['name'] for card in default_card_json}
        
        price_lookup = defaultdict(list)
        release_lookup = defaultdict(list)
        price_fields = ['usd', 'usd_foil', 'usd_etched', 'eur', 'eur_foil']
        
        for card_json in default_card_json:
            cardname = card_json['name']
            
            # Find minimum price
            min_price = np.inf
            for field in price_fields:
                price = card_json.get('prices', {}).get(field)
                if price is not None:
                    if 'eur' in field:
                        price = float(price) * 1.13  # EUR to USD conversion
                    if float(price) < min_price:
                        min_price = float(price)
            
            if min_price != np.inf:
                price_lookup[cardname].append(min_price)
            else:
                price_lookup[cardname].append(np.nan)
            
            # Find release date
            if 'preview' in card_json:
                release_date = datetime.strptime(
                    card_json['preview']['previewed_at'], '%Y-%m-%d'
                )
            else:
                release_str = card_json.get('released_at', '')
                release_date = datetime.strptime(release_str, '%Y-%m-%d') - timedelta(14)
            
            release_lookup[cardname].append(release_date)
        
        # Build final lookups
        min_price_lookup = {
            name: (min(prices) if min(prices) != np.inf else np.nan)
            for name, prices in price_lookup.items()
        }
        earliest_release_lookup = {
            name: datetime.strftime(min(dates), '%Y-%m-%d')
            for name, dates in release_lookup.items()
        }
        
        # Apply to magic_cards
        for cardname in magic_cards:
            lookup_name = cardname
            if cardname not in default_names:
                lookup_name = magic_cards[cardname].get('original_name', cardname)
            
            magic_cards[cardname]['min_price'] = min_price_lookup.get(lookup_name, np.nan)
            magic_cards[cardname]['earliest_release'] = earliest_release_lookup.get(lookup_name, '')
        
        return magic_cards
    
    def extract_types(self, name: str, type_line: str) -> str:
        """
        Extract the primary card type from a type line.
        
        Args:
            name: Card name
            type_line: Full type line
            
        Returns:
            Primary card type string
        """
        main_type = next(
            (t for t in self.POSSIBLE_CARD_TYPES if t in type_line),
            'Creature'
        )
        
        if main_type == 'Land':
            if name in self.BASIC_LANDS:
                return 'Basic Land'
            return 'Nonbasic Land'
        
        return main_type
    
    @staticmethod
    def kebab(text: str) -> str:
        """
        Convert a string to kebab-case.
        
        Args:
            text: Input string
            
        Returns:
            Kebab-cased string
        """
        text = pydash.deburr(text)
        text = text.replace("'", "")
        words = re.split(r'[^a-zA-Z0-9]', text)
        words = [w.lower() for w in words if w]
        return '-'.join(words)
