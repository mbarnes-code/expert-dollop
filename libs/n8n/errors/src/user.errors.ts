import { UserError } from './base.errors';

/**
 * Authentication error - thrown when authentication fails
 */
export class AuthenticationError extends UserError {
  constructor(
    message: string = 'Authentication failed',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options);
  }
}

/**
 * Authorization error - thrown when user lacks permissions
 */
export class AuthorizationError extends UserError {
  constructor(
    message: string = 'You do not have permission to perform this action',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options);
  }
}

/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends UserError {
  readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string,
    validationErrors: Record<string, string[]> = {},
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, {
      ...options,
      context: { ...options?.context, validationErrors },
    });
    this.validationErrors = validationErrors;
  }
}

/**
 * Not found error - thrown when a resource cannot be found
 */
export class NotFoundError extends UserError {
  constructor(
    resourceType: string,
    resourceId?: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    const message = resourceId
      ? `${resourceType} with ID '${resourceId}' was not found`
      : `${resourceType} was not found`;
    super(message, {
      ...options,
      context: { ...options?.context, resourceType, resourceId },
    });
  }
}

/**
 * Conflict error - thrown when there's a resource conflict
 */
export class ConflictError extends UserError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options);
  }
}
