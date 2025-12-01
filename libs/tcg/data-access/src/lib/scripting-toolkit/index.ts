/**
 * MTG Scripting Toolkit - Data Access Layer
 * 
 * This module implements the strangler fig pattern to gradually ingest
 * functionality from the mtg-scripting-toolkit into the modular monolith.
 * 
 * Provides domain types and services for working with Magic: The Gathering
 * card data following DDD best practices.
 * 
 * @example
 * ```typescript
 * import {
 *   CardPropertyService,
 *   CardSortService,
 *   CardColorService,
 *   Card,
 *   ColorGroup,
 * } from '@expert-dollop/tcg/data-access';
 * 
 * // Get card properties
 * const propertyService = CardPropertyService.getInstance();
 * const cardText = propertyService.getText(card);
 * 
 * // Sort cards in traditional Magic order
 * const sortService = CardSortService.getInstance();
 * const sortedCards = sortService.magicSort(cards);
 * 
 * // Get card color group
 * const colorService = CardColorService.getInstance();
 * const group = colorService.getColorGroup(card);
 * ```
 */

// Types
export {
  CardLayout,
  SetType,
  Color,
  Rarity,
  Format,
  formats,
  type Legality,
  FrameEffect,
  ImageType,
  imageTypes,
  type CardID,
  type CardFace,
  type Card,
  type CardList,
  type CardSet,
  ColorGroup,
  type CardTypes,
  type CardListComparison,
  type SpellCheckResult,
} from './types';

// Card Utility Services
export {
  BaseCardUtility,
  CardPropertyService,
  CardColorService,
  CardTypeService,
  CardLegalityService,
} from './card-utilities.service';

// Card Sorting Service
export {
  CardSortService,
  type CardSortConfig,
} from './card-sort.service';

// Card List Service
export {
  CardListService,
} from './card-list.service';
