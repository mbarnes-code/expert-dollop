/**
 * Commander Spellbook API Service for combo data.
 * Provides methods for fetching and filtering Magic combos.
 */

import { BaseApiService } from '../../base-api.service';
import { Format, formats } from '../types';
import { Combo } from './types';

/**
 * Commander Spellbook configuration.
 */
export const COMMANDER_SPELLBOOK_CONFIG = {
  /** Google Sheet ID containing the combo database */
  googleSheetID: '1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA',
  /** Sheet name for combo data */
  combosSheetName: 'combos',
  /** Base API URL for the new JSON API */
  apiURL: 'https://json.commanderspellbook.com',
} as const;

/**
 * Commander Spellbook API Service.
 * Provides methods for fetching and analyzing MTG combos.
 */
export class CommanderSpellbookService extends BaseApiService {
  private static instance: CommanderSpellbookService | null = null;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly cacheTTL: number = 60 * 60 * 1000; // 1 hour

  constructor() {
    super(COMMANDER_SPELLBOOK_CONFIG.apiURL);
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CommanderSpellbookService {
    if (!CommanderSpellbookService.instance) {
      CommanderSpellbookService.instance = new CommanderSpellbookService();
    }
    return CommanderSpellbookService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CommanderSpellbookService.instance = null;
  }

  /**
   * Filter combos that contain a specific card.
   */
  combosWithCard(combos: Combo[], cardName: string): Combo[] {
    return combos.filter((combo) => combo.cardNames.includes(cardName));
  }

  /**
   * Get unique outcomes from a set of combos.
   */
  uniqueOutcomes(combos: Combo[]): string[] {
    const outcomes = combos.flatMap((combo) => combo.results || []);
    return [...new Set(outcomes)];
  }

  /**
   * Filter combos that are legal in a specific format.
   */
  legalInFormat(combos: Combo[], format: Format): Combo[] {
    return combos.filter((combo) => combo.legalities[format] === 'legal');
  }

  /**
   * Compute collective legality for a group of cards.
   */
  collectiveLegality(
    cardLegalities: Record<Format, 'legal' | 'not_legal' | 'restricted' | 'banned'>[]
  ): Record<Format, 'legal' | 'not_legal'> {
    const result = {} as Record<Format, 'legal' | 'not_legal'>;

    for (const format of formats) {
      const allLegal = cardLegalities.every(
        (legalities) => legalities[format] === 'legal'
      );
      result[format] = allLegal ? 'legal' : 'not_legal';
    }

    return result;
  }

  /**
   * Filter combos by color identity.
   */
  filterByColorIdentity(combos: Combo[], colorIdentity: string): Combo[] {
    return combos.filter((combo) => {
      if (!combo.colorIdentity) return false;
      // Check if combo's color identity is a subset of the given identity
      return combo.colorIdentity
        .split('')
        .every((color) => colorIdentity.includes(color));
    });
  }

  /**
   * Filter combos by number of cards.
   */
  filterByCardCount(combos: Combo[], minCards: number, maxCards?: number): Combo[] {
    return combos.filter((combo) => {
      const count = combo.cardNames.length;
      if (maxCards !== undefined) {
        return count >= minCards && count <= maxCards;
      }
      return count >= minCards;
    });
  }

  /**
   * Search combos by outcome text.
   */
  searchByOutcome(combos: Combo[], searchTerm: string): Combo[] {
    const term = searchTerm.toLowerCase();
    return combos.filter((combo) =>
      combo.results?.some((result) => result.toLowerCase().includes(term))
    );
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
