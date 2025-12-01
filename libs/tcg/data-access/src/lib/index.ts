// tcg-data-access library implementation
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

// MTG Scripting Toolkit (strangler fig integration)
export * from './scripting-toolkit';
