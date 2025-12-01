/**
 * Password validation schema.
 */
import { z } from 'zod';

const minLength = 8;
const maxLength = 64;

/**
 * Password validation schema with security requirements:
 * - Length: 8-64 characters
 * - Must contain at least 1 number
 * - Must contain at least 1 uppercase letter
 */
export const passwordSchema = z
  .string()
  .min(minLength, `Password must be ${minLength} to ${maxLength} characters long.`)
  .max(maxLength, `Password must be ${minLength} to ${maxLength} characters long.`)
  .refine((password) => /\d/.test(password), {
    message: 'Password must contain at least 1 number.',
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least 1 uppercase letter.',
  });
