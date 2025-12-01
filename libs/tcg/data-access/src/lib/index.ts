/**
 * TCG Data Access Library
 * 
 * This library provides data access services and types for the TCG domain
 * following DDD best practices.
 */

export const tcg_data_access_VERSION = '0.0.1';

// Base classes
export { BaseApiService } from './base-api.service';

// Spellbook services
export {
  SpellbookApiService,
  type SpellbookApiConfig,
  type SpellbookCombo,
  type SpellbookCard,
  type SpellbookSearchParams,
  type SpellbookSearchResult,
} from './spellbook-api.service';

// Spellbook types
export {
  type ComboPrerequisites,
  type ComboSubmissionErrorType,
  type ComboSubmission,
  type UpdateSubmission,
  type LegalityFormat,
  LEGALITY_FORMATS,
  variantUpdateSuggestionToSubmission,
  variantUpdateSuggestionFromSubmission,
  variantSuggestionToSubmission,
  variantSuggestionFromSubmission,
  getName,
  getNameBeforeComma,
  getTypes,
} from './spellbook-types';

// Spellbook constants
export {
  DEFAULT_ORDER,
  DEFAULT_SORT,
  DEFAULT_VENDOR,
  DEFAULT_ORDERING,
} from './spellbook-constants';

// Prerequisites processor
export {
  getPrerequisiteList,
  countPrerequisites,
} from './prerequisites-processor';

// Color autocomplete
export {
  colorAutocomplete,
  default as colorAutocompleteData,
  type ColorAutocompleteOption,
} from './color-autocomplete';

// EDHREC service
export {
  EdhrecService,
  BaseEdhrecService,
  default as EDHRECService,
} from './edhrec.service';

// Bulk API service
export {
  BulkApiServiceImpl,
  BaseBulkApiService,
  default as BulkApiService,
} from './bulk-api.service';

// Combos export service
export {
  CombosExportServiceImpl,
  BaseCombosExportService,
  default as CombosExportService,
} from './combos-export.service';

// Spellbook Scryfall service
export {
  SpellbookScryfallService,
  BaseSpellbookScryfallService,
  getScryfallImage,
  default as ScryfallService,
  type ScryfallResultsPage,
  type ApiConfigurationFactory,
} from './spellbook-scryfall.service';

// Token service
export {
  SpellbookTokenService,
  BaseTokenService,
  timeInSecondsToEpoch,
  default as TokenService,
  type DecodedJWTType,
} from './token.service';

// API configuration service
export {
  SpellbookApiConfigurationService,
  BaseApiConfigurationService,
  apiConfiguration,
  type SpellbookApiConfigOptions,
} from './api-configuration.service';

// MTG Scripting Toolkit (strangler fig integration)
export * from './scripting-toolkit';
