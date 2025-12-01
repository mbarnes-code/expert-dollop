/**
 * Token service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/token.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG token service
export {
  timeInSecondsToEpoch,
  SpellbookTokenService,
  BaseTokenService,
  TokenService as default,
  type DecodedJWTType,
} from '@expert-dollop/tcg/data-access';
