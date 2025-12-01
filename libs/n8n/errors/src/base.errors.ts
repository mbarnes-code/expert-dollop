import { ApplicationError } from './application.error';

/**
 * Base error for user-facing errors.
 * These are expected errors that occur during normal operation.
 */
export abstract class UserError extends ApplicationError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, { ...options, severity: 'warning' });
  }

  isUserError(): boolean {
    return true;
  }

  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Base error for operational errors.
 * These are errors that occur during the operation of the system
 * but are expected and can be handled gracefully.
 */
export abstract class OperationalError extends ApplicationError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, { ...options, severity: 'error' });
  }

  isUserError(): boolean {
    return false;
  }

  getUserMessage(): string {
    return 'An operational error occurred. Please try again.';
  }
}

/**
 * Base error for unexpected errors.
 * These are programming errors or unexpected system states.
 */
export abstract class UnexpectedError extends ApplicationError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, { ...options, severity: 'error' });
  }

  isUserError(): boolean {
    return false;
  }

  getUserMessage(): string {
    return 'An unexpected error occurred. Please contact support if the issue persists.';
  }
}
