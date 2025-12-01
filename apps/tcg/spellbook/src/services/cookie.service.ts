/**
 * Cookie service re-export from shared library.
 * This file provides backward compatibility for imports from services/cookie.service.
 * Following DDD modular monolith best practices, the actual implementation
 * is in @expert-dollop/shared/data-access.
 */

// Re-export everything from the shared cookie service
export {
  expirationDurations,
  get,
  set,
  remove,
  createLogoutFunction,
  type ExpirationDuration,
} from '@expert-dollop/shared/data-access';

import { get, set, remove, createLogoutFunction } from '@expert-dollop/shared/data-access';

/**
 * Spellbook-specific cookie keys used for authentication.
 */
const SPELLBOOK_AUTH_COOKIE_KEYS = [
  'csbRefresh',
  'csbJwt',
  'csbUsername',
  'csbUserId',
  'csbIsStaff',
] as const;

/**
 * Logout function for Commander Spellbook.
 * Removes all authentication-related cookies.
 */
export const logout = createLogoutFunction([...SPELLBOOK_AUTH_COOKIE_KEYS]);

/**
 * CookieService with Spellbook-specific logout function.
 * Provides backward compatibility for imports using `CookieService.logout()`.
 */
const CookieService = {
  get,
  set,
  remove,
  logout,
};

export default CookieService;
