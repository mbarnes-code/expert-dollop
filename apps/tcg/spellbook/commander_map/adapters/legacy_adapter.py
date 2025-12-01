"""
Legacy Adapter for Strangler Fig Pattern.

This adapter provides backwards compatibility with the original scripts
while allowing gradual migration to the new DDD-based structure.
"""

from typing import Any, Dict, List, Optional, TYPE_CHECKING

import numpy as np
import pandas as pd

if TYPE_CHECKING:
    from ..domain.entities import CommanderDeck, CommanderMapAggregate


class LegacyCommanderDeckAdapter:
    """
    Adapter that provides the legacy CommanderDeck interface.
    
    This allows the new domain entity to be used with legacy code
    that expects the old class interface.
    
    Usage (Strangler Fig Pattern):
        # Legacy code expects:
        cdeck = map_classes.CommanderDeck()
        cdeck.commander = "Krenko, Mob Boss"
        
        # Can now use:
        from adapters import LegacyCommanderDeckAdapter
        cdeck = LegacyCommanderDeckAdapter.from_legacy_dict(legacy_data)
        # or
        cdeck = LegacyCommanderDeckAdapter.to_legacy(new_deck_entity)
    """
    
    @staticmethod
    def from_legacy_dict(data: Dict[str, Any]) -> 'CommanderDeck':
        """
        Create a new CommanderDeck entity from legacy dictionary format.
        
        Args:
            data: Dictionary with legacy field names
            
        Returns:
            New CommanderDeck entity
        """
        from ..domain.entities import CommanderDeck
        
        return CommanderDeck(
            deck_id=data.get('deckID') or data.get('deckid'),
            url=data.get('url'),
            commander=data.get('commander') or data.get('commanderID'),
            partner=data.get('partner') or data.get('partnerID', ''),
            companion=data.get('companion') or data.get('companionID', ''),
            color_identity=data.get('colorIdentity') or data.get('colorIdentityID'),
            theme=data.get('theme') or data.get('themeID', ''),
            tribe=data.get('tribe') or data.get('tribeID', ''),
            cards=data.get('cards', []),
            date=data.get('date') or data.get('savedate'),
            price=data.get('price', 0.0),
        )
    
    @staticmethod
    def to_legacy(deck: 'CommanderDeck') -> Dict[str, Any]:
        """
        Convert a CommanderDeck entity to legacy dictionary format.
        
        Args:
            deck: The CommanderDeck entity
            
        Returns:
            Dictionary with legacy field names
        """
        return {
            'deckID': deck.deck_id,
            'deckid': deck.deck_id,  # Both spellings for compatibility
            'url': deck.url,
            'commander': deck.commander,
            'commanderID': deck.commander,
            'partner': deck.partner,
            'partnerID': deck.partner,
            'companion': deck.companion,
            'companionID': deck.companion,
            'colorIdentity': deck.color_identity,
            'colorIdentityID': deck.color_identity,
            'theme': deck.theme,
            'themeID': deck.theme,
            'tribe': deck.tribe,
            'tribeID': deck.tribe,
            'cards': deck.cards,
            'date': deck.date,
            'savedate': deck.date,
            'price': deck.price,
        }
    
    @staticmethod
    def create_legacy_compatible_object(deck: 'CommanderDeck') -> object:
        """
        Create an object with attribute access like the legacy CommanderDeck class.
        
        Args:
            deck: The CommanderDeck entity
            
        Returns:
            Object with legacy attribute names
        """
        class LegacyDeck:
            pass
        
        obj = LegacyDeck()
        obj.deckid = deck.deck_id
        obj.url = deck.url
        obj.commander = deck.commander
        obj.partner = deck.partner
        obj.companion = deck.companion
        obj.colorIdentity = deck.color_identity
        obj.theme = deck.theme
        obj.tribe = deck.tribe
        obj.cards = deck.cards
        obj.date = deck.date
        obj.price = deck.price
        
        return obj


