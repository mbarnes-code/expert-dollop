/**
 * MTG Scripting Toolkit Facade for Spellbook
 * 
 * This module provides a facade layer that integrates the MTG Scripting Toolkit
 * into the Spellbook application using the strangler fig pattern.
 * 
 * It provides card analysis and sorting capabilities following DDD principles.
 * 
 * @example
 * ```typescript
 * import { CardAnalyzer, CardSorter } from 'lib/scripting-toolkit';
 * 
 * // Analyze cards
 * const analyzer = CardAnalyzer.getInstance();
 * const stats = analyzer.getCardStats(cards);
 * 
 * // Sort cards
 * const sorter = CardSorter.getInstance();
 * const sorted = sorter.magicSort(cards);
 * ```
 */

import {
  Card,
  CardPropertyService,
  CardColorService,
  CardTypeService,
  CardLegalityService,
  CardSortService,
  CardListService,
  ColorGroup,
  Format,
  Legality,
  CardTypes,
  CardListComparison,
} from '@expert-dollop/tcg/data-access';

/**
 * Card analysis statistics.
 */
export interface CardStats {
  /** Total number of cards */
  total: number;
  /** Average converted mana cost */
  averageCmc: number;
  /** Number of creatures */
  creatureCount: number;
  /** Number of non-creature spells */
  nonCreatureCount: number;
  /** Number of lands */
  landCount: number;
  /** Distribution by color group */
  colorDistribution: Record<string, number>;
  /** Distribution by card type */
  typeDistribution: Record<string, number>;
}

/**
 * Card Analyzer class providing card analysis functionality.
 * Acts as a facade for the scripting toolkit services.
 */
export class CardAnalyzer {
  private static instance: CardAnalyzer | null = null;
  private readonly propertyService: CardPropertyService;
  private readonly colorService: CardColorService;
  private readonly typeService: CardTypeService;
  private readonly legalityService: CardLegalityService;

  private constructor() {
    this.propertyService = CardPropertyService.getInstance();
    this.colorService = CardColorService.getInstance();
    this.typeService = CardTypeService.getInstance();
    this.legalityService = CardLegalityService.getInstance();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): CardAnalyzer {
    if (!CardAnalyzer.instance) {
      CardAnalyzer.instance = new CardAnalyzer();
    }
    return CardAnalyzer.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardAnalyzer.instance = null;
  }

  /**
   * Get comprehensive statistics for a collection of cards.
   */
  getCardStats(cards: Card[]): CardStats {
    if (cards.length === 0) {
      return {
        total: 0,
        averageCmc: 0,
        creatureCount: 0,
        nonCreatureCount: 0,
        landCount: 0,
        colorDistribution: {},
        typeDistribution: {},
      };
    }

    // Calculate statistics
    let creatureCount = 0;
    let landCount = 0;
    let totalCmc = 0;
    const colorDistribution: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};

    for (const card of cards) {
      // CMC
      totalCmc += card.cmc;

      // Type counts
      if (this.typeService.isCreature(card)) {
        creatureCount++;
      }
      if (this.typeService.isLand(card)) {
        landCount++;
      }

      // Color distribution
      const colorGroup = this.colorService.getColorGroup(card);
      colorDistribution[colorGroup] = (colorDistribution[colorGroup] || 0) + 1;

      // Type distribution
      const types = this.typeService.parseTypes(card).types;
      for (const type of types) {
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
      }
    }

