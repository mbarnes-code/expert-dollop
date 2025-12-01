"""
Trait Mapping Service.

Handles creation of mappings from traits (commanders, themes, tribes, colors) to integer IDs.
"""

import itertools
from typing import Any, Dict, List, Optional, TYPE_CHECKING

import pandas as pd

if TYPE_CHECKING:
    from ..entities.commander_deck import CommanderDeck


class TraitMappingService:
    """
    Domain service for creating trait mappings.
    
    Maps string trait values (commander names, themes, tribes, colors)
    to integer IDs for data compression.
    """
    
    def get_trait_mapping(
        self,
        commander_decks: pd.DataFrame,
        cdecks: Optional[Dict[int, 'CommanderDeck']] = None
    ) -> pd.DataFrame:
        """
        Create a mapping of traits to integer IDs.
        
        Args:
            commander_decks: DataFrame with deck data
            cdecks: Dictionary of CommanderDeck entities
            
        Returns:
            DataFrame with columns [category, internal_slug, id]
        """
        print('Defining trait mappings...', end='')
        
        trait_mapping = []
        fields = ['commanderID', 'themeID', 'tribeID', 'colorIdentityID']
        
        for field in fields:
            if field == 'colorIdentityID':
                # Generate all 32 color identities
                unique_values = list(
                    ''.join(ci) for ci in self._powerset(['W', 'U', 'B', 'R', 'G'])
                )
            else:
                unique_values = list(commander_decks[field].unique())
                
                # Add partners and companions for commanderID
                if field == 'commanderID':
                    unique_values.extend(commander_decks['partnerID'].unique())
                    if cdecks:
                        companions = {
                            cdeck.companion for cdeck in cdecks.values()
                            if cdeck.companion
                        }
                        unique_values.extend(companions)
                    unique_values = list(set(unique_values))
                
                unique_values = sorted(unique_values)
                # Remove empty values
                unique_values = [v for v in unique_values if v]
            
            subtrait = pd.DataFrame()
            subtrait['internal_slug'] = unique_values
            subtrait['id'] = range(len(unique_values))
            subtrait['category'] = field
            trait_mapping.append(subtrait)
        
        result = pd.concat(trait_mapping)
        result = result[['category', 'internal_slug', 'id']]
        
        print(f'{len(result)} unique traits')
        return result
    
    def build_trait_lookup(
        self,
        trait_mapping_path: Optional[str] = None,
        trait_mapping_df: Optional[pd.DataFrame] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Build a lookup dictionary from trait mapping.
        
        Args:
            trait_mapping_path: Path to trait mapping CSV
            trait_mapping_df: Or provide the DataFrame directly
            
        Returns:
            Dict mapping category -> internal_slug -> id
        """
        if trait_mapping_path:
            df = pd.read_csv(
                trait_mapping_path,
                usecols=['category', 'internal_slug', 'id']
            ).fillna('')
        elif trait_mapping_df is not None:
            df = trait_mapping_df[['category', 'internal_slug', 'id']]
        else:
            raise ValueError('Must provide trait_mapping_path or trait_mapping_df')
        
        from collections import defaultdict
        trait_mapping = defaultdict(dict)
        
        for _, row in df.iterrows():
            cat, slug, id_val = row['category'], row['internal_slug'], row['id']
            trait_mapping[cat][slug] = id_val
        
        return dict(trait_mapping)
    
    def replace_traits_with_ints(
        self,
        commander_decks: pd.DataFrame,
        trait_mapping: Dict[str, Dict[str, int]]
    ) -> pd.DataFrame:
        """
        Replace trait strings with their integer IDs.
        
        Args:
            commander_decks: DataFrame with deck data
            trait_mapping: Mapping from build_trait_lookup
            
        Returns:
            Updated DataFrame with integer trait values
        """
        result = commander_decks.copy()
        
        for field in ['colorIdentityID', 'commanderID', 'partnerID', 'themeID', 'tribeID']:
            replace_dict = trait_mapping.get(field, {})
            if field == 'partnerID':
                replace_dict = trait_mapping.get('commanderID', {})
            
            if field != 'colorIdentityID':
                def mapping_func(val):
                    return replace_dict.get(val, val) if val else ''
            else:
                def mapping_func(val):
                    return replace_dict.get(val, val)
            
            result[field] = result[field].astype(str).apply(mapping_func)
        
        return result
    
    @staticmethod
    def _powerset(iterable):
        """Generate powerset of an iterable."""
        s = list(iterable)
        return itertools.chain.from_iterable(
            itertools.combinations(s, r) for r in range(len(s) + 1)
        )
