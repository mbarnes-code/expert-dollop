/**
 * Spellbook-specific types for the TCG data access layer.
 * These types are used across the Commander Spellbook application.
 */

import {
  CardInVariant,
  TemplateInVariant,
  VariantSuggestion,
  VariantUpdateSuggestion,
} from '@space-cow-media/spellbook-client';

/**
 * Represents the prerequisite zones and description for a combo.
 */
export interface ComboPrerequisites {
  /** Zone either H, B, C, G, L, E or multiple of them */
  zones: string[];
  /** Additional description of the prerequisite */
  description: string;
}

/**
 * Error type for combo submission errors.
 */
export type ComboSubmissionErrorType = {
  [key: string]: (ComboSubmissionErrorType | string)[];
} & { statusCode: number; detail?: string };

/**
 * Combo submission type with serialized date.
 */
export type ComboSubmission = Omit<VariantSuggestion, 'created'> & {
  created: string;
};

/**
 * Update submission type with serialized date.
 */
export type UpdateSubmission = Omit<VariantUpdateSuggestion, 'created'> & {
  created: string;
};

/**
 * Convert a VariantUpdateSuggestion to an UpdateSubmission.
 */
export function variantUpdateSuggestionToSubmission(variantSuggestion: VariantUpdateSuggestion): UpdateSubmission {
  return {
    ...variantSuggestion,
    created: variantSuggestion.created.toISOString(),
  };
}

/**
 * Convert an UpdateSubmission to a VariantUpdateSuggestion.
 */
export function variantUpdateSuggestionFromSubmission(comboSubmission: UpdateSubmission): VariantUpdateSuggestion {
  return {
    ...comboSubmission,
    created: new Date(comboSubmission.created),
  };
}

/**
 * Convert a VariantSuggestion to a ComboSubmission.
 */
export function variantSuggestionToSubmission(variantSuggestion: VariantSuggestion): ComboSubmission {
  return {
    ...variantSuggestion,
    created: variantSuggestion.created.toISOString(),
  };
}

/**
 * Convert a ComboSubmission to a VariantSuggestion.
 */
export function variantSuggestionFromSubmission(comboSubmission: ComboSubmission): VariantSuggestion {
  return {
    ...comboSubmission,
    created: new Date(comboSubmission.created),
  };
}

/**
 * Get the name of a card or template.
 */
export function getName(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.name : card.template.name;
}

/**
 * Get the name of a card or template before any comma.
 * Useful for split cards and other multi-part card names.
 */
export function getNameBeforeComma(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.name.split(', ')[0] : card.template.name;
}

/**
 * Get the type line of a card.
 */
export function getTypes(card: CardInVariant | TemplateInVariant): string {
  return 'card' in card ? card.card.typeLine : '';
}

/**
 * Legality format option.
 */
export interface LegalityFormat {
  value: string;
  label: string;
}

/**
 * Available legality formats for filtering combos.
 */
export const LEGALITY_FORMATS: LegalityFormat[] = [
  { value: '', label: '-' },
  { value: 'commander', label: 'EDH/Commander' },
  { value: 'pauper_commander', label: 'Pauper EDH/Commander (including uncommon commanders)' },
  { value: 'pauper_commander_main', label: 'Pauper EDH/Commander (excluding uncommon commanders)' },
  { value: 'oathbreaker', label: 'Oathbreaker' },
  { value: 'predh', label: 'Pre-EDH/Commander' },
  { value: 'brawl', label: 'Brawl' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'legacy', label: 'Legacy' },
  { value: 'premodern', label: 'Premodern' },
  { value: 'modern', label: 'Modern' },
  { value: 'pioneer', label: 'Pioneer' },
  { value: 'standard', label: 'Standard' },
  { value: 'pauper', label: 'Pauper' },
];
