/**
 * Scryfall service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/scryfall.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG Scryfall service
export {
  SpellbookScryfallService,
  BaseSpellbookScryfallService,
  getScryfallImage,
  ScryfallService as default,
  type ScryfallResultsPage,
  type ApiConfigurationFactory,
} from '@expert-dollop/tcg/data-access';
