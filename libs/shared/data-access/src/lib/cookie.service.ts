/**
 * Cookie service for the modular monolith.
 * Provides a class-based abstraction for cookie management.
 * Uses the cookies-next library for universal cookie support.
 */

import { deleteCookie, getCookie, setCookie, OptionsType } from 'cookies-next';

/**
 * Expiration duration presets for cookies.
 */
export const expirationDurations = {
  hour: 3600,
  hours: 10800,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
} as const;

export type ExpirationDuration = keyof typeof expirationDurations;

/**
 * Abstract base class for cookie services.
 */
export abstract class BaseCookieService {
  /**
   * Get a cookie value.
   * @param path - Cookie name/path
   * @param options - Cookie options
   */
  abstract get<T = string>(path: string, options?: OptionsType): T | undefined;

  /**
   * Set a cookie value.
   * @param key - Cookie name
   * @param value - Cookie value
   * @param age - Expiration duration preset
   * @param options - Cookie options
   */
  abstract set(key: string, value: unknown, age?: ExpirationDuration, options?: OptionsType): void;

  /**
   * Remove a cookie.
   * @param key - Cookie name
   * @param options - Cookie options
   */
  abstract remove(key: string, options?: OptionsType): void;
}

/**
 * Cookie service implementation using cookies-next library.
 */
export class UniversalCookieService extends BaseCookieService {
  private static instance: UniversalCookieService | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): UniversalCookieService {
    if (!UniversalCookieService.instance) {
      UniversalCookieService.instance = new UniversalCookieService();
    }
    return UniversalCookieService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    UniversalCookieService.instance = null;
  }

  /**
   * Get a cookie value.
   * @param path - Cookie name/path
   * @param options - Cookie options
   */
  get<T = string>(path: string, options?: OptionsType): T | undefined {
    // @ts-ignore - Type mismatch in cookies-next
    const result = getCookie(path, { path: '/', ...options });
    return result as T;
  }

  /**
   * Set a cookie value.
   * @param key - Cookie name
   * @param value - Cookie value
   * @param age - Expiration duration preset
   * @param options - Cookie options
   */
  set(key: string, value: unknown, age?: ExpirationDuration, options?: OptionsType): void {
    const maxAge = age ? expirationDurations[age] : undefined;

    setCookie(key, value, {
      path: '/',
      maxAge,
      sameSite: 'strict',
      httpOnly: false,
      ...options,
    });
  }

  /**
   * Remove a cookie.
   * @param key - Cookie name
   * @param options - Cookie options
   */
  remove(key: string, options?: OptionsType): void {
    deleteCookie(key, { path: '/', ...options });
  }
}

// Legacy functional exports for backward compatibility
export function get<T = string>(path: string, options?: OptionsType): T | undefined {
  return UniversalCookieService.getInstance().get<T>(path, options);
}

export function set(
  key: string,
  value: unknown,
  age?: ExpirationDuration,
  options?: OptionsType,
): void {
  UniversalCookieService.getInstance().set(key, value, age, options);
}

export function remove(key: string, options?: OptionsType): void {
  UniversalCookieService.getInstance().remove(key, options);
}

/**
 * Create a logout function that removes specific cookies.
 * @param cookieKeys - Array of cookie keys to remove on logout
 * @returns A logout function
 */
export function createLogoutFunction(cookieKeys: string[]): () => void {
  return () => {
    cookieKeys.forEach((key) => remove(key));
  };
}

const CookieService = {
  get,
  set,
  remove,
};

export default CookieService;
