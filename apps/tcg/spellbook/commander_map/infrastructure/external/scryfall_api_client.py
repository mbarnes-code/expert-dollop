"""
Scryfall API Client.

Handles communication with the Scryfall API for card data.
"""

from typing import Any, Dict, List, Optional

import requests


class ScryfallApiClient:
    """
    Client for the Scryfall API.
    
    Provides methods to fetch card data, bulk data, and card images.
    """
    
    BASE_URL = "https://api.scryfall.com"
    
    def __init__(self, timeout: int = 30):
        """
        Initialize the client.
        
        Args:
            timeout: Request timeout in seconds
        """
        self.timeout = timeout
        self.session = requests.Session()
    
    def get_bulk_data_uri(self, data_type: str = 'oracle-cards') -> str:
        """
        Get the download URI for a bulk data type.
        
        Args:
            data_type: Type of bulk data ('oracle-cards', 'default-cards', etc.)
            
        Returns:
            Download URI for the bulk data
        """
        response = self.session.get(
            f"{self.BASE_URL}/bulk-data/{data_type}",
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()['download_uri']
    
    def fetch_bulk_data(self, data_type: str = 'oracle-cards') -> List[Dict]:
        """
        Fetch bulk card data from Scryfall.
        
        Args:
            data_type: Type of bulk data
            
        Returns:
            List of card data dictionaries
        """
        uri = self.get_bulk_data_uri(data_type)
        response = self.session.get(uri, timeout=self.timeout * 10)
        response.raise_for_status()
        return response.json()
    
    def get_card_by_name(self, name: str) -> Optional[Dict]:
        """
        Get a specific card by exact name.
        
        Args:
            name: Card name
            
        Returns:
            Card data dictionary or None if not found
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}/cards/named",
                params={'exact': name},
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return None
    
    def search_cards(self, query: str) -> List[Dict]:
        """
        Search for cards using Scryfall query syntax.
        
        Args:
            query: Scryfall search query
            
        Returns:
            List of matching card dictionaries
        """
        cards = []
        url = f"{self.BASE_URL}/cards/search"
        params = {'q': query}
        
        while url:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            cards.extend(data.get('data', []))
            
            if data.get('has_more'):
                url = data.get('next_page')
                params = {}  # Next page URL includes params
            else:
                break
        
        return cards
    
    def get_card_image_uri(
        self,
        card: Dict,
        version: str = 'normal'
    ) -> Optional[str]:
        """
        Get the image URI for a card.
        
        Args:
            card: Card data dictionary
            version: Image version ('small', 'normal', 'large', 'png', 'art_crop', 'border_crop')
            
        Returns:
            Image URI or None if not available
        """
        # Handle double-faced cards
        if 'card_faces' in card and card.get('layout') in ['transform', 'modal_dfc']:
            return card['card_faces'][0].get('image_uris', {}).get(version)
        
        return card.get('image_uris', {}).get(version)
