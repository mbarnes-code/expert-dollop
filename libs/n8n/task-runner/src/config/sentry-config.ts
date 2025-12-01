/**
 * Sentry configuration for error reporting.
 */
import { Config, Env } from '@expert-dollop/n8n-config';

/**
 * Configuration for Sentry error reporting.
 * Enables centralized error tracking and monitoring.
 */
@Config
export class SentryConfig {
  /** Sentry DSN (Data Source Name) for error reporting */
  @Env('N8N_SENTRY_DSN')
  dsn: string = '';

  //#region Metadata about the environment

  /** Version of n8n being used */
  @Env('N8N_VERSION')
  n8nVersion: string = '';

  /** Environment name (e.g., 'production', 'staging') */
  @Env('ENVIRONMENT')
  environment: string = '';

  /** Deployment name for identification */
  @Env('DEPLOYMENT_NAME')
  deploymentName: string = '';

  //#endregion
}
