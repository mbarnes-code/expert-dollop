/**
 * Scryfall Catalog Service for fetching MTG catalog data.
 * Provides access to card names, types, keywords, and other catalogs.
 */

import { SCRYFALL_CONFIG } from './scryfall-api.service';

/**
 * Catalog types available from Scryfall.
 */
export type CatalogType =
  | 'card-names'
  | 'artist-names'
  | 'word-bank'
  | 'creature-types'
  | 'planeswalker-types'
  | 'land-types'
  | 'artifact-types'
  | 'enchantment-types'
  | 'spell-types'
  | 'powers'
  | 'toughnesses'
  | 'loyalties'
  | 'watermarks'
  | 'keyword-abilities'
  | 'keyword-actions'
  | 'ability-words';

interface CatalogResponse {
  object: 'catalog';
  uri: string;
  total_values: number;
  data: string[];
}

/**
 * Scryfall Catalog Service.
 * Provides methods for fetching catalog data from Scryfall.
 */
export class ScryfallCatalogService {
  private static instance: ScryfallCatalogService | null = null;
  private cache: Map<string, string[]> = new Map();

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): ScryfallCatalogService {
    if (!ScryfallCatalogService.instance) {
      ScryfallCatalogService.instance = new ScryfallCatalogService();
    }
    return ScryfallCatalogService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    ScryfallCatalogService.instance = null;
  }

  /**
   * Fetch a catalog from Scryfall.
   */
  private async fetchCatalog(
    catalogType: CatalogType,
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<string[]> {
    const cached = this.cache.get(catalogType);
    if (cached) {
      return cached;
    }

    const { abortSignal } = options;
    const url = `${SCRYFALL_CONFIG.apiURL}/catalog/${catalogType}`;

    const response = await fetch(url, { signal: abortSignal });
    const result = (await response.json()) as CatalogResponse;

    this.cache.set(catalogType, result.data);
    return result.data;
  }

  /**
   * Fetch all card names.
   */
  async fetchCardNames(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('card-names', options);
  }

  /**
   * Fetch all artist names.
   */
  async fetchArtistNames(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('artist-names', options);
  }

  /**
   * Fetch the word bank (all words in card names and text).
   */
  async fetchWordBank(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('word-bank', options);
  }

  /**
   * Fetch all creature types.
   */
  async fetchCreatureTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('creature-types', options);
  }

  /**
   * Fetch all planeswalker types.
   */
  async fetchPlaneswalkerTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('planeswalker-types', options);
  }

  /**
   * Fetch all land types.
   */
  async fetchLandTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('land-types', options);
  }

  /**
   * Fetch all artifact types.
   */
  async fetchArtifactTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('artifact-types', options);
  }

  /**
   * Fetch all enchantment types.
   */
  async fetchEnchantmentTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('enchantment-types', options);
  }

  /**
   * Fetch all spell types.
   */
  async fetchSpellTypes(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('spell-types', options);
  }

  /**
   * Fetch all power values.
   */
  async fetchPowers(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('powers', options);
  }

  /**
   * Fetch all toughness values.
   */
  async fetchToughnesses(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('toughnesses', options);
  }

  /**
   * Fetch all loyalty values.
   */
  async fetchLoyalties(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('loyalties', options);
  }

  /**
   * Fetch all watermarks.
   */
  async fetchWatermarks(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('watermarks', options);
  }

  /**
   * Fetch all keyword abilities.
   */
  async fetchKeywordAbilities(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('keyword-abilities', options);
  }

  /**
   * Fetch all keyword actions.
   */
  async fetchKeywordActions(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('keyword-actions', options);
  }

  /**
   * Fetch all ability words.
   */
  async fetchAbilityWords(options?: { abortSignal?: AbortSignal }): Promise<string[]> {
    return this.fetchCatalog('ability-words', options);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
