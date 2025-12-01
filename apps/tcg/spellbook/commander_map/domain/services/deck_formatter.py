"""
Deck Formatter Service.

Handles formatting of decklists for export with proper sorting and land calculation.
"""

from collections import defaultdict
from typing import Any, Dict, List, TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from ..entities.commander_deck import CommanderDeck


class DeckFormatterService:
    """
    Domain service for formatting decklists.
    
    Sorts cards by type and mana value, then adds appropriate basic lands.
    """
    
    TYPE_ORDER = [
        'Creature', 'Sorcery', 'Instant', 'Artifact', 
        'Enchantment', 'Planeswalker', 'Nonbasic Land', 'Basic Land'
    ]
    
    BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes']
    COLORS = ['W', 'U', 'B', 'R', 'G', 'C']
    
    def format_decklist(
        self,
        deck: 'CommanderDeck',
        magic_cards: Dict[str, Any],
        include_commanders: bool = False
    ) -> List[str]:
        """
        Format a decklist for export.
        
        Args:
            deck: The CommanderDeck to format
            magic_cards: Dictionary of card properties
            include_commanders: Whether to include commanders at the start
            
        Returns:
            List of formatted card entries
        """
        from ..value_objects.card_type import CardType
        
        traits = []
        color_pips = defaultdict(int)
        
        for cardname in deck.cards:
            card_info = magic_cards.get(cardname, {'mana_cost': ''})
            
            # Count color pips
            pips = card_info.get('mana_cost', '')
            for c in self.COLORS:
                color_pips[c] += pips.count(c)
            
            # Skip commanders in main deck export
            if cardname in [deck.commander, deck.partner, deck.companion]:
                continue
            
            # Get card type and mana value
            type_line = card_info.get('type_line', 'Creature')
            card_type = CardType.from_type_line(cardname, type_line)
            mv = card_info.get('cmc', 0)
            
            traits.append([str(card_type), mv, cardname])
        
        # Sort by type, then mana value, then alphabetically
        sorted_decklist = sorted(
            traits,
            key=lambda t: (
                self.TYPE_ORDER.index(t[0]) if t[0] in self.TYPE_ORDER else len(self.TYPE_ORDER),
                t[1],
                t[2]
            )
        )
        
        # Remove basic lands (we'll add calculated ones)
        sorted_decklist = [c for c in sorted_decklist if c[0] != 'Basic Land']
        
        # Calculate basic land distribution
        basics = self._calculate_basics(
            deck, magic_cards, sorted_decklist, color_pips
        )
        
        # Format output
        decklist_formatted = self._format_output(sorted_decklist)
        decklist_formatted += [''] + basics
        
        if include_commanders:
            decklist_formatted = self._prepend_commanders(deck, decklist_formatted)
        
        return decklist_formatted
    
    def _calculate_basics(
        self,
        deck: 'CommanderDeck',
        magic_cards: Dict[str, Any],
        sorted_decklist: List,
        color_pips: Dict[str, int]
    ) -> List[str]:
        """
        Calculate the basic land distribution for a deck.
        
        Args:
            deck: The CommanderDeck
            magic_cards: Card properties
            sorted_decklist: Sorted non-land cards
            color_pips: Count of color pips in deck
            
        Returns:
            List of formatted basic land entries
        """
        pips_array = np.array(list(color_pips.values()))
        num_basics = 100 - (len(sorted_decklist) + 1 + (1 if deck.partner else 0))
        
        if pips_array.sum() == 0:
            # Use commander color identity for colorless decks
            commander_cis = set()
            if deck.commander and deck.commander in magic_cards:
                commander_cis = set(magic_cards[deck.commander].get('color_identity', []))
            if deck.partner and deck.partner in magic_cards:
                commander_cis.update(magic_cards[deck.partner].get('color_identity', []))
            
            pips_array = np.array([1 if c in commander_cis else 0 for c in self.COLORS])
            if commander_cis == set():
                pips_array[-1] = 1  # Add Wastes for colorless
        
        # Calculate distribution
        basic_dist = np.floor(pips_array / pips_array.sum() * num_basics)
        remaining = num_basics - basic_dist.sum()
        if remaining != 0:
            basic_dist[np.argmax(basic_dist)] += remaining
        
        # Convert to formatted strings
        return [
            f'{int(count)} {basic}'
            for count, basic in zip(basic_dist, self.BASIC_LANDS)
            if count != 0
        ]
    
    def _format_output(self, sorted_decklist: List) -> List[str]:
        """
        Format the sorted decklist with type separators.
        
        Args:
            sorted_decklist: Sorted list of [type, mv, cardname]
            
        Returns:
            List of formatted strings
        """
        if not sorted_decklist:
            return []
        
        formatted = []
        prev_type = sorted_decklist[0][0]
        
        for card_traits in sorted_decklist:
            if card_traits[0] == 'Basic Land':
                continue
            
            if card_traits[0] == prev_type:
                formatted.append(f'1 {card_traits[2]}')
            else:
                formatted.extend(['', f'1 {card_traits[2]}'])
            prev_type = card_traits[0]
        
        return formatted
    
    def _prepend_commanders(
        self,
        deck: 'CommanderDeck',
        decklist: List[str]
    ) -> List[str]:
        """
        Prepend commanders to the decklist.
        
        Args:
            deck: The CommanderDeck
            decklist: Current formatted decklist
            
        Returns:
            Decklist with commanders prepended
        """
        result = [''] + decklist
        
        if deck.companion:
            result = [f'1 {deck.companion}'] + result
        if deck.partner:
            result = [f'1 {deck.partner}'] + result
        if deck.commander:
            result = [f'1 {deck.commander}'] + result
        
        return result
