/**
 * EDHREC service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/edhrec.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG EDHREC service
export {
  EdhrecService,
  BaseEdhrecService,
  EDHRECService as default,
} from '@expert-dollop/tcg/data-access';