class LegacyCommanderMapAdapter:
    """
    Adapter that bridges the legacy CommanderMap class to the new aggregate.
    
    This implements the anti-corruption layer for the Strangler Fig pattern,
    allowing gradual migration from legacy code to the new DDD structure.
    
    Usage:
        # Wrap new aggregate for legacy code:
        new_aggregate = CommanderMapAggregate(...)
        legacy_compatible = LegacyCommanderMapAdapter(new_aggregate)
        
        # Legacy code works the same:
        legacy_compatible.reduce_dimensionality(method='UMAP', n_dims=2)
    """
    
    def __init__(self, aggregate: 'CommanderMapAggregate'):
        """
        Initialize the adapter with a CommanderMapAggregate.
        
        Args:
            aggregate: The new domain aggregate
        """
        self._aggregate = aggregate
    
    @property
    def decklist_matrix(self):
        """Provide legacy access to decklist_matrix."""
        return self._aggregate.decklist_matrix
    
    @property
    def commander_decks(self) -> pd.DataFrame:
        """Provide legacy access to commander_decks DataFrame."""
        return self._aggregate.commander_decks
    
    @commander_decks.setter
    def commander_decks(self, value: pd.DataFrame):
        """Allow setting commander_decks for legacy compatibility."""
        self._aggregate.commander_decks = value
    
    @property
    def cdecks(self) -> Optional[Dict]:
        """Provide legacy access to cdecks dictionary."""
        return self._aggregate.cdecks
    
    @property
    def coordinates(self):
        """Provide legacy access to coordinates."""
        return self._aggregate.coordinates
    
    @property
    def cluster_embedding(self):
        """Provide legacy access to cluster_embedding."""
        return self._aggregate.cluster_embedding
    
    @property
    def cluster_labels(self):
        """Provide legacy access to cluster_labels."""
        return self._aggregate.cluster_labels
    
    @property
    def cluster_traits(self):
        """Provide legacy access to cluster_traits."""
        return self._aggregate.cluster_traits
    
    @property
    def cluster_card_df(self):
        """Provide legacy access to cluster_card_df."""
        return self._aggregate.cluster_card_df
    
    @property
    def cluster_noncard_df(self):
        """Provide legacy access to cluster_noncard_df."""
        return self._aggregate.cluster_noncard_df
    
    @property
    def cluster_defining_cards(self):
        """Provide legacy access to cluster_defining_cards."""
        return self._aggregate.cluster_defining_cards
    
    @property
    def average_decklists(self):
        """Provide legacy access to average_decklists."""
        return self._aggregate.average_decklists
    
    # Legacy matrix references
    @property
    def date_matrix(self):
        return self._aggregate.date_matrix
    
    @date_matrix.setter
    def date_matrix(self, value):
        self._aggregate.date_matrix = value
    
    @property
    def ci_matrix(self):
        return self._aggregate.ci_matrix
    
    @ci_matrix.setter
    def ci_matrix(self, value):
        self._aggregate.ci_matrix = value
    
    # Legacy lookup references
    @property
    def card_idx_lookup(self):
        return self._aggregate.card_idx_lookup
    
    @card_idx_lookup.setter
    def card_idx_lookup(self, value):
        self._aggregate.card_idx_lookup = value
    
    @property
    def deck_date_idx_lookup(self):
        return self._aggregate.deck_date_idx_lookup
    
    @deck_date_idx_lookup.setter
    def deck_date_idx_lookup(self, value):
        self._aggregate.deck_date_idx_lookup = value
    
    @property
    def card_date_idx_lookup(self):
        return self._aggregate.card_date_idx_lookup
    
    @card_date_idx_lookup.setter
    def card_date_idx_lookup(self, value):
        self._aggregate.card_date_idx_lookup = value
    
    @property
    def deck_ci_idx_lookup(self):
        return self._aggregate.deck_ci_idx_lookup
    
    @deck_ci_idx_lookup.setter
    def deck_ci_idx_lookup(self, value):
        self._aggregate.deck_ci_idx_lookup = value
    
    @property
    def card_ci_idx_lookup(self):
        return self._aggregate.card_ci_idx_lookup
    
    @card_ci_idx_lookup.setter
    def card_ci_idx_lookup(self, value):
        self._aggregate.card_ci_idx_lookup = value
    
    @property
    def trait_mapping_df(self):
        return self._aggregate.trait_mapping_df
    
    # Delegate methods to aggregate
    def reduce_dimensionality(self, *args, **kwargs):
        """Delegate to aggregate's reduce_dimensionality."""
        return self._aggregate.reduce_dimensionality(*args, **kwargs)
    
    def cluster_decks(self, *args, **kwargs):
        """Delegate to aggregate's cluster_decks."""
        return self._aggregate.cluster_decks(*args, **kwargs)
    
    def assign_unclustered(self, *args, **kwargs):
        """Delegate to aggregate's assign_unclustered."""
        return self._aggregate.assign_unclustered(*args, **kwargs)
    
    def get_cluster_traits(self, *args, **kwargs):
        """Delegate to aggregate's get_cluster_traits."""
        return self._aggregate.get_cluster_traits(*args, **kwargs)
    
    def get_cluster_card_counts(self, *args, **kwargs):
        """Delegate to aggregate's get_cluster_card_counts."""
        return self._aggregate.get_cluster_card_counts(*args, **kwargs)
    
    def get_defining_cards(self, *args, **kwargs):
        """Delegate to aggregate's get_defining_cards."""
        return self._aggregate.get_defining_cards(*args, **kwargs)
    
    def calculate_average_decklists(self, *args, **kwargs):
        """Delegate to aggregate's calculate_average_decklists."""
        return self._aggregate.calculate_average_decklists(*args, **kwargs)
    
    def get_trait_mapping(self):
        """Delegate to aggregate's get_trait_mapping."""
        return self._aggregate.get_trait_mapping()
    
    def extract_deck_sources(self):
        """Delegate to aggregate's extract_deck_sources."""
        return self._aggregate.extract_deck_sources()
    
    def copy_with_ref(self, *args, **kwargs):
        """Delegate to aggregate's copy_with_ref and wrap result."""
        new_aggregate = self._aggregate.copy_with_ref(*args, **kwargs)
        return LegacyCommanderMapAdapter(new_aggregate)
    
    def jsonify_map(self, *args, **kwargs):
        """Delegate to aggregate's jsonify_map."""
        return self._aggregate.jsonify_map(*args, **kwargs)
    
    @classmethod
    def from_legacy_data(
        cls,
        decklist_matrix,
        commander_decks: pd.DataFrame,
        cdecks: Optional[Dict] = None
    ) -> 'LegacyCommanderMapAdapter':
        """
        Create an adapter from legacy-style data.
        
        Args:
            decklist_matrix: Sparse matrix of decklists
            commander_decks: DataFrame of deck metadata
            cdecks: Optional dictionary of CommanderDeck-like objects
            
        Returns:
            LegacyCommanderMapAdapter wrapping a new aggregate
        """
        from ..domain.entities import CommanderMapAggregate, CommanderDeck
        
        # Convert legacy cdecks to new format if provided
        new_cdecks = None
        if cdecks:
            new_cdecks = {}
            for key, cdeck in cdecks.items():
                if hasattr(cdeck, 'commander'):
                    # It's a legacy object
                    new_cdecks[key] = LegacyCommanderDeckAdapter.from_legacy_dict({
                        'deckID': getattr(cdeck, 'deckid', None),
                        'url': getattr(cdeck, 'url', None),
                        'commander': getattr(cdeck, 'commander', None),
                        'partner': getattr(cdeck, 'partner', ''),
                        'companion': getattr(cdeck, 'companion', ''),
                        'colorIdentity': getattr(cdeck, 'colorIdentity', None),
                        'theme': getattr(cdeck, 'theme', ''),
                        'tribe': getattr(cdeck, 'tribe', ''),
                        'cards': getattr(cdeck, 'cards', []),
                        'date': getattr(cdeck, 'date', None),
                        'price': getattr(cdeck, 'price', 0.0),
                    })
                else:
                    new_cdecks[key] = cdeck
        
        aggregate = CommanderMapAggregate(
            decklist_matrix=decklist_matrix,
            commander_decks=commander_decks,
            cdecks=new_cdecks
        )
        
        return cls(aggregate)
