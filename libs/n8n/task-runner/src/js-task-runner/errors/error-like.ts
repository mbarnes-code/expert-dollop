/**
 * Error-like interface for duck-typing error objects.
 */
export interface ErrorLike {
  message: string;
  stack?: string;
}

/**
 * Type guard to check if a value is error-like.
 *
 * @param value - Value to check
 * @returns True if the value has an error-like shape
 */
export function isErrorLike(value: unknown): value is ErrorLike {
  if (typeof value !== 'object' || value === null) return false;

  const errorLike = value as ErrorLike;

  return typeof errorLike.message === 'string';
}
