/**
 * Scryfall API Service for MTG card data.
 * Provides a complete interface to the Scryfall API following DDD patterns.
 * 
 * This module implements the strangler fig pattern to gradually ingest
 * functionality from mtg-scripting-toolkit into the modular monolith.
 */

import { BaseApiService } from '../../base-api.service';
import { Card, CardList, CardSet, CardLayout, SetType, CardID, CardFace } from '../types';

/**
 * Scryfall API configuration.
 */
export const SCRYFALL_CONFIG = {
  apiURL: 'https://api.scryfall.com',
  fetchLimit: 75,
} as const;

/**
 * Bulk data types available from Scryfall.
 */
export type BulkDataType =
  | 'oracle_cards'
  | 'unique_artwork'
  | 'default_cards'
  | 'all_cards'
  | 'rulings';

/**
 * Sort order options for search results.
 */
export type SortOrder =
  | 'name'
  | 'set'
  | 'released'
  | 'rarity'
  | 'color'
  | 'usd'
  | 'tix'
  | 'eur'
  | 'cmc'
  | 'power'
  | 'toughness'
  | 'edhrec'
  | 'penny'
  | 'artist'
  | 'review';

/**
 * Sort direction options.
 */
export type SortDirection = 'auto' | 'asc' | 'desc';

/**
 * Rollup mode for search results.
 */
export type RollupMode = 'cards' | 'art' | 'prints';

/**
 * Search options for the Scryfall API.
 */
export interface SearchOptions {
  maxPages?: number;
  order?: SortOrder;
  direction?: SortDirection;
  includeExtras?: boolean;
  unique?: RollupMode;
  abortSignal?: AbortSignal;
}

/**
 * Fetch card options.
 */
export interface FetchCardOptions {
  id?: string;
  name?: string;
  set?: string;
  abortSignal?: AbortSignal;
}

/**
 * Collection fetch result.
 */
export interface CollectionResult {
  cards: Card[];
  notFound?: CardID[];
  error?: string;
}

/**
 * Card art information.
 */
export interface CardArtInfo {
  id: string;
  name: string;
  set: string;
  artist: string;
  imageURL: string;
}

/**
 * Bulk data set information.
 */
interface BulkDataSet {
  object: 'bulk_data';
  id: string;
  type: BulkDataType;
  updated_at: string;
  uri: string;
  name: string;
  description: string;
  compressed_size: number;
  download_uri: string;
  content_type: string;
  content_encoding: string;
}

interface BulkDataSetsResponse {
  object: 'list';
  data: BulkDataSet[];
}

/**
 * Scryfall API Service.
 * Provides methods for interacting with the Scryfall API.
 */
