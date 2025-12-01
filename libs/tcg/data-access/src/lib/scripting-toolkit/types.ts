/**
 * Domain types for MTG card data following DDD patterns.
 * Adapted from the mtg-scripting-toolkit for use in the modular monolith.
 * 
 * These types represent the core domain model for Magic: The Gathering cards
 * and provide a stable interface for card data operations.
 */

/**
 * Card Layouts as defined by Scryfall API.
 * @see https://scryfall.com/docs/api/layouts
 */
export enum CardLayout {
  Normal = 'normal',
  Split = 'split',
  Flip = 'flip',
  Transform = 'transform',
  ModalDfc = 'modal_dfc',
  Meld = 'meld',
  Leveler = 'leveler',
  Class = 'class',
  Saga = 'saga',
  Adventure = 'adventure',
  Battle = 'battle',
  Planar = 'planar',
  Scheme = 'scheme',
  Vanguard = 'vanguard',
  Token = 'token',
  DoubleFacedToken = 'double_faced_token',
  Emblem = 'emblem',
  Augment = 'augment',
  Host = 'host',
  ArtSeries = 'art_series',
  ReversibleCard = 'reversible_card',
}

/**
 * Set Types as defined by Scryfall API.
 * @see https://scryfall.com/docs/api/sets#set-types
 */
export enum SetType {
  Core = 'core',
  Expansion = 'expansion',
  Masters = 'masters',
  Alchemy = 'alchemy',
  Masterpiece = 'masterpiece',
  Arsenal = 'arsenal',
  FromTheVault = 'from_the_vault',
  Spellbook = 'spellbook',
  PremiumDeck = 'premium_deck',
  DuelDeck = 'duel_deck',
  DraftInnovation = 'draft_innovation',
  TreasureChest = 'treasure_chest',
  Commander = 'commander',
  Planechase = 'planechase',
  Archenemy = 'archenemy',
  Vanguard = 'vanguard',
  Funny = 'funny',
  Starter = 'starter',
  Box = 'box',
  Promo = 'promo',
  Token = 'token',
  Memorabilia = 'memorabilia',
  Minigame = 'minigame',
}

/**
 * Magic colors in WUBRG order.
 */
export enum Color {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
}

/**
 * Card rarity levels.
 */
export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Mythic = 'mythic',
  Special = 'special',
  Bonus = 'bonus',
}

/**
 * Magic format identifiers.
 */
export enum Format {
  Standard = 'standard',
  Future = 'future',
  Historic = 'historic',
  Gladiator = 'gladiator',
  Pioneer = 'pioneer',
  Explorer = 'explorer',
  Modern = 'modern',
  Legacy = 'legacy',
  Pauper = 'pauper',
  Vintage = 'vintage',
  Penny = 'penny',
  Commander = 'commander',
  Oathbreaker = 'oathbreaker',
  Brawl = 'brawl',
  HistoricBrawl = 'historicbrawl',
  Alchemy = 'alchemy',
  PauperCommander = 'paupercommander',
  Duel = 'duel',
  Oldschool = 'oldschool',
  Premodern = 'premodern',
  PrEDH = 'predh',
}

/**
 * Array of all format values for iteration.
 */
export const formats = Object.values(Format);

/**
 * Card legality status in a format.
 */
export type Legality = 'legal' | 'not_legal' | 'restricted' | 'banned';

/**
 * Frame effects that can appear on cards.
 */
export enum FrameEffect {
  Legendary = 'legendary',
  Miracle = 'miracle',
  Nyxtouched = 'nyxtouched',
  Draft = 'draft',
  Devoid = 'devoid',
  Tombstone = 'tombstone',
  Colorshifted = 'colorshifted',
  Inverted = 'inverted',
  Sunmoondfc = 'sunmoondfc',
  Compasslanddfc = 'compasslanddfc',
  Originpwdfc = 'originpwdfc',
  Mooneldrazidfc = 'mooneldrazidfc',
  Waxingandwaningmoondfc = 'waxingandwaningmoondfc',
  Showcase = 'showcase',
  Extendedart = 'extendedart',
  Companion = 'companion',
  Etched = 'etched',
  Snow = 'snow',
  Lesson = 'lesson',
  Shatteredglass = 'shatteredglass',
  Convertdfc = 'convertdfc',
  Fandfc = 'fandfc',
  Upsidedowndfc = 'upsidedowndfc',
}

/**
 * Image type sizes available from Scryfall.
 */
export enum ImageType {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
  PNG = 'png',
  ArtCrop = 'art_crop',
  BorderCrop = 'border_crop',
}

