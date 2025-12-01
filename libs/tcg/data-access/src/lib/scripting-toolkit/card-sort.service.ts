/**
 * Card Sorting Service for MTG card ordering.
 * Implements Magic: The Gathering's traditional color ordering system.
 * 
 * This follows the strangler fig pattern to gradually ingest functionality
 * from mtg-scripting-toolkit into the modular monolith.
 */

import { Card, CardFace, Color, ColorGroup } from './types';
import { CardColorService, CardTypeService } from './card-utilities.service';

/**
 * Type order for sorting cards within a color group.
 * Follows traditional MTG ordering: Creature, Instant, Sorcery, etc.
 */
const TYPE_ORDER: Record<string, number> = {
  Creature: 0,
  Instant: 1,
  Sorcery: 2,
  Artifact: 3,
  Enchantment: 4,
  Planeswalker: 5,
  Battle: 6,
  Land: 7,
};

/**
 * Color group order for sorting: WUBRG, then multicolor, colorless, land.
 */
const COLOR_GROUP_ORDER: Record<string, number> = {
  W: 0,
  U: 1,
  B: 2,
  R: 3,
  G: 4,
  Multicolor: 5,
  Colorless: 6,
  Land: 7,
};

/**
 * Color identity order for multicolor and land cards.
 * Two-color pairs, three-color combos, four-color, and five-color.
 */
const COLOR_IDENTITY_ORDER: Record<string, number> = {
  // Mono colors
  W: 0,
  U: 1,
  B: 2,
  R: 3,
  G: 4,
  // Allied pairs
  WU: 5,
  UB: 6,
  BR: 7,
  RG: 8,
  GW: 9,
  // Enemy pairs
  WB: 10,
  UR: 11,
  BG: 12,
  RW: 13,
  GU: 14,
  // Shards
  WUB: 15,
  UBR: 16,
  BRG: 17,
  RGW: 18,
  GWU: 19,
  // Wedges
  WBG: 20,
  URW: 21,
  BGU: 22,
  RWB: 23,
  GUR: 24,
  // Four color
  WUBR: 25,
  UBRG: 26,
  BRGW: 27,
  RGWU: 28,
  GWUB: 29,
  // Five color
  WUBRG: 30,
  // Colorless
  '': 31,
};

/**
 * Configuration for card sorting.
 */
export interface CardSortConfig {
  /** Sort by color group first */
  byColorGroup?: boolean;
  /** Sort by card type within color group */
  byType?: boolean;
  /** Sort by mana value (CMC) */
  byManaValue?: boolean;
  /** Sort alphabetically by name as final tiebreaker */
  byName?: boolean;
}

/**
 * Default sorting configuration.
 */
const DEFAULT_SORT_CONFIG: CardSortConfig = {
  byColorGroup: true,
  byType: true,
  byManaValue: true,
  byName: true,
};

/**
 * Card sorting service implementing traditional MTG sorting patterns.
 * 
 * Cards are ordered by their "color group" (monocolors, multicolors, colorless,
 * lands), then by type, and then mana value. This follows the traditional
 * WUBRG color ordering that is fundamental to Magic's design.
 */
export class CardSortService {
  private static instance: CardSortService | null = null;
  private readonly colorService: CardColorService;
  private readonly typeService: CardTypeService;

  constructor() {
    this.colorService = CardColorService.getInstance();
    this.typeService = CardTypeService.getInstance();
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardSortService {
    if (!CardSortService.instance) {
      CardSortService.instance = new CardSortService();
    }
    return CardSortService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardSortService.instance = null;
  }

  /**
   * Sort cards in traditional Magic order.
   * 
   * Cards are ordered by:
   * 1. Color group (WUBRG, multicolor, colorless, land)
   * 2. Card type (Creature, Instant, Sorcery, etc.)
   * 3. Color identity (for multicolor and lands)
   * 4. Mana value (CMC)
   * 5. Mana devotion (tie-breaker)
   * 6. Name (alphabetical)
   */
  magicSort(cards: Card[], config: CardSortConfig = DEFAULT_SORT_CONFIG): Card[] {
    const cardsWithMeta = cards.map((card) => this.computeSortMetadata(card));

    const sortKeys: (keyof typeof cardsWithMeta[0])[] = [];
    if (config.byColorGroup) {
      sortKeys.push('colorGroupIndex');
    }
    if (config.byType) {
      sortKeys.push('cardTypeIndex');
    }
    sortKeys.push('colorIdentityIndex');
    if (config.byManaValue) {
      sortKeys.push('manaValue');
    }
    sortKeys.push('devotion');
    if (config.byName) {
      sortKeys.push('name');
    }

    return cardsWithMeta
      .sort((a, b) => {
        for (const key of sortKeys) {
          const aVal = a[key];
          const bVal = b[key];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const comparison = aVal.localeCompare(bVal);
            if (comparison !== 0) return comparison;
          } else if (typeof aVal === 'number' && typeof bVal === 'number') {
            if (aVal !== bVal) return aVal - bVal;
          }
        }
        return 0;
      })
      .map((c) => c.card);
  }

