/**
 * Combos export service re-export from TCG data access library.
 * This file provides backward compatibility for imports from services/combos-export.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/tcg/data-access.
 */

// Re-export everything from the TCG Combos Export service
export {
  CombosExportServiceImpl,
  BaseCombosExportService,
  CombosExportService as default,
} from '@expert-dollop/tcg/data-access';
