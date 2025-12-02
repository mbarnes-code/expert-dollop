/**
 * HTTP error base class
 */
export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a JSON response
   */
  toJSON(): Record<string, unknown> {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
      },
    };
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends HttpError {
  readonly statusCode = 400;
  readonly errorCode = 'BAD_REQUEST';

  constructor(message = 'Bad Request') {
    super(message);
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends HttpError {
  readonly statusCode = 401;
  readonly errorCode = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized') {
    super(message);
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends HttpError {
  readonly statusCode = 403;
  readonly errorCode = 'FORBIDDEN';

  constructor(message = 'Forbidden') {
    super(message);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND';

  constructor(message = 'Not Found') {
    super(message);
  }
}

/**
 * 405 Method Not Allowed error
 */
export class MethodNotAllowedError extends HttpError {
  readonly statusCode = 405;
  readonly errorCode = 'METHOD_NOT_ALLOWED';

  constructor(message = 'Method Not Allowed') {
    super(message);
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = 'CONFLICT';

  constructor(message = 'Conflict') {
    super(message);
  }
}

/**
 * 422 Unprocessable Entity error
 */
export class UnprocessableEntityError extends HttpError {
  readonly statusCode = 422;
  readonly errorCode = 'UNPROCESSABLE_ENTITY';

  constructor(message = 'Unprocessable Entity') {
    super(message);
  }
}

/**
 * 429 Too Many Requests error
 */
export class TooManyRequestsError extends HttpError {
  readonly statusCode = 429;
  readonly errorCode = 'TOO_MANY_REQUESTS';

  constructor(message = 'Too Many Requests') {
    super(message);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly errorCode = 'INTERNAL_SERVER_ERROR';

  constructor(message = 'Internal Server Error') {
    super(message);
  }
}

/**
 * 502 Bad Gateway error
 */
export class BadGatewayError extends HttpError {
  readonly statusCode = 502;
  readonly errorCode = 'BAD_GATEWAY';

  constructor(message = 'Bad Gateway') {
    super(message);
  }
}

/**
 * 503 Service Unavailable error
 */
export class ServiceUnavailableError extends HttpError {
  readonly statusCode = 503;
  readonly errorCode = 'SERVICE_UNAVAILABLE';

  constructor(message = 'Service Unavailable') {
    super(message);
  }
}

/**
 * 504 Gateway Timeout error
 */
export class GatewayTimeoutError extends HttpError {
  readonly statusCode = 504;
  readonly errorCode = 'GATEWAY_TIMEOUT';

  constructor(message = 'Gateway Timeout') {
    super(message);
  }
}

/**
 * Validation error with field-level details
 */
export class ValidationError extends BadRequestError {
  override readonly errorCode = 'VALIDATION_ERROR';
  readonly validationErrors: Record<string, string[]>;

  constructor(message: string, validationErrors: Record<string, string[]>) {
    super(message);
    this.validationErrors = validationErrors;
  }

  override toJSON(): Record<string, unknown> {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        validationErrors: this.validationErrors,
      },
    };
  }
}

/**
 * Authentication error with hint
 */
export class AuthenticationError extends UnauthorizedError {
  override readonly errorCode = 'AUTHENTICATION_ERROR';
  readonly hint?: string;

  constructor(message: string, hint?: string) {
    super(message);
    this.hint = hint;
  }

  override toJSON(): Record<string, unknown> {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        hint: this.hint,
      },
    };
  }
}

/**
 * Checks if an error is an HttpError
 * @param error - Error to check
 * @returns True if error is an HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Gets the status code from an error
 * @param error - Error to get status code from
 * @returns Status code (500 if not an HttpError)
 */
export function getErrorStatusCode(error: unknown): number {
  if (isHttpError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Converts an error to a JSON response
 * @param error - Error to convert
 * @returns JSON response object
 */
export function errorToJson(error: unknown): Record<string, unknown> {
  if (isHttpError(error)) {
    return error.toJSON();
  }
  if (error instanceof Error) {
    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      },
    };
  }
  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: String(error),
    },
  };
}