  /**
   * Sort cards by name only.
   */
  sortByName(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sort cards by mana value (CMC).
   */
  sortByManaValue(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => a.cmc - b.cmc);
  }

  /**
   * Sort cards by color identity.
   */
  sortByColorIdentity(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => {
      const aIdentity = this.normalizeColorIdentity(a.color_identity);
      const bIdentity = this.normalizeColorIdentity(b.color_identity);
      const aOrder = COLOR_IDENTITY_ORDER[aIdentity] ?? 99;
      const bOrder = COLOR_IDENTITY_ORDER[bIdentity] ?? 99;
      return aOrder - bOrder;
    });
  }

  /**
   * Group cards by color group.
   */
  groupByColorGroup(cards: Card[]): Map<ColorGroup, Card[]> {
    const groups = new Map<ColorGroup, Card[]>();

    for (const card of cards) {
      const group = this.colorService.getColorGroup(card);
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(card);
    }

    return groups;
  }

  /**
   * Group cards by type.
   */
  groupByType(cards: Card[]): Map<string, Card[]> {
    const groups = new Map<string, Card[]>();

    for (const card of cards) {
      const types = this.typeService.parseTypes(card).types;
      const primaryType = this.getPrimaryType(types);

      if (!groups.has(primaryType)) {
        groups.set(primaryType, []);
      }
      groups.get(primaryType)!.push(card);
    }

    return groups;
  }

  /**
   * Compute sorting metadata for a card.
   */
  private computeSortMetadata(card: Card) {
    const colorGroup = this.colorService.getColorGroup(card);
    const colorGroupIndex = COLOR_GROUP_ORDER[colorGroup] ?? 99;

    const cardTypes = this.typeService.parseTypes(card).types;
    const primaryType = this.getPrimaryType(cardTypes);
    const cardTypeIndex = TYPE_ORDER[primaryType] ?? 99;

    const needsColorIdentitySort =
      colorGroup === ColorGroup.Multicolor || colorGroup === ColorGroup.Land;
    const colorIdentityIndex = needsColorIdentitySort
      ? COLOR_IDENTITY_ORDER[this.normalizeColorIdentity(card.color_identity)] ?? 99
      : 0;

    return {
      card,
      colorGroupIndex,
      cardTypeIndex,
      colorIdentityIndex,
      manaValue: card.cmc,
      devotion: card.mana_cost?.length ?? 0,
      name: card.name,
    };
  }

  /**
   * Get the primary type for sorting purposes.
   * Uses explicit priority: Creature > Planeswalker > Enchantment > Artifact > Instant > Sorcery > Land > Other
   */
  private getPrimaryType(types: string[]): string {
    const typePriority = [
      'Creature',
      'Planeswalker',
      'Enchantment',
      'Artifact',
      'Battle',
      'Instant',
      'Sorcery',
      'Land',
    ];

    for (const priority of typePriority) {
      if (types.includes(priority)) {
        return priority;
      }
    }

    return types[0] || 'Other';
  }

  /**
   * Normalize color identity to a consistent string.
   */
  private normalizeColorIdentity(colors: Color[]): string {
    const colorOrder = [Color.White, Color.Blue, Color.Black, Color.Red, Color.Green];
    return colors
      .slice()
      .sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b))
      .join('');
  }
}
