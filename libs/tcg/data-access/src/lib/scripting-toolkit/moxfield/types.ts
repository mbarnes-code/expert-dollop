/**
 * Moxfield types for deck data.
 */

import { CardLayout, SetType } from '../types';

/**
 * Color values.
 */
export type MoxfieldColor = 'W' | 'U' | 'B' | 'R' | 'G';

/**
 * Legality status.
 */
export type MoxfieldLegality = 'not_legal' | 'legal';

/**
 * User information.
 */
export interface MoxfieldUser {
  userName: string;
  badges?: unknown[];
}

/**
 * Card in a deck.
 */
export interface MoxfieldCard {
  id: string;
  uniqueCardId: string;
  scryfall_id: string;
  set: string;
  set_name: string;
  name: string;
  set_type: SetType;
  cn: string;
  layout: CardLayout;
  cmc: number;
  type: string;
  type_line: string;
  oracle_text: string;
  mana_cost: string;
  power?: string;
  toughness?: string;
  loyalty: string;
  colors?: MoxfieldColor[];
  color_indicator?: MoxfieldColor[];
  color_identity?: MoxfieldColor[];
  legalities: {
    standard: MoxfieldLegality;
    future: MoxfieldLegality;
    historic: MoxfieldLegality;
    gladiator: MoxfieldLegality;
    pioneer: MoxfieldLegality;
    explorer: MoxfieldLegality;
    modern: MoxfieldLegality;
    legacy: MoxfieldLegality;
    pauper: MoxfieldLegality;
    vintage: MoxfieldLegality;
    penny: MoxfieldLegality;
    commander: MoxfieldLegality;
    oathbreaker: MoxfieldLegality;
    brawl: MoxfieldLegality;
    historicbrawl: MoxfieldLegality;
    alchemy: MoxfieldLegality;
    paupercommander: MoxfieldLegality;
    duel: MoxfieldLegality;
    oldschool: MoxfieldLegality;
    premodern: MoxfieldLegality;
    predh: MoxfieldLegality;
  };
  frame: string;
  reserved: boolean;
  digital: boolean;
  foil: boolean;
  nonfoil: boolean;
  etched: boolean;
  glossy: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | string;
  border_color: 'black' | string;
  colorshifted: boolean;
  flavor_text?: string;
  lang: string;
  latest: boolean;
  has_arena_legal: boolean;
  prices: {
    lastUpdatedAtUtc: string;
    usd?: number;
    usd_foil?: number;
    eur?: number;
    eur_foil?: number;
    tix?: number;
    ck?: number;
    ck_foil?: number;
    ck_buy?: number;
    ck_buy_foil?: number;
    ck_buy_qty?: number;
    ck_buy_foil_qty?: number;
    csi?: number;
    csi_foil?: number;
    csi_buy?: number;
    csi_buy_foil?: number;
    csi_buy_qty?: number;
    csi_buy_foil_qty?: number;
  };
  card_faces?: {
    id: string;
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    colors: MoxfieldColor[];
    color_indicator: MoxfieldColor[];
    power: string;
    toughness: string;
    loyalty: string;
  }[];
  artist: string;
  promo_types?: string[];
  isArenaLegal: boolean;
  reprint: boolean;
  released_at: string;
  has_multiple_editions: boolean;
  edhrec_rank?: number;
  multiverse_ids?: number[];
  cardHoarderUrl?: string;
  cardKingdomUrl?: string;
  cardKingdomFoilUrl?: string;
  cardMarketUrl?: string;
  tcgPlayerUrl?: string;
  cardmarket_id?: number;
  mtgo_id?: number;
  tcgplayer_id?: number;
  cardkingdom_id?: number;
  cardkingdom_foil_id?: number;
  coolStuffIncUrl?: string;
  coolStuffIncFoilUrl?: string;
  acorn: boolean;
  isToken: boolean;
  defaultFinish: 'nonFoil' | string;
}

/**
 * Board item in a deck.
 */
export interface MoxfieldBoardItem {
  quantity: number;
  boardType: string;
  finish: 'nonFoil' | 'foil';
  isFoil: boolean;
  isAlter: boolean;
  isProxy: boolean;
  card: MoxfieldCard;
  useCmcOverride: boolean;
  useManaCostOverride: boolean;
  useColorIdentityOverride: boolean;
  excludedFromColor?: boolean;
}

/**
 * Board in a deck.
 */
export interface MoxfieldBoard {
  count: number;
  cards: Record<string, MoxfieldBoardItem>;
}

/**
 * Complete Moxfield deck representation.
 */
export interface MoxfieldDeck {
  id: string;
  name: string;
  description: string;
  format: string;
  visibility: 'unlisted' | string;
  publicUrl: string;
  publicId: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  areCommentsEnabled: boolean;
  isShared: boolean;
  authorsCanEdit: boolean;
  createdByUser: MoxfieldUser;
  authors?: MoxfieldUser[];
  requestedAuthors?: unknown[];
  main: MoxfieldCard;
  boards: {
    mainboard: MoxfieldBoard;
    sideboard: MoxfieldBoard;
    maybeboard: MoxfieldBoard;
    commanders: MoxfieldBoard;
    companions: MoxfieldBoard;
    signatureSpells: MoxfieldBoard;
    attractions: MoxfieldBoard;
    stickers: MoxfieldBoard;
    contraptions: MoxfieldBoard;
    planes: MoxfieldBoard;
  };
  version: number;
  tokens?: MoxfieldCard[];
  hubs?: unknown[];
  createdAtUtc: string;
  lastUpdatedAtUtc: string;
  exportId: string;
  authorTags: Record<string, string[]>;
  isTooBeaucoup: boolean;
  affiliates: {
    ck: string;
    tcg: string;
    csi: string;
    ch: string;
    cm: string;
    scg: string;
    ct: string;
  };
  mainCardIdIsBackFace: boolean;
  allowPrimerClone: boolean;
  enableMultiplePrintings: boolean;
  includeBasicLandsInPrice: boolean;
  includeCommandersInPrice: boolean;
  includeSignatureSpellsInPrice: boolean;
  colors?: MoxfieldColor[];
  colorPercentages?: {
    white: number;
    blue: number;
    black: number;
    red: number;
    green: number;
  };
  colorIdentity?: MoxfieldColor[];
  colorIdentityPercentages?: {
    white: number;
    blue: number;
    black: number;
    red: number;
    green: number;
  };
  media?: unknown[];
}
