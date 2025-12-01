/**
 * Query parameter utilities for the modular monolith.
 * Provides type-safe utilities for handling URL query parameters.
 */

/**
 * Converts a query parameter value to a string.
 * Handles both single values and arrays.
 * @param param - The query parameter value (string, array, or undefined)
 * @returns The string value or undefined
 */
export function queryParameterAsString(param: string | string[] | undefined): string | undefined {
  if (typeof param === 'string') {
    return param;
  }
  if (Array.isArray(param)) {
    return param[0];
  }
  return undefined;
}
