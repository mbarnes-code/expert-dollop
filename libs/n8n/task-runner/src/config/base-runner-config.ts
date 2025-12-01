/**
 * Base configuration for task runners.
 * Uses decorator-based environment variable binding.
 */
import { Config, Env, Nested } from '@expert-dollop/n8n-config';

/**
 * Configuration for the health check server.
 * Enables health monitoring of the task runner.
 */
@Config
export class HealthcheckServerConfig {
  /** Whether the health check server is enabled */
  @Env('N8N_RUNNERS_HEALTH_CHECK_SERVER_ENABLED')
  enabled: boolean = false;

  /** Host address for the health check server */
  @Env('N8N_RUNNERS_HEALTH_CHECK_SERVER_HOST')
  host: string = '127.0.0.1';

  /** Port for the health check server */
  @Env('N8N_RUNNERS_HEALTH_CHECK_SERVER_PORT')
  port: number = 5681;
}

/**
 * Base configuration for all task runners.
 * Provides common settings for broker connection, concurrency, and timeouts.
 */
@Config
export class BaseRunnerConfig {
  /** URI of the task broker to connect to */
  @Env('N8N_RUNNERS_TASK_BROKER_URI')
  taskBrokerUri: string = 'http://127.0.0.1:5679';

  /** Token for authenticating with the task broker */
  @Env('N8N_RUNNERS_GRANT_TOKEN')
  grantToken: string = '';

  /** Maximum payload size in bytes (default: 1GB) */
  @Env('N8N_RUNNERS_MAX_PAYLOAD')
  maxPayloadSize: number = 1024 * 1024 * 1024;

  /**
   * Maximum number of concurrent tasks the runner can execute.
   * Kept high for backwards compatibility - n8n v2 will reduce this to 5.
   */
  @Env('N8N_RUNNERS_MAX_CONCURRENCY')
  maxConcurrency: number = 10;

  /**
   * How long (in seconds) a runner may be idle before auto-shutdown.
   * Intended for external mode - launcher must pass the env var.
   * Disabled with 0 in internal mode.
   */
  @Env('N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT')
  idleTimeout: number = 0;

  /** Default timezone for task execution */
  @Env('GENERIC_TIMEZONE')
  timezone: string = 'America/New_York';

  /**
   * Maximum time (in seconds) a task can run before being aborted.
   * Must be greater than 0.
   * Kept high for backwards compatibility - n8n v2 will reduce this to 60.
   */
  @Env('N8N_RUNNERS_TASK_TIMEOUT')
  taskTimeout: number = 300; // 5 minutes

  /** Health check server configuration */
  @Nested
  healthcheckServer!: HealthcheckServerConfig;
}
