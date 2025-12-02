import { z } from 'zod';

/**
 * Validate if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}
