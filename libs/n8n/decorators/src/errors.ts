import { ApplicationError } from '@expert-dollop/n8n-errors';

/**
 * Error thrown when a decorator is used on a non-method property
 */
export class NonMethodError extends ApplicationError {
  constructor(name: string) {
    super(`${name} must be a method on a class to use this decorator`);
  }
}
