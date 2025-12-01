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
 *   ScryfallApiService,
 *   CubeCobraService,
 *   MoxfieldService,
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
 * 
 * // Search Scryfall
 * const scryfallService = ScryfallApiService.getInstance();
 * const cards = await scryfallService.search('type:creature cmc:3');
 * 
 * // Fetch cube from Cube Cobra
 * const cubeService = CubeCobraService.getInstance();
 * const cubeList = await cubeService.fetchCubeList('myCubeId');
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

// Scryfall Services
export {
  ScryfallApiService,
  SCRYFALL_CONFIG,
  type BulkDataType,
  type SortOrder,
  type SortDirection,
  type RollupMode,
  type SearchOptions,
  type FetchCardOptions,
  type CollectionResult,
  type CardArtInfo,
  ScryfallCatalogService,
  type CatalogType,
} from './scryfall';

// Cube Cobra Services
export {
  CubeCobraService,
  CUBE_COBRA_CONFIG,
  type CubeCobraColor,
  type CubeCobraRarity,
  type CubeCobraCard,
  type CubeCobraCardDetails,
  type CubeCobraUser,
  type CubeCobraCube,
} from './cube-cobra';

// Moxfield Services
export {
  MoxfieldService,
  MOXFIELD_CONFIG,
  type MoxfieldColor,
  type MoxfieldLegality,
  type MoxfieldUser,
  type MoxfieldCard,
  type MoxfieldBoardItem,
  type MoxfieldBoard,
  type MoxfieldDeck,
} from './moxfield';

// Commander Spellbook Services
export {
  CommanderSpellbookService,
  COMMANDER_SPELLBOOK_CONFIG,
  type Combo,
} from './commander-spellbook';

// Utility Services
export {
  CacheService,
  type CacheConfig,
  LogColor,
  applyColor,
  log,
  wordCount,
  isPresentString,
  regexEscape,
  average,
  median,
  standardDeviation,
  toObjectKeyedOn,
  eachAsync,
  toggle,
  permutations,
  splitSeries,
} from './utils';
