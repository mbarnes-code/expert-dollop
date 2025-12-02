/**
 * Main configuration aggregating all task runner configurations.
 */
import { Config, Nested } from '@expert-dollop/n8n-config';

import { BaseRunnerConfig } from './base-runner-config';
import { JsRunnerConfig } from './js-runner-config';
import { SentryConfig } from './sentry-config';

/**
 * Main configuration class that aggregates all task runner configurations.
 * This is the entry point for accessing all runner settings.
 */
@Config
export class MainConfig {
  /** Base runner configuration (broker connection, timeouts, etc.) */
  @Nested
  baseRunnerConfig!: BaseRunnerConfig;

  /** JavaScript runner configuration (module access, security) */
  @Nested
  jsRunnerConfig!: JsRunnerConfig;

  /** Sentry error reporting configuration */
  @Nested
  sentryConfig!: SentryConfig;
}
