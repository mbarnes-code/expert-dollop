/**
 * @fileoverview Core error base class
 * @module @expert-dollop/n8n-core/errors
 */

/**
 * Abstract core error class
 */
export abstract class CoreError extends Error {
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, options?: { context?: Record<string, unknown>; cause?: Error }) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = Date.now();
    this.context = options?.context;
    
    if (options?.cause) {
      this.cause = options.cause;
    }
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
