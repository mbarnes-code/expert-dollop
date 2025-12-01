/**
 * Shared Data Access Library
 * 
 * This library provides common data access utilities and services
 * that can be used across the modular monolith.
 */

export const shared_data_access_VERSION = '0.0.1';

// Cookie service
export {
  BaseCookieService,
  UniversalCookieService,
  expirationDurations,
  get,
  set,
  remove,
  default as CookieService,
  type ExpirationDuration,
} from './cookie.service';

// DAPR Client exports for database-agnostic state management
export * from './dapr';
