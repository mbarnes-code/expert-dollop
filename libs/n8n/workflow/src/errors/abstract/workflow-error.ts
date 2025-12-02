/**
 * @fileoverview Base workflow error class
 * @module @expert-dollop/n8n-workflow/errors
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'warning' | 'error';

/**
 * Base options for workflow errors
 */
export interface WorkflowErrorOptions {
  message?: string;
  description?: string;
  cause?: Error | unknown;
  severity?: ErrorSeverity;
  extra?: Record<string, unknown>;
}

/**
 * Base abstract workflow error class
 * All workflow-specific errors should extend this class
 */
export abstract class WorkflowError extends Error {
  readonly description: string | undefined;
  readonly cause: Error | undefined;
  readonly timestamp: number;
  readonly severity: ErrorSeverity;
  readonly extra: Record<string, unknown>;
  
  /**
   * Error level for categorization
   */
  abstract readonly level: 'warning' | 'error';
  
  constructor(message: string, options: WorkflowErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.description = options.description;
    this.timestamp = Date.now();
    this.severity = options.severity ?? 'error';
    this.extra = options.extra ?? {};
    
    // Handle cause
    if (options.cause instanceof Error) {
      this.cause = options.cause;
    } else if (options.cause) {
      this.cause = new Error(String(options.cause));
    }
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Converts error to JSON representation
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      description: this.description,
      timestamp: this.timestamp,
      severity: this.severity,
      level: this.level,
      extra: this.extra,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }
}
