/**
 * Sentry integration for the task runner.
 * Provides error reporting with filtering for user code errors.
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
 */
@Service()
export class TaskRunnerSentry {
  constructor(private readonly config: SentryConfig) {}

  /**
   * Initializes Sentry if a DSN is configured.
   */
  async initIfEnabled(): Promise<void> {
    const { dsn, n8nVersion, environment, deploymentName } = this.config;

    if (!dsn) return;

    // In the actual implementation, this would call Sentry.init()
    console.log(`Sentry would be initialized with DSN: ${dsn.substring(0, 20)}...`);
    console.log(`  n8nVersion: ${n8nVersion}`);
    console.log(`  environment: ${environment}`);
    console.log(`  deploymentName: ${deploymentName}`);
  }

  /**
   * Shuts down Sentry gracefully.
   */
  async shutdown(): Promise<void> {
    if (!this.config.dsn) return;

    // In the actual implementation, this would call Sentry.close()
    console.log('Sentry shutdown');
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
