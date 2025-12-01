"""
URL Extraction Service.

Handles extraction of deck sources and IDs from deck URLs.
"""

import re
from typing import Optional


class UrlExtractionService:
    """
    Domain service for extracting deck source information from URLs.
    
    Supports Moxfield, Archidekt, MTGGoldfish, Deckstats, and Aetherhub.
    """
    
    URL_PATTERNS = {
        'deckstats': r'https://deckstats.net/decks/([0-9]*/[0-9]*)\-.*',
        'moxfield': r'https://moxfield.com/decks/([^#]*)',
        'mtggoldfish': r'http://www.mtggoldfish.com/deck/([^#]*)',
        'aetherhub': r'http://aetherhub.com/Deck/Public/([^#]*)',
        'archidekt': r'https://archidekt.com/decks/([^#]*)',
    }
    
    def extract_source_from_url(self, url: str) -> str:
        """
        Extract the source site name from a deck URL.
        
        Args:
            url: Full deck URL
            
        Returns:
            Source site name (e.g., 'moxfield', 'archidekt')
        """
        # Remove www prefix and extract domain
        source = url.replace('www.', '').split('/')[2].split('.')[0]
        return source
    
    def fetch_decklist_ids_from_url(
        self,
        url: str,
        source: Optional[str] = None
    ) -> str:
        """
        Extract the deck ID from a deck URL.
        
        Args:
            url: Full deck URL
            source: Source site name (if not provided, will be extracted)
            
        Returns:
            Deck ID string
            
        Raises:
            NotImplementedError: If source is not supported
        """
        if source is None:
            source = self.extract_source_from_url(url)
        
        pattern = self.URL_PATTERNS.get(source)
        if not pattern:
            raise NotImplementedError(f'Unrecognized source: {source}')
        
        match = re.search(pattern, url)
        if match:
            return match.group(1)
        
        return ''
