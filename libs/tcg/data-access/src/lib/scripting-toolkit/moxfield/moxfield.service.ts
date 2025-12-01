/**
 * Moxfield API Service for deck data.
 * Provides methods for fetching deck lists and metadata from Moxfield.
 */

import { BaseApiService } from '../../base-api.service';
import { MoxfieldDeck } from './types';

/**
 * Moxfield configuration.
 */
export const MOXFIELD_CONFIG = {
  apiURL: 'https://api2.moxfield.com/v3',
  deckLinkPattern: /moxfield.com\/decks\/(?<deckID>[a-zA-Z0-9-_]+?)($|\?)/i,
} as const;

/**
 * Moxfield API Service.
 * Provides methods for interacting with Moxfield.
 */
export class MoxfieldService extends BaseApiService {
  private static instance: MoxfieldService | null = null;

  constructor() {
    super(MOXFIELD_CONFIG.apiURL);
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): MoxfieldService {
    if (!MoxfieldService.instance) {
      MoxfieldService.instance = new MoxfieldService();
    }
    return MoxfieldService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    MoxfieldService.instance = null;
  }

  /**
   * Extract deck ID from a Moxfield URL.
   */
  deckIDFromLink(url: string): string | null {
    return url.match(MOXFIELD_CONFIG.deckLinkPattern)?.groups?.deckID ?? null;
  }

  /**
   * Get the API URL for a deck.
   */
  apiURLForDeck(id: string): string {
    return `${MOXFIELD_CONFIG.apiURL}/decks/all/${id}`;
  }

  /**
   * Fetch a deck from Moxfield.
   */
  async getDeck(url: string): Promise<MoxfieldDeck | null> {
    const id = this.deckIDFromLink(url);

    if (id == null) {
      return null;
    }

    const response = await fetch(this.apiURLForDeck(id));
    return response.json();
  }

  /**
   * Extract card names from a deck.
   */
  cardNamesFromDeck(deck: MoxfieldDeck): string[] {
    return Object.values(deck.boards.mainboard.cards).map((item) => item.card.name);
  }

  /**
   * Get all card names including sideboard.
   */
  allCardNamesFromDeck(deck: MoxfieldDeck): string[] {
    const mainboard = Object.values(deck.boards.mainboard.cards).map(
      (item) => item.card.name
    );
    const sideboard = Object.values(deck.boards.sideboard.cards).map(
      (item) => item.card.name
    );
    return [...mainboard, ...sideboard];
  }

  /**
   * Get commander names from a deck.
   */
  commanderNamesFromDeck(deck: MoxfieldDeck): string[] {
    return Object.values(deck.boards.commanders.cards).map((item) => item.card.name);
  }
}
