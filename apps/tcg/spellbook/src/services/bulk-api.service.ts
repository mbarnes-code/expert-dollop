/**
 * Bulk API service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/bulk-api.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG Bulk API service
export {
  BulkApiServiceImpl,
  BaseBulkApiService,
  BulkApiService as default,
} from '@expert-dollop/tcg/data-access';
