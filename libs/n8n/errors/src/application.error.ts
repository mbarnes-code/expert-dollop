/**
 * Error severity level for error handling
 */
export type ErrorSeverity = 'warning' | 'error';

/**
 * Reporting options for error telemetry
 */
export interface ErrorReportingOptions {
  level?: ErrorSeverity;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Interface for serializable errors
 */
export interface ISerializedError {
  name: string;
  message: string;
  stack?: string;
  errorId?: string;
  timestamp: number;
  severity?: ErrorSeverity;
  cause?: ISerializedError;
  context?: Record<string, unknown>;
}

/**
 * Abstract base class for all n8n application errors.
 * Provides structured error handling with serialization support.
 */
export abstract class ApplicationError extends Error {
  /**
   * Unique identifier for this error instance
   */
  readonly errorId: string;

  /**
   * Timestamp when the error was created
   */
  readonly timestamp: number;

  /**
   * Error severity level
   */
  readonly severity: ErrorSeverity;

  /**
   * Additional context for debugging
   */
  readonly context: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      severity?: ErrorSeverity;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, { cause: options?.cause });
    this.name = this.constructor.name;
    this.errorId = this.generateErrorId();
    this.timestamp = Date.now();
    this.severity = options?.severity ?? 'error';
    this.context = options?.context ?? {};
  }

  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Serialize the error for logging or transmission
   */
  toJSON(): ISerializedError {
    const serialized: ISerializedError = {
      name: this.name,
      message: this.message,
      errorId: this.errorId,
      timestamp: this.timestamp,
      severity: this.severity,
    };

    if (this.stack) {
      serialized.stack = this.stack;
    }

    if (Object.keys(this.context).length > 0) {
      serialized.context = this.context;
    }

    if (this.cause instanceof ApplicationError) {
      serialized.cause = this.cause.toJSON();
    } else if (this.cause instanceof Error) {
      serialized.cause = {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
        timestamp: Date.now(),
      };
    }

    return serialized;
  }

  /**
   * Check if this error is a user error (expected vs unexpected)
   */
  abstract isUserError(): boolean;

  /**
   * Get a user-friendly message for display
   */
  abstract getUserMessage(): string;
}
