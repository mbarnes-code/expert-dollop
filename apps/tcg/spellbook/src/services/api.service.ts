/**
 * API configuration service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/api.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG API configuration service
export {
  apiConfiguration,
  SpellbookApiConfigurationService,
  BaseApiConfigurationService,
  type SpellbookApiConfigOptions,
} from '@expert-dollop/tcg/data-access';
