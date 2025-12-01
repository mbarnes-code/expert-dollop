"""
Companion Service.

Handles companion calculation and validation for commander decks.
"""

import re
from typing import Any, Dict, List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from ..entities.commander_deck import CommanderDeck


class CompanionService:
    """
    Domain service for companion-related operations.
    
    Validates companion restrictions and determines if a deck can
    legally companion a specific card.
    """
    
    COMPANIONS = [
        'Gyruda, Doom of Depths',
        'Jegantha, the Wellspring', 
        'Kaheera, the Orphanguard',
        'Keruga, the Macrosage',
        'Lurrus of the Dream-Den',
        'Obosh, the Preypiercer',
        'Umori, the Collector',
        'Zirda, the Dawnwaker'
    ]
    
    ACTIVATED_KEYWORDS = [
        'equip', 'cycling', 'transfigure', 'unearth', 'levelup', 'outlast',
        'crew', 'ninjutsu', 'commanderninjutsu', 'transmute', 'forceast',
        'auraswap', 'reinforce', 'scavenge', 'embalm', 'eternalize', 'fortify'
    ]
    
    def calculate_companion(
        self,
        deck: 'CommanderDeck',
        magic_cards: Dict[str, Any]
    ) -> str:
        """
        Calculate the companion for a deck if one is valid.
        
        Args:
            deck: The CommanderDeck to analyze
            magic_cards: Dictionary of card properties
            
        Returns:
            Companion card name if valid, empty string otherwise
        """
        deck_companions = []
        
        for comp in self.COMPANIONS:
            copied_cards = deck.cards.copy()
            
            # Skip if commander IS the companion
            if comp == deck.commander:
                continue
            
            copied_cards.append(deck.commander)
            
            # Check if partner is the companion
            if deck.partner == comp:
                deck_companions.append(comp)
                continue
            elif deck.partner:
                copied_cards.append(deck.partner)
            
            # Check if theme indicates companion
            if deck.theme == re.split(r',| ', comp)[0].lower() + '-companion':
                deck_companions.append(comp)
                continue
            
            # Check color identity
            comp_ci = magic_cards.get(comp, {}).get('color_identity', [])
            if not all(c in (deck.color_identity or '') for c in comp_ci):
                continue
            
            # Check if companion is in deck
            if comp in deck.cards:
                # Verify deck meets companion restriction
                original_names = [
                    magic_cards.get(name, {}).get('original_name', name)
                    for name in copied_cards
                ]
                
                if comp == 'Umori, the Collector':
                    is_valid = self._check_umori(original_names, magic_cards)
                else:
                    is_valid = all(
                        self._check_card_playable(comp, name, magic_cards)
                        for name in original_names
                    )
                
                if is_valid:
                    deck_companions.append(comp)
        
        return deck_companions[0] if deck_companions else ''
    
    def _check_card_playable(
        self,
        companion: str,
        cardname: str,
        magic_cards: Dict[str, Any]
    ) -> bool:
        """
        Check if a card can be played in a deck with the given companion.
        
        Args:
            companion: The companion card name
            cardname: The card to check
            magic_cards: Card properties
            
        Returns:
            True if the card is legal with the companion
        """
        card_info = magic_cards.get(cardname, {})
        
        if companion == 'Gyruda, Doom of Depths':
            return card_info.get('cmc', 0) % 2 == 0
        
        elif companion == 'Jegantha, the Wellspring':
            return self._check_jegantha(card_info)
        
        elif companion == 'Kaheera, the Orphanguard':
            return self._check_kaheera(card_info)
        
        elif companion == 'Keruga, the Macrosage':
            type_line = card_info.get('type_line', '')
            return 'Land' in type_line or card_info.get('cmc', 0) >= 3
        
        elif companion == 'Lurrus of the Dream-Den':
            return self._check_lurrus(card_info)
        
        elif companion == 'Obosh, the Preypiercer':
            type_line = card_info.get('type_line', '')
            if 'Land' in type_line:
                return True
            return card_info.get('cmc', 1) % 2 == 1
        
        elif companion == 'Zirda, the Dawnwaker':
            return self._check_zirda(card_info)
        
        return True
    
    def _check_jegantha(self, card_info: Dict) -> bool:
        """Check if a card is legal with Jegantha."""
        if 'card_faces' in card_info:
            mc = card_info['card_faces'][0].get('mana_cost', '')
        else:
            mc = card_info.get('mana_cost', '')
        
        symbols = [s for s in re.split(r'[^0-9A-Z/]', mc) if s]
        return len(symbols) == len(set(symbols))
    
    def _check_kaheera(self, card_info: Dict) -> bool:
        """Check if a card is legal with Kaheera."""
        creature_types = ['Cat', 'Elemental', 'Nightmare', 'Dinosaur', 'Beast']
        type_line = card_info.get('type_line', '')
        
        if 'Creature' in type_line:
            return any(ct in type_line for ct in creature_types)
        return True
    
    def _check_lurrus(self, card_info: Dict) -> bool:
        """Check if a card is legal with Lurrus."""
        perms = ['Land', 'Creature', 'Enchantment', 'Artifact', 'Planeswalker']
        type_line = card_info.get('type_line', '')
        
        if any(p in type_line for p in perms):
            return card_info.get('cmc', 0) <= 2
        return True
    
    def _check_zirda(self, card_info: Dict) -> bool:
        """Check if a card is legal with Zirda (has activated ability)."""
        perms = ['Land', 'Creature', 'Enchantment', 'Artifact', 'Planeswalker']
        type_line = card_info.get('type_line', '')
        
        if not any(p in type_line for p in perms):
            return True
        
        # Check for activated ability keywords
        keywords = [kw.lower() for kw in card_info.get('keywords', [])]
        if any(kw in keywords for kw in self.ACTIVATED_KEYWORDS):
            return True
        
        # Check oracle text for activated abilities
        lines = []
        if 'card_faces' in card_info:
            for face in card_info['card_faces']:
                lines.extend(face.get('oracle_text', '').split('\n'))
        else:
            lines = card_info.get('oracle_text', '').split('\n')
        
        # Look for "cost: effect" pattern
        return any(re.search(r'^[^"]+:.+$', line) for line in lines)
    
    def _check_umori(self, card_list: List[str], magic_cards: Dict) -> bool:
        """Check if all nonland permanents share a type."""
        nonlands = [
            c for c in card_list
            if 'Land' not in magic_cards.get(c, {}).get('type_line', '')
        ]
        
        possible_types = [
            'Artifact', 'Creature', 'Land', 'Enchantment',
            'Planeswalker', 'Instant', 'Sorcery'
        ]
        
        shared_types = possible_types.copy()
        for cardname in nonlands:
            card_info = magic_cards.get(cardname, {})
            type_line = card_info.get('type_line', '')
            shared_types = [t for t in shared_types if t in type_line]
            if not shared_types:
                return False
        
        return True
