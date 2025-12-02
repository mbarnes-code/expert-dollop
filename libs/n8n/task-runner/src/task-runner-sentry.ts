/**
 * Sentry integration for the task runner.
 * Provides error reporting with filtering for user code errors.
 * 
 * NOTE: This is an abstract implementation. The actual Sentry SDK 
 * integration should be provided by the consuming application.
 */
import { Service } from '@expert-dollop/n8n-di';

import { SentryConfig } from './config/sentry-config';

/**
 * Error event structure (simplified from Sentry types).
 */
interface ErrorEvent {
  exception?: {
    values?: Exception[];
  };
}

/**
 * Exception structure (simplified from Sentry types).
 */
interface Exception {
  stacktrace?: {
    frames?: Array<{
      filename?: string;
      function?: string;
    }>;
  };
}

/**
 * Sentry service for the task runner.
 * Handles error reporting with filtering for user-generated errors.
 * 
 * This is a base implementation that should be extended with actual
 * Sentry SDK integration in the consuming application.
 */
@Service()
export class TaskRunnerSentry {
  /** Whether Sentry has been initialized */
  protected isInitialized = false;

  constructor(private readonly config: SentryConfig) {}

  /**
   * Initializes Sentry if a DSN is configured.
   * Override this method to provide actual Sentry.init() integration.
   */
  async initIfEnabled(): Promise<void> {
    const { dsn } = this.config;

    if (!dsn) return;

    // Mark as initialized - actual Sentry.init() should be called by override
    this.isInitialized = true;
    
    // Override this method to call Sentry.init() with proper configuration:
    // - serverType: 'task_runner'
    // - dsn: this.config.dsn
    // - release: `n8n@${this.config.n8nVersion}`
    // - environment: this.config.environment
    // - serverName: this.config.deploymentName
    // - beforeSendFilter: this.filterOutUserCodeErrors
  }

  /**
   * Shuts down Sentry gracefully.
   * Override this method to provide actual Sentry.close() integration.
   */
  async shutdown(): Promise<void> {
    if (!this.config.dsn || !this.isInitialized) return;

    // Override this method to call Sentry.close()
    this.isInitialized = false;
  }

  /**
   * Filter out errors originating from user provided code.
   * It is possible for users to create code that causes unhandledrejections
   * that end up in the sentry error reporting.
   *
   * @param event - The error event to filter
   * @returns true if the error should be filtered out (is a user code error)
   */
  filterOutUserCodeErrors = (event: ErrorEvent): boolean => {
    const error = event?.exception?.values?.[0];

    return error ? this.isUserCodeError(error) : false;
  };

  /**
   * Check if the error is originating from user provided code.
   * It is possible for users to create code that causes unhandledrejections
   * that end up in the sentry error reporting.
   */
  private isUserCodeError(error: Exception): boolean {
    const frames = error.stacktrace?.frames;
    if (!frames) return false;

    return frames.some(
      (frame) => frame.filename === 'node:vm' && frame.function === 'runInContext',
    );
  }
}