/**
 * Array of all image type values for iteration.
 */
export const imageTypes = Object.values(ImageType);

/**
 * Attributes and combinations to uniquely identify a card.
 * Used in Scryfall's 'fetch collection' endpoint.
 */
export type CardID =
  | string
  | { id: string }
  | { mtgo_id: string }
  | { multiverse_id: string }
  | { oracle_id: string }
  | { illustration_id: string }
  | { name: string }
  | { name: string; set: string }
  | { set: string; collector_number: string };

/**
 * Card face representation for multi-faced cards.
 */
export interface CardFace {
  object: 'card_face';
  name: string;
  flavor_name?: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  colors: Color[];
  color_indicator?: Color[];
  power?: string;
  toughness?: string;
  defense?: number;
  loyalty?: string;
  artist: string;
  artist_id: string;
  illustration_id: string;
  image_uris: Record<string, string>;
  flavor_text?: string;
}

/**
 * Complete card representation following Scryfall's API schema.
 * @see https://scryfall.com/docs/api/cards
 */
export interface Card {
  object: 'card';
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  mtgo_id: number;
  mtgo_foil_id?: number;
  tcgplayer_id: number;
  cardmarket_id: number;
  name: string;
  flavor_name?: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: CardLayout;
  highres_image: boolean;
  image_status: 'missing' | 'placeholder' | 'lowres' | 'highres_scan';
  image_uris: Record<ImageType, string>;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: Color[];
  color_indicator?: Color[];
  color_identity: Color[];
  keywords: string[];
  all_parts?: {
    object: 'related_card' | string;
    id: string;
    component: 'combo_piece' | string;
    name: string;
    type_line: string;
    uri: string;
  }[];
  legalities: Record<Format, Legality>;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: ('nonfoil' | 'foil' | string)[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: SetType;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: Rarity;
  flavor_text?: string;
  card_back_id: string;
  card_faces?: CardFace[];
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: 'black' | 'white' | 'borderless' | 'silver' | 'gold';
  frame: '1993' | '1997' | '2003' | '2015' | 'future';
  frame_effects?: FrameEffect[];
  security_stamp: 'oval' | 'triangle' | 'acorn' | 'arena' | 'heart';
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  promo_types?: string[];
  edhrec_rank: number;
  penny_rank?: number;
  preview?: {
    source: string;
    source_uri: string;
    previewed_at: string;
  };
  prices: Record<string, string | null>;
  related_uris: Record<string, string>;
  purchase_uris: Record<string, string>;
}

/**
 * List response from Scryfall API.
 */
export interface CardList {
  object: 'list';
  not_found?: CardID[];
  total_cards?: number;
  has_more?: boolean;
  next_page?: string;
  data: Card[];
}

/**
 * Set representation from Scryfall API.
 * @see https://scryfall.com/docs/api/sets
 */
export interface CardSet {
  object: 'set';
  id: string;
  code: string;
  mtgo_code?: string;
  arena_code?: string;
  tcgplayer_id?: number;
  name: string;
  uri: string;
  scryfall_uri: string;
  search_uri: string;
  released_at: string;
  set_type: SetType;
  card_count: number;
  parent_set_code?: string;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  icon_svg_uri: string;
}

/**
 * Color group for organizing cards by color identity.
 */
export enum ColorGroup {
  White = 'W',
  Blue = 'U',
  Black = 'B',
  Red = 'R',
  Green = 'G',
  Multicolor = 'Multicolor',
  Colorless = 'Colorless',
  Land = 'Land',
}

/**
 * Card type classification result.
 */
export interface CardTypes {
  /** Full type line including supertypes, types, and subtypes */
  typeLine: string;
  /** Supertypes like "Legendary", "Basic", "Snow" */
  supertypes: string[];
  /** Main types like "Creature", "Artifact", "Enchantment" */
  types: string[];
  /** Subtypes like "Human", "Wizard", "Equipment" */
  subtypes: string[];
}

/**
 * Result of comparing two card lists.
 */
export interface CardListComparison {
  /** Cards that appear in both lists */
  shared: string[];
  /** Cards only in the first list */
  uniqueToFirst: string[];
  /** Cards only in the second list */
  uniqueToSecond: string[];
}

/**
 * Spell check result for a card name.
 */
export interface SpellCheckResult {
  /** The original input name */
  input: string;
  /** Whether the name was found exactly */
  valid: boolean;
  /** Suggested correction if name was not found */
  suggestion?: string;
  /** Confidence score for the suggestion (0-1) */
  confidence?: number;
}
