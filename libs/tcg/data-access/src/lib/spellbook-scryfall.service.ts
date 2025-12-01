/**
 * Spellbook-specific Scryfall service for the TCG data access layer.
 * Provides Scryfall integration for Commander Spellbook.
 */

import { ScryfallCard } from '@scryfall/api-types';
import { CardsApi, Template, Configuration } from '@space-cow-media/spellbook-client';
import scryfall from 'scryfall-client';
import Card from 'scryfall-client/dist/models/card';
import List from 'scryfall-client/dist/models/list';

const SCRYFALL_SEARCH_PAGE_SIZE = 175;
const SPELLBOOK_PAGE_SIZE = 50;
const SCRYFALL_COLLECTION_PAGE_SIZE = 75;

/**
 * Get the page size for template replacement queries.
 */
function getPageSize(template: Template): number {
  return template.scryfallQuery
    ? SCRYFALL_SEARCH_PAGE_SIZE
    : Math.min(SPELLBOOK_PAGE_SIZE, SCRYFALL_COLLECTION_PAGE_SIZE);
}

/**
 * Results page from Scryfall API.
 */
export interface ScryfallResultsPage {
  results: List<Card>;
  page: number;
  nextPage?: number;
  count?: number;
}

/**
 * Get Scryfall image URLs for a card.
 * @param card - The Scryfall card
 * @returns Array of image URLs
 */
export function getScryfallImage(card: ScryfallCard.Any | Card): string[] {
  if ('image_uris' in card) {
    return [card.image_uris?.normal || ''];
  } else if ('card_faces' in card) {
    const result = [];
    for (const face of card.card_faces) {
      if ('image_uris' in face) {
        result.push(face.image_uris?.normal || '');
      }
    }
    return result;
  }
  return [''];
}

/**
 * API configuration factory type.
 */
export type ApiConfigurationFactory = () => Configuration;

/**
 * Abstract base class for Spellbook Scryfall services.
 */
export abstract class BaseSpellbookScryfallService {
  protected apiConfigurationFactory?: ApiConfigurationFactory;

  /**
   * Set the API configuration factory.
   */
  setApiConfigurationFactory(factory: ApiConfigurationFactory): void {
    this.apiConfigurationFactory = factory;
  }

  /**
   * Get template replacements.
   * @param template - The template
   * @param page - The page number
   */
  abstract templateReplacements(template: Template, page: number): Promise<ScryfallResultsPage>;
}

/**
 * Spellbook Scryfall service implementation.
 */
export class SpellbookScryfallService extends BaseSpellbookScryfallService {
  private static instance: SpellbookScryfallService | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): SpellbookScryfallService {
    if (!SpellbookScryfallService.instance) {
      SpellbookScryfallService.instance = new SpellbookScryfallService();
    }
    return SpellbookScryfallService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    SpellbookScryfallService.instance = null;
  }

  /**
   * Get template replacements from Scryfall.
   * @param template - The template
   * @param page - The page number (0-indexed)
   */
  async templateReplacements(template: Template, page: number): Promise<ScryfallResultsPage> {
    if (template.scryfallQuery) {
      const response = await scryfall.search(`(${template.scryfallQuery}) legal:commander`, {
        page: page + 1,
      }); // Scryfall pages are 1-indexed
      return {
        results: response,
        page: page,
        nextPage: response.has_more ? page + 1 : undefined,
        count: response.total_cards,
      };
    } else {
      if (!this.apiConfigurationFactory) {
        throw new Error('API configuration factory not set');
      }
      const configuration = this.apiConfigurationFactory();
      const cardsApi = new CardsApi(configuration);
      const pageSize = getPageSize(template);
      const replacements = await cardsApi.cardsList({
        limit: pageSize,
        replaces: [template.id],
        offset: pageSize * page,
      });
      const response = await scryfall.getCollection(
        replacements.results.map((card) =>
          card.oracleId
            ? {
                oracle_id: card.oracleId,
              }
            : {
                name: card.name,
              },
        ),
      );
      return {
        results: response,
        page: page,
        nextPage: replacements.next !== null ? page + 1 : undefined,
        count: replacements.count,
      };
    }
  }
}

// Legacy default export for backward compatibility
const ScryfallService = {
  getScryfallImage,
  templateReplacements: (template: Template, page: number) =>
    SpellbookScryfallService.getInstance().templateReplacements(template, page),
};

export default ScryfallService;
