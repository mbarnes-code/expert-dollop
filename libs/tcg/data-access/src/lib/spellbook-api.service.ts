import { BaseApiService } from './base-api.service';

/**
 * Types for Commander Spellbook API responses
 */
export interface SpellbookCombo {
  id: string;
  cards: SpellbookCard[];
  colorIdentity: string;
  prerequisites: string[];
  steps: string[];
  results: string[];
}

export interface SpellbookCard {
  id: string;
  name: string;
  oracleId?: string;
  scryfallId?: string;
}

export interface SpellbookSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  colorIdentity?: string;
}

export interface SpellbookSearchResult {
  results: SpellbookCombo[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Configuration for the Spellbook API service
 */
export interface SpellbookApiConfig {
  basePath?: string;
  cacheTTL?: number;
}

/**
 * Spellbook API Service for Commander Spellbook integration.
 * Implements the strangler fig pattern to gradually ingest external API.
 */
export class SpellbookApiService extends BaseApiService {
  private static instance: SpellbookApiService | null = null;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly cacheTTL: number;

  private static readonly DEFAULT_BASE_PATH = 'https://json.commanderspellbook.com';
  private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config?: SpellbookApiConfig) {
    super(config?.basePath || SpellbookApiService.DEFAULT_BASE_PATH);
    this.cacheTTL = config?.cacheTTL ?? SpellbookApiService.DEFAULT_CACHE_TTL;
  }

  /**
   * Get singleton instance of the service
   */
  static getInstance(config?: SpellbookApiConfig): SpellbookApiService {
    if (!SpellbookApiService.instance) {
      SpellbookApiService.instance = new SpellbookApiService(config);
    }
    return SpellbookApiService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    SpellbookApiService.instance = null;
  }

  /**
   * Get cached data or fetch fresh data
   */
  private async getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Fetch the legacy ID map for variant lookups
   */
  async fetchLegacyIdMap(): Promise<Record<string, string>> {
    return this.getCachedOrFetch('legacy-id-map', () =>
      this.get<Record<string, string>>('/variant_id_map.json')
    );
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
