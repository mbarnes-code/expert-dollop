/**
 * Commander Spellbook types for combo data.
 */

import { Card, Format } from '../types';

/**
 * Combo representation from Commander Spellbook.
 */
export interface Combo {
  /** Full Scryfall card objects for each card in the combo */
  cards: Card[];
  /** Format legality status */
  legalities: Record<Format, 'legal' | 'not_legal'>;
  /** Card names in the combo */
  cardNames: string[];
  /** Combined color identity */
  colorIdentity?: string;
  /** Setup requirements */
  prerequisites?: string;
  /** Step-by-step instructions */
  steps?: string;
  /** Combo outcomes */
  results?: string[];
  /** Variant IDs for related combos */
  variantIDs?: string;
}