    return {
      total: cards.length,
      averageCmc: totalCmc / cards.length,
      creatureCount,
      nonCreatureCount: cards.length - creatureCount - landCount,
      landCount,
      colorDistribution,
      typeDistribution,
    };
  }

  /**
   * Get the color group for a card.
   */
  getColorGroup(card: Card): ColorGroup {
    return this.colorService.getColorGroup(card);
  }

  /**
   * Check if a card is legal in a specific format.
   */
  isLegalIn(card: Card, format: Format): boolean {
    return this.legalityService.isLegalIn(card, format);
  }

  /**
   * Get all formats where a card is legal.
   */
  getLegalFormats(card: Card): Format[] {
    return this.legalityService.getLegalFormats(card);
  }

  /**
   * Get the oracle text of a card.
   */
  getCardText(card: Card): string {
    return this.propertyService.getText(card);
  }

  /**
   * Parse card types from a card.
   */
  parseTypes(card: Card): CardTypes {
    return this.typeService.parseTypes(card);
  }

  /**
   * Check if a card's text includes a phrase.
   */
  textIncludes(card: Card, phrase: string): boolean {
    return this.propertyService.textIncludes(card, phrase);
  }

  /**
   * Check if a card is a creature.
   */
  isCreature(card: Card): boolean {
    return this.typeService.isCreature(card);
  }

  /**
   * Check if a card is legendary.
   */
  isLegendary(card: Card): boolean {
    return this.typeService.isLegendary(card);
  }
}

/**
 * Card Sorter class providing card sorting functionality.
 * Acts as a facade for the scripting toolkit sorting service.
 */
export class CardSorter {
  private static instance: CardSorter | null = null;
  private readonly sortService: CardSortService;

  private constructor() {
    this.sortService = CardSortService.getInstance();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): CardSorter {
    if (!CardSorter.instance) {
      CardSorter.instance = new CardSorter();
    }
    return CardSorter.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardSorter.instance = null;
  }

  /**
   * Sort cards in traditional Magic order (WUBRG, by type, by CMC).
   */
  magicSort(cards: Card[]): Card[] {
    return this.sortService.magicSort(cards);
  }

  /**
   * Sort cards by name.
   */
  sortByName(cards: Card[]): Card[] {
    return this.sortService.sortByName(cards);
  }

  /**
   * Sort cards by mana value.
   */
  sortByManaValue(cards: Card[]): Card[] {
    return this.sortService.sortByManaValue(cards);
  }

  /**
   * Sort cards by color identity.
   */
  sortByColorIdentity(cards: Card[]): Card[] {
    return this.sortService.sortByColorIdentity(cards);
  }

  /**
   * Group cards by color group.
   */
  groupByColor(cards: Card[]): Map<ColorGroup, Card[]> {
    return this.sortService.groupByColorGroup(cards);
  }

  /**
   * Group cards by type.
   */
  groupByType(cards: Card[]): Map<string, Card[]> {
    return this.sortService.groupByType(cards);
  }
}

/**
 * Card List Manager class providing list manipulation functionality.
 * Acts as a facade for the scripting toolkit list service.
 */
export class CardListManager {
  private static instance: CardListManager | null = null;
  private readonly listService: CardListService;

  private constructor() {
    this.listService = CardListService.getInstance();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): CardListManager {
    if (!CardListManager.instance) {
      CardListManager.instance = new CardListManager();
    }
    return CardListManager.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardListManager.instance = null;
  }

  /**
   * Compare two deck lists.
   */
  compareLists(listA: string[], listB: string[]): CardListComparison {
    return this.listService.compareLists(listA, listB);
  }

  /**
   * Parse a card list from text input.
   */
  parseCardList(input: string): string[] {
    return this.listService.parseCardList(input);
  }

  /**
   * Get unique first printings of cards.
   */
  getUniqueFirstPrintings(cards: Card[]): Card[] {
    return this.listService.uniqueFirstPrintings(cards);
  }

  /**
   * Filter out extra cards (tokens, art series, etc.).
   */
  filterExtras(cards: Card[]): Card[] {
    return this.listService.filterExtras(cards);
  }

  /**
   * Get unique card names from a collection.
   */
  getUniqueNames(cards: Card[]): string[] {
    return this.listService.getUniqueNames(cards);
  }
}

// Re-export types for convenience
export type {
  Card,
  ColorGroup,
  Format,
  Legality,
  CardTypes,
  CardListComparison,
} from '@expert-dollop/tcg/data-access';
