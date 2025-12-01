/**
 * Card Utilities Service for MTG card data analysis.
 * Implements the strangler fig pattern to gradually ingest functionality
 * from mtg-scripting-toolkit into the modular monolith.
 * 
 * Follows DDD patterns with class abstraction for reusability.
 */

import {
  Card,
  CardFace,
  CardLayout,
  CardTypes,
  Color,
  ColorGroup,
  Format,
  Legality,
} from './types';

/**
 * Abstract base class for card utility operations.
 * Provides common functionality for working with MTG card data.
 */
export abstract class BaseCardUtility {
  /**
   * Parse a numeric value from a string, handling special cases like "*".
   */
  protected parseNumber(value: string | null | undefined): number {
    if (value == null) {
      return 0;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}

/**
 * Card property extraction and analysis utilities.
 * Provides methods for accessing and computing card properties.
 */
export class CardPropertyService extends BaseCardUtility {
  private static instance: CardPropertyService | null = null;

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardPropertyService {
    if (!CardPropertyService.instance) {
      CardPropertyService.instance = new CardPropertyService();
    }
    return CardPropertyService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardPropertyService.instance = null;
  }

  /**
   * Get all names for a card, including face names for multi-faced cards.
   */
  getNames(card: Card): string[] {
    if (card.card_faces != null) {
      return card.card_faces.map((face: CardFace) => face.name);
    }
    return [card.name];
  }

  /**
   * Check if a card has a specific name (case insensitive).
   */
  isNamed(card: Card, name: string): boolean {
    const names = [
      card.name.toLowerCase(),
      ...(card.card_faces?.map((face: CardFace) => face.name.toLowerCase()) ?? []),
    ];
    return names.includes(name.toLowerCase());
  }

  /**
   * Get the power of a card (front face for multi-faced cards).
   */
  getPower(card: Card): number {
    if (card.power != null) {
      return this.parseNumber(card.power);
    }
    if (card.card_faces != null) {
      return this.parseNumber(card.card_faces[0]?.power);
    }
    return 0;
  }

  /**
   * Get the toughness of a card (front face for multi-faced cards).
   */
  getToughness(card: Card): number {
    if (card.toughness != null) {
      return this.parseNumber(card.toughness);
    }
    if (card.card_faces != null) {
      return this.parseNumber(card.card_faces[0]?.toughness);
    }
    return 0;
  }

  /**
   * Get total power across all faces of a card.
   */
  getTotalPower(card: Card): number {
    if (card.power != null) {
      return this.parseNumber(card.power);
    }
    if (card.card_faces != null) {
      return card.card_faces.reduce(
        (sum: number, face: CardFace) => sum + this.parseNumber(face.power),
        0
      );
    }
    return 0;
  }

  /**
   * Get total toughness across all faces of a card.
   */
  getTotalToughness(card: Card): number {
    if (card.toughness != null) {
      return this.parseNumber(card.toughness);
    }
    if (card.card_faces != null) {
      return card.card_faces.reduce(
        (sum: number, face: CardFace) => sum + this.parseNumber(face.toughness),
        0
      );
    }
    return 0;
  }

  /**
   * Get complete oracle text for a card.
   * Joins text from multi-faced cards with '//' separator.
   */
  getText(card: Card): string {
    if (card.oracle_text != null) {
      return card.oracle_text;
    }
    if (card.card_faces != null) {
      return card.card_faces.map((face: CardFace) => face.oracle_text).join('\n//\n');
    }
    return '';
  }

  /**
   * Check if card text includes a string (case insensitive).
   */
  textIncludes(card: Card, value: string): boolean {
    return this.getText(card).toLowerCase().includes(value.toLowerCase());
  }

  /**
   * Check if card type line includes a string (case insensitive).
   */
  typeIncludes(card: Card, value: string): boolean {
    return card.type_line.toLowerCase().includes(value.toLowerCase());
  }

  /**
   * Count words in the card's oracle text.
   */
  getTextWordCount(card: Card): number {
    const text = this.getText(card);
    return this.countWords(text);
  }

  /**
   * Count words in a string.
   */
  private countWords(text: string): number {
    if (!text || text.trim() === '') {
      return 0;
    }
    return text.trim().split(/\s+/).length;
  }

  /**
   * Count words in the card's flavor text.
   */
  getFlavorTextWordCount(card: Card): number {
    if (card.card_faces != null) {
      return card.card_faces.reduce(
        (sum: number, face: CardFace) =>
          sum + (face.flavor_text ? this.countWords(face.flavor_text) : 0),
        0
      );
    }
    return card.flavor_text ? this.countWords(card.flavor_text) : 0;
  }
}

/**
 * Card color analysis and grouping utilities.
 */
export class CardColorService extends BaseCardUtility {
  private static instance: CardColorService | null = null;

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardColorService {
    if (!CardColorService.instance) {
      CardColorService.instance = new CardColorService();
    }
    return CardColorService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardColorService.instance = null;
  }

  /**
   * Get the colors of a card (from mana cost, not color identity).
   */
  getColors(card: Card): Color[] {
    if (card.colors != null && card.colors.length > 0) {
      return card.colors;
    }
    if (card.card_faces != null && card.card_faces.length > 0) {
      const faceColors = card.card_faces[0]?.colors;
      if (faceColors != null) {
        return faceColors;
      }
    }
    return [];
  }

  /**
   * Determine the color group for a card.
   * Groups cards into mono-colors, multicolor, colorless, or land.
   */
  getColorGroup(card: Card): ColorGroup {
    const typeLine =
      card.layout === CardLayout.Transform
        ? card.card_faces![0].type_line
        : card.type_line;
    const cardColors = this.getColors(card);

    if (/\bLand\b/.test(typeLine)) {
      return ColorGroup.Land;
    }
    if (cardColors.length > 1) {
      return ColorGroup.Multicolor;
    }
    if (cardColors.length === 0) {
      return ColorGroup.Colorless;
    }

    return cardColors[0] as unknown as ColorGroup;
  }

  /**
   * Check if a card has a specific color in its identity.
   */
  hasColor(card: Card, color: Color): boolean {
    return card.color_identity.includes(color);
  }

  /**
   * Check if a card is colorless (no colors in identity).
   */
  isColorless(card: Card): boolean {
    return card.color_identity.length === 0;
  }

  /**
   * Check if a card is multicolored (2+ colors).
   */
  isMulticolored(card: Card): boolean {
    return this.getColors(card).length > 1;
  }

  /**
   * Normalize color identity to a consistent string representation.
   */
  normalizeColorIdentity(colors: Color[]): string {
    const colorOrder = [Color.White, Color.Blue, Color.Black, Color.Red, Color.Green];
    return colors
      .slice()
      .sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b))
      .join('');
  }
}

