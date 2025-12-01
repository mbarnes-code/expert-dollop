/**
 * Card List Utilities Service for MTG card collection operations.
 * Implements functionality for comparing, filtering, and processing card lists.
 * 
 * Follows DDD patterns with class abstraction for the strangler fig integration.
 */

import { Card, CardLayout, CardListComparison, SetType } from './types';

/**
 * Card list comparison and manipulation service.
 * Provides operations for working with collections of cards.
 */
export class CardListService {
  private static instance: CardListService | null = null;

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardListService {
    if (!CardListService.instance) {
      CardListService.instance = new CardListService();
    }
    return CardListService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardListService.instance = null;
  }

  /**
   * Compare two lists of card names.
   * Returns cards that are shared, unique to the first list, or unique to the second.
   */
  compareLists(listA: string[], listB: string[]): CardListComparison {
    const setA = new Set(listA);
    const setB = new Set(listB);

    const shared: string[] = [];
    const uniqueToFirst: string[] = [];
    const uniqueToSecond: string[] = [];

    for (const name of listA) {
      if (setB.has(name)) {
        if (!shared.includes(name)) {
          shared.push(name);
        }
      } else {
        uniqueToFirst.push(name);
      }
    }

    for (const name of listB) {
      if (!setA.has(name)) {
        uniqueToSecond.push(name);
      }
    }

    return { shared, uniqueToFirst, uniqueToSecond };
  }

  /**
   * Filter a card list to only unique first printings.
   * Removes reprints, tokens, art series, and promotional items.
   */
  uniqueFirstPrintings(cards: Card[]): Card[] {
    const seenNames = new Set<string>();
    const result: Card[] = [];

    for (const card of cards) {
      // Skip reprints
      if (card.reprint) {
        continue;
      }

      // Skip art series cards
      if (card.layout === CardLayout.ArtSeries) {
        continue;
      }

      // Skip tokens and related
      if (
        card.layout === CardLayout.Token ||
        card.layout === CardLayout.DoubleFacedToken ||
        card.layout === CardLayout.Emblem
      ) {
        continue;
      }

      // Skip memorabilia and special set types
      if (
        card.set_type === SetType.Memorabilia ||
        card.set_type === SetType.Token
      ) {
        continue;
      }

      // Deduplicate by name
      if (!seenNames.has(card.name)) {
        seenNames.add(card.name);
        result.push(card);
      }
    }

    return result;
  }

  /**
   * Filter out "extra" cards like tokens, art series, and promos.
   */
  filterExtras(cards: Card[]): Card[] {
    return cards.filter((card) => {
      // Exclude tokens
      if (
        card.layout === CardLayout.Token ||
        card.layout === CardLayout.DoubleFacedToken ||
        card.layout === CardLayout.Emblem
      ) {
        return false;
      }

      // Exclude art series
      if (card.layout === CardLayout.ArtSeries) {
        return false;
      }

      // Exclude memorabilia
      if (card.set_type === SetType.Memorabilia) {
        return false;
      }

      return true;
    });
  }

  /**
   * Filter to only main set cards (core and expansion sets).
   */
  filterMainSets(cards: Card[]): Card[] {
    const mainSetTypes = new Set([
      SetType.Core,
      SetType.Expansion,
      SetType.Masters,
      SetType.DraftInnovation,
    ]);

    return cards.filter((card) => mainSetTypes.has(card.set_type));
  }

  /**
   * Group cards by their primary type.
   */
  groupByType(cards: Card[]): Map<string, Card[]> {
    const groups = new Map<string, Card[]>();

    for (const card of cards) {
      const types = this.extractTypes(card.type_line);
      const primaryType = types[types.length - 1] || 'Other';

      if (!groups.has(primaryType)) {
        groups.set(primaryType, []);
      }
      groups.get(primaryType)!.push(card);
    }

    return groups;
  }

  /**
   * Parse a card list text input (newline-separated names).
   */
  parseCardList(input: string): string[] {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Remove quantity prefix like "1x " or "2 "
        const quantityMatch = line.match(/^\d+x?\s+(.+)$/i);
        if (quantityMatch) {
          return quantityMatch[1].trim();
        }
        return line;
      });
  }

  /**
   * Get unique card names from a list.
   */
  getUniqueNames(cards: Card[]): string[] {
    return [...new Set(cards.map((card) => card.name))];
  }

  /**
   * Count cards by a property.
   */
  countBy<K extends keyof Card>(cards: Card[], property: K): Map<Card[K], number> {
    const counts = new Map<Card[K], number>();

    for (const card of cards) {
      const value = card[property];
      counts.set(value, (counts.get(value) || 0) + 1);
    }

    return counts;
  }

  /**
   * Extract main types from a type line.
   */
  private extractTypes(typeLine: string): string[] {
    const mainTypes = [
      'Artifact',
      'Battle',
      'Conspiracy',
      'Creature',
      'Dungeon',
      'Enchantment',
      'Instant',
      'Land',
      'Phenomenon',
      'Plane',
      'Planeswalker',
      'Scheme',
      'Sorcery',
      'Tribal',
      'Vanguard',
    ];

    const typesPart = typeLine.split('—')[0].trim();
    return typesPart.split(/\s+/).filter((t) => mainTypes.includes(t));
  }
}
