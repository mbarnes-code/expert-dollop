/**
 * MTG Scripting Toolkit Feature - Core Feature Class
 * 
 * Implements the strangler fig pattern to gradually ingest
 * functionality from the mtg-scripting-toolkit.
 * 
 * This feature provides high-level operations for MTG card analysis
 * and manipulation, following DDD modular monolith best practices.
 */

import { BaseFeature } from '../base-feature';
import {
  CardPropertyService,
  CardColorService,
  CardTypeService,
  CardLegalityService,
  CardSortService,
  CardListService,
  Card,
  ColorGroup,
  Format,
  CardListComparison,
} from '@expert-dollop/tcg/data-access';

/**
 * Configuration for the Scripting Toolkit feature.
 */
export interface ScriptingToolkitConfig {
  /** Enable caching for expensive operations */
  enableCache?: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

/**
 * Default configuration values.
 */
const DEFAULTS = {
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * MTG Scripting Toolkit Feature.
 * 
 * Provides a unified interface for MTG card analysis operations including:
 * - Card property extraction
 * - Color analysis and grouping
 * - Type classification
 * - Legality checking
 * - Sorting in traditional Magic order
 * - List comparison and manipulation
 * 
 * @example
 * ```typescript
 * const toolkit = ScriptingToolkitFeature.getInstance();
 * await toolkit.initialize();
 * 
 * // Analyze cards
 * const analysis = toolkit.analyzeCards(cards);
 * 
 * // Sort cards
 * const sorted = toolkit.sortCards(cards);
 * 
 * // Compare deck lists
 * const comparison = toolkit.compareDecklists(deckA, deckB);
 * ```
 */
export class ScriptingToolkitFeature extends BaseFeature {
  private static instance: ScriptingToolkitFeature | null = null;
  private readonly config: Required<ScriptingToolkitConfig>;
  private initialized = false;

  // Service instances
  private propertyService!: CardPropertyService;
  private colorService!: CardColorService;
  private typeService!: CardTypeService;
  private legalityService!: CardLegalityService;
  private sortService!: CardSortService;
  private listService!: CardListService;

  constructor(config?: ScriptingToolkitConfig) {
    super('scripting-toolkit');
    this.config = {
      enableCache: config?.enableCache ?? DEFAULTS.enableCache,
      cacheTTL: config?.cacheTTL ?? DEFAULTS.cacheTTL,
    };
  }

  /**
   * Get singleton instance of the feature.
   */
  static getInstance(config?: ScriptingToolkitConfig): ScriptingToolkitFeature {
    if (!ScriptingToolkitFeature.instance) {
      ScriptingToolkitFeature.instance = new ScriptingToolkitFeature(config);
    }
    return ScriptingToolkitFeature.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    ScriptingToolkitFeature.instance = null;
  }

  /**
   * Get the feature configuration.
   */
  getConfig(): Required<ScriptingToolkitConfig> {
    return { ...this.config };
  }

  /**
   * Check if feature is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the feature and its services.
   * Uses lazy initialization with error handling to ensure partial failures
   * don't prevent the feature from being used.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize all service instances with error handling
      this.propertyService = CardPropertyService.getInstance();
      this.colorService = CardColorService.getInstance();
      this.typeService = CardTypeService.getInstance();
      this.legalityService = CardLegalityService.getInstance();
      this.sortService = CardSortService.getInstance();
      this.listService = CardListService.getInstance();

      this.initialized = true;
    } catch (error) {
      // Log error but allow partial initialization
      console.error('Failed to initialize ScriptingToolkitFeature:', error);
      throw new Error(`ScriptingToolkitFeature initialization failed: ${error}`);
    }
  }

  /**
   * Clean up resources.
   */
  async dispose(): Promise<void> {
    // Reset all service singletons
    CardPropertyService.resetInstance();
    CardColorService.resetInstance();
    CardTypeService.resetInstance();
    CardLegalityService.resetInstance();
    CardSortService.resetInstance();
    CardListService.resetInstance();

    this.initialized = false;
    ScriptingToolkitFeature.instance = null;
  }

  /**
   * Sort cards in traditional Magic order (WUBRG, by type, by CMC).
   */
  sortCards(cards: Card[]): Card[] {
    this.ensureInitialized();
    return this.sortService.magicSort(cards);
  }

  /**
   * Group cards by color group.
   */
  groupByColor(cards: Card[]): Map<ColorGroup, Card[]> {
    this.ensureInitialized();
    return this.sortService.groupByColorGroup(cards);
  }

  /**
   * Group cards by type.
   */
  groupByType(cards: Card[]): Map<string, Card[]> {
    this.ensureInitialized();
    return this.sortService.groupByType(cards);
  }

  /**
   * Compare two deck lists.
   */
  compareDecklists(listA: string[], listB: string[]): CardListComparison {
    this.ensureInitialized();
    return this.listService.compareLists(listA, listB);
  }

  /**
   * Filter to unique first printings only.
   */
  getUniqueFirstPrintings(cards: Card[]): Card[] {
    this.ensureInitialized();
    return this.listService.uniqueFirstPrintings(cards);
  }

  /**
   * Filter out extra cards (tokens, art series, promos).
   */
  filterExtras(cards: Card[]): Card[] {
    this.ensureInitialized();
    return this.listService.filterExtras(cards);
  }

  /**
   * Parse a card list from text input.
   */
  parseCardList(input: string): string[] {
    this.ensureInitialized();
    return this.listService.parseCardList(input);
  }

  /**
   * Get the color group for a card.
   */
  getColorGroup(card: Card): ColorGroup {
    this.ensureInitialized();
    return this.colorService.getColorGroup(card);
  }

  /**
   * Check if cards are legal in a format.
   */
  areCardsLegalIn(cards: Card[], format: Format): boolean {
    this.ensureInitialized();
    return cards.every((card) => this.legalityService.isLegalIn(card, format));
  }

  /**
   * Get the oracle text of a card.
   */
  getCardText(card: Card): string {
    this.ensureInitialized();
    return this.propertyService.getText(card);
  }

  /**
   * Check if a card's text includes a phrase.
   */
  cardTextIncludes(card: Card, phrase: string): boolean {
    this.ensureInitialized();
    return this.propertyService.textIncludes(card, phrase);
  }

  /**
   * Check if a card is a creature.
   */
  isCreature(card: Card): boolean {
    this.ensureInitialized();
    return this.typeService.isCreature(card);
  }

  /**
   * Check if a card is legendary.
   */
  isLegendary(card: Card): boolean {
    this.ensureInitialized();
    return this.typeService.isLegendary(card);
  }

  /**
   * Analyze a collection of cards.
   */
  analyzeCards(cards: Card[]): CardAnalysis {
    this.ensureInitialized();

    const colorGroups = this.groupByColor(cards);
    const typeGroups = this.groupByType(cards);

    // Calculate statistics
    const totalCards = cards.length;
    const uniqueNames = this.listService.getUniqueNames(cards).length;
    const averageCmc =
      cards.length > 0
        ? cards.reduce((sum, card) => sum + card.cmc, 0) / cards.length
        : 0;

    // Count by color group
    const colorDistribution: Record<string, number> = {};
    colorGroups.forEach((groupCards, group) => {
      colorDistribution[group] = groupCards.length;
    });

    // Count by type
    const typeDistribution: Record<string, number> = {};
    typeGroups.forEach((groupCards, type) => {
      typeDistribution[type] = groupCards.length;
    });

    // Count creatures
    const creatureCount = cards.filter((card) =>
      this.typeService.isCreature(card)
    ).length;

    // Count legendary cards
    const legendaryCount = cards.filter((card) =>
      this.typeService.isLegendary(card)
    ).length;

    return {
      totalCards,
      uniqueNames,
      averageCmc,
      colorDistribution,
      typeDistribution,
      creatureCount,
      legendaryCount,
    };
  }

  /**
   * Ensure the feature is initialized before use.
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'ScriptingToolkitFeature is not initialized. Call initialize() first.'
      );
    }
  }
}

/**
 * Result of analyzing a card collection.
 */
export interface CardAnalysis {
  /** Total number of cards */
  totalCards: number;
  /** Number of unique card names */
  uniqueNames: number;
  /** Average converted mana cost */
  averageCmc: number;
  /** Card count by color group */
  colorDistribution: Record<string, number>;
  /** Card count by type */
  typeDistribution: Record<string, number>;
  /** Number of creatures */
  creatureCount: number;
  /** Number of legendary cards */
  legendaryCount: number;
}
