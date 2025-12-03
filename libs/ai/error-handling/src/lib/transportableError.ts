/**
 * Base transportable error class
 * Inspired by firecrawl-api's error handling system
 * Provides serialization/deserialization for errors in distributed systems
 */

export interface SerializedError {
  message: string;
  stack?: string;
  cause?: unknown;
}

/**
 * Base class for errors that can be serialized and sent across network/queues
 */
export class TransportableError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }

  /**
   * Serialize error for transport
   */
  serialize(): SerializedError {
    return {
      message: this.message,
      stack: this.stack,
      cause: this.cause,
    };
  }

  /**
   * Deserialize error from transport
   */
  static deserialize(data: SerializedError): TransportableError {
    const error = new TransportableError(data.message, { cause: data.cause });
    error.stack = data.stack;
    return error;
  }
}

/**
 * Error for operations that timed out
 */
export class TimeoutError extends TransportableError {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
  }

  serialize(): SerializedError & { timeoutMs: number } {
    return {
      ...super.serialize(),
      timeoutMs: this.timeoutMs,
    };
  }

  static deserialize(
    data: SerializedError & { timeoutMs: number }
  ): TimeoutError {
    const error = new TimeoutError(data.message, data.timeoutMs);
    error.stack = data.stack;
    return error;
  }
}

/**
 * Error for unknown/unexpected errors
 * Wraps unknown errors to make them transportable
 */
export class UnknownError extends TransportableError {
  constructor(inner: unknown) {
    const message =
      inner && inner instanceof Error
        ? inner.message
        : `Unknown error: ${String(inner)}`;
    super(message);

    if (inner instanceof Error) {
      this.stack = inner.stack;
      this.cause = inner.cause;
    }
  }

  serialize(): SerializedError {
    return super.serialize();
  }

  static deserialize(data: SerializedError): UnknownError {
    const error = new UnknownError(data.message);
    error.stack = data.stack;
    return error;
  }
}

/**
 * Error for network-related failures
 */
export class NetworkError extends TransportableError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly url?: string
  ) {
    super(message);
  }

  serialize(): SerializedError & { statusCode?: number; url?: string } {
    return {
      ...super.serialize(),
      statusCode: this.statusCode,
      url: this.url,
    };
  }

  static deserialize(
    data: SerializedError & { statusCode?: number; url?: string }
  ): NetworkError {
    const error = new NetworkError(data.message, data.statusCode, data.url);
    error.stack = data.stack;
    return error;
  }
}

/**
 * Helper function to ensure an unknown value is an Error
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'string') {
    return new Error(value);
  }

  return new Error(`Unknown error: ${String(value)}`);
}

/**
 * Helper function to wrap unknown errors as TransportableError
 */
export function wrapError(error: unknown): TransportableError {
  if (error instanceof TransportableError) {
    return error;
  }

  return new UnknownError(error);
}