/**
 * Card type parsing and classification utilities.
 */
export class CardTypeService extends BaseCardUtility {
  private static instance: CardTypeService | null = null;

  private readonly supertypesList = [
    'Basic',
    'Legendary',
    'Ongoing',
    'Snow',
    'World',
    'Host',
  ];

  private readonly mainTypesList = [
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

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardTypeService {
    if (!CardTypeService.instance) {
      CardTypeService.instance = new CardTypeService();
    }
    return CardTypeService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardTypeService.instance = null;
  }

  /**
   * Parse the type line into supertypes, types, and subtypes.
   */
  parseTypes(card: Card): CardTypes {
    const typeLine = card.type_line;
    const [typesPart, subtypesPart] = typeLine.split('—').map((s) => s.trim());

    const allTypes = typesPart.split(/\s+/);
    const supertypes: string[] = [];
    const types: string[] = [];

    for (const type of allTypes) {
      if (this.supertypesList.includes(type)) {
        supertypes.push(type);
      } else if (this.mainTypesList.includes(type)) {
        types.push(type);
      }
    }

    const subtypes = subtypesPart ? subtypesPart.split(/\s+/) : [];

    return {
      typeLine,
      supertypes,
      types,
      subtypes,
    };
  }

  /**
   * Check if a card is a creature.
   */
  isCreature(card: Card): boolean {
    return this.parseTypes(card).types.includes('Creature');
  }

  /**
   * Check if a card is an instant or sorcery.
   */
  isSpell(card: Card): boolean {
    const types = this.parseTypes(card).types;
    return types.includes('Instant') || types.includes('Sorcery');
  }

  /**
   * Check if a card is a land.
   */
  isLand(card: Card): boolean {
    return this.parseTypes(card).types.includes('Land');
  }

  /**
   * Check if a card is legendary.
   */
  isLegendary(card: Card): boolean {
    return this.parseTypes(card).supertypes.includes('Legendary');
  }

  /**
   * Check if a card is an artifact.
   */
  isArtifact(card: Card): boolean {
    return this.parseTypes(card).types.includes('Artifact');
  }

  /**
   * Check if a card is an enchantment.
   */
  isEnchantment(card: Card): boolean {
    return this.parseTypes(card).types.includes('Enchantment');
  }

  /**
   * Check if a card is a planeswalker.
   */
  isPlaneswalker(card: Card): boolean {
    return this.parseTypes(card).types.includes('Planeswalker');
  }

  /**
   * Check if a card has a specific subtype.
   */
  hasSubtype(card: Card, subtype: string): boolean {
    return this.parseTypes(card).subtypes.includes(subtype);
  }
}

/**
 * Card legality checking utilities.
 */
export class CardLegalityService extends BaseCardUtility {
  private static instance: CardLegalityService | null = null;

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CardLegalityService {
    if (!CardLegalityService.instance) {
      CardLegalityService.instance = new CardLegalityService();
    }
    return CardLegalityService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CardLegalityService.instance = null;
  }

  /**
   * Check if a card is legal in a specific format.
   */
  isLegalIn(card: Card, format: Format): boolean {
    return card.legalities[format] === 'legal';
  }

  /**
   * Check if a card is banned in a specific format.
   */
  isBannedIn(card: Card, format: Format): boolean {
    return card.legalities[format] === 'banned';
  }

  /**
   * Check if a card is restricted in a specific format.
   */
  isRestrictedIn(card: Card, format: Format): boolean {
    return card.legalities[format] === 'restricted';
  }

  /**
   * Get the legality status for a specific format.
   */
  getLegality(card: Card, format: Format): Legality {
    return card.legalities[format];
  }

  /**
   * Get all formats where the card is legal.
   */
  getLegalFormats(card: Card): Format[] {
    return Object.entries(card.legalities)
      .filter(([, legality]) => legality === 'legal')
      .map(([format]) => format as Format);
  }

  /**
   * Compute collective legality for a group of cards.
   * Returns the most restrictive legality across all cards.
   */
  collectiveLegality(cards: Card[], format: Format): Legality {
    const legalities = cards.map((card) => card.legalities[format]);

    if (legalities.includes('banned')) {
      return 'banned';
    }
    if (legalities.includes('not_legal')) {
      return 'not_legal';
    }
    if (legalities.includes('restricted')) {
      return 'restricted';
    }
    return 'legal';
  }
}
