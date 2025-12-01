/**
 * @fileoverview Error utilities
 * @module @expert-dollop/n8n-workflow/errors
 */

/**
 * Ensures a value is an Error instance
 * @param error - The value to ensure is an Error
 * @returns An Error instance
 */
export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  
  return new Error(String(error));
}