export class ScryfallApiService extends BaseApiService {
  private static instance: ScryfallApiService | null = null;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly cacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    super(SCRYFALL_CONFIG.apiURL);
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): ScryfallApiService {
    if (!ScryfallApiService.instance) {
      ScryfallApiService.instance = new ScryfallApiService();
    }
    return ScryfallApiService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    ScryfallApiService.instance = null;
  }

  /**
   * Search for cards using Scryfall's query syntax.
   */
  async search(query: string, options: SearchOptions = {}): Promise<Card[]> {
    const {
      maxPages = 1,
      order,
      direction,
      includeExtras,
      unique,
      abortSignal,
    } = options;

    const params = new URLSearchParams({ q: query });

    if (order != null) {
      params.append('order', order);
    }
    if (direction != null) {
      params.append('dir', direction);
    }
    if (includeExtras != null) {
      params.append('include_extras', includeExtras ? 'true' : 'false');
    }
    if (unique != null) {
      params.append('unique', unique);
    }

    let url: string | undefined = `${SCRYFALL_CONFIG.apiURL}/cards/search?${params.toString()}`;
    let result: Card[] = [];
    let pageIndex = 0;

    while (url != null && pageIndex < maxPages) {
      const response = await fetch(url, { signal: abortSignal });
      const json = (await response.json()) as CardList;

      if (json.data != null) {
        result = [...result, ...json.data];
      }

      url = json.next_page;
      pageIndex++;
    }

    return result;
  }

  /**
   * Fetch a specific card by name or ID.
   */
  async fetchCard(options: FetchCardOptions): Promise<Card | null> {
    const { abortSignal, ...cardOptions } = options;

    let url: string;

    if (cardOptions.id != null) {
      url = `${SCRYFALL_CONFIG.apiURL}/cards/${cardOptions.id}`;
    } else if (cardOptions.name != null) {
      const params = new URLSearchParams({
        fuzzy: cardOptions.name.trim().toLowerCase(),
      });
      if (cardOptions.set != null) {
        params.append('set', cardOptions.set.trim().toLowerCase());
      }
      url = `${SCRYFALL_CONFIG.apiURL}/cards/named?${params.toString()}`;
    } else {
      return null;
    }

    const response = await fetch(url, { signal: abortSignal });
    const json = await response.json();

    if (json.object === 'error') {
      return null;
    }

    return json as Card;
  }

  /**
   * Fetch card information for a collection of cards.
   */
  async fetchCollection(
    cardIdentifiers: CardID[],
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<CollectionResult> {
    const { abortSignal } = options;

    const batches = this.chunkArray(
      cardIdentifiers.map(this.formatIdentifier),
      SCRYFALL_CONFIG.fetchLimit
    );

    const cards: Card[] = [];
    const notFound: CardID[] = [];

    for (const batch of batches) {
      const response = await fetch(`${SCRYFALL_CONFIG.apiURL}/cards/collection`, {
        method: 'POST',
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifiers: batch }),
        signal: abortSignal,
      });

      const json = await response.json();

      if (json.object === 'error') {
        return { cards: [], error: json.details };
      }

      cards.push(...json.data);

      if (json.not_found) {
        notFound.push(...json.not_found);
      }
    }

    return { cards, notFound };
  }

  /**
   * Fetch bulk data from Scryfall.
   */
  async fetchBulkData(type: 'oracle_cards' | 'default_cards' = 'oracle_cards'): Promise<Card[]> {
    const cacheKey = `scryfall-bulk-${type}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as Card[];
    }

    const bulkDataResponse = await fetch(`${SCRYFALL_CONFIG.apiURL}/bulk-data`);
    const bulkDataObjects = (await bulkDataResponse.json()) as BulkDataSetsResponse;

    const data = bulkDataObjects.data.find((object) => object.type === type);

    if (data == null) {
      throw new Error(`Unable to find bulk data set of type "${type}"`);
    }

    const cardsResponse = await fetch(data.download_uri);
    const cards = (await cardsResponse.json()) as Card[];

    this.cache.set(cacheKey, { data: cards, timestamp: Date.now() });

    return cards;
  }

  /**
   * Fetch all sets from Scryfall.
   */
  async fetchSets(options: { abortSignal?: AbortSignal } = {}): Promise<CardSet[]> {
    const { abortSignal } = options;
    const response = await fetch(`${SCRYFALL_CONFIG.apiURL}/sets`, { signal: abortSignal });
    const json = await response.json();
    return json.data as CardSet[];
  }

  /**
   * Fetch a specific set by code.
   */
  async fetchSet(
    code: string,
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<CardSet | null> {
    const { abortSignal } = options;
    const response = await fetch(`${SCRYFALL_CONFIG.apiURL}/sets/${code}`, {
      signal: abortSignal,
    });
    return response.json();
  }

  /**
   * Fetch card art information.
   */
  async fetchCardArt(options: FetchCardOptions): Promise<CardArtInfo | null> {
    if (options.id == null && options.name == null) {
      throw new Error('Cannot fetch card art without a name or id');
    }

    const card = await this.fetchCard(options);

    if (card == null) {
      return null;
    }

    if (card.card_faces != null && options.name != null) {
      const face = card.card_faces.find(
        (face: CardFace) => face.name.toLowerCase() === options.name!.toLowerCase()
      );

      if (face != null) {
        return {
          id: card.id,
          name: face.name,
          set: card.set,
          artist: face.artist,
          imageURL: face.image_uris?.art_crop || '',
        };
      }
    }

    return {
      id: card.id,
      name: card.name,
      set: card.set,
      artist: card.artist,
      imageURL: card.image_uris?.art_crop || '',
    };
  }

  /**
   * Get image URL for a card.
   */
  imageURL(
    options: { cardName?: string; set?: string; id?: string; version?: 'normal' | 'art_crop' },
    face?: 'front' | 'back'
  ): string {
    const { version = 'normal' } = options;

    const params: Record<string, string> = {
      format: 'image',
      version,
    };

    if (face) {
      params.face = face;
    }

    if (options.id) {
      return `${SCRYFALL_CONFIG.apiURL}/cards/${options.id}?${new URLSearchParams(params).toString()}`;
    }

    if (options.cardName) {
      params.exact = options.cardName;
      if (options.set) {
        params.set = options.set;
      }
    }

    return `${SCRYFALL_CONFIG.apiURL}/cards/named?${new URLSearchParams(params).toString()}`;
  }

  /**
   * Extract card names from a set of cards.
   */
  cardNames(cards: Card[]): string[] {
    const doubleFacedLayouts = [CardLayout.Transform, CardLayout.ModalDfc];
    const excludedSetTypes = [SetType.Memorabilia, SetType.Token];

    return cards
      .map((card) => {
        if (excludedSetTypes.includes(card.set_type)) {
          return null;
        }

        if (doubleFacedLayouts.includes(card.layout) && card.card_faces != null) {
          return card.card_faces[0].name;
        }

        return card.name;
      })
      .filter((name): name is string => name != null);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Format a card identifier for the collection API.
   */
  private formatIdentifier(id: CardID): Record<string, string> {
    if (typeof id === 'string') {
      return { name: this.normalizeName(id) };
    }

    if ('name' in id) {
      return { ...id, name: this.normalizeName((id as { name: string }).name) };
    }

    return id as Record<string, string>;
  }

  /**
   * Normalize a card name (handle double-faced cards).
   */
  private normalizeName(name: string): string {
    return name.split('//')[0].trim();
  }

  /**
   * Split an array into chunks.
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
