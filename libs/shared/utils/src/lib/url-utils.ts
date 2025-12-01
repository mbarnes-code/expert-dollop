/**
 * URL validation utilities for the modular monolith.
 */

/**
 * Check if a string is a valid HTTP or HTTPS URL.
 * @param urlString - The string to validate
 * @returns True if the string is a valid HTTP(S) URL
 */
export function isValidHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
