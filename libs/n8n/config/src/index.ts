/**
 * @expert-dollop/n8n-config
 * 
 * Configuration management for n8n modules.
 * Uses decorators to bind configuration properties to environment variables.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

import { z } from 'zod';
import { Container } from '@expert-dollop/n8n-di';

import { AuthConfig } from './configs/auth.config';
import { DatabaseConfig, SqliteConfig } from './configs/database.config';
import { LoggingConfig, LOG_SCOPES, CronLoggingConfig } from './configs/logging.config';
import { TaskRunnersConfig } from './configs/runners.config';
import { SecurityConfig } from './configs/security.config';
import { ExecutionsConfig } from './configs/executions.config';
import { WorkflowsConfig } from './configs/workflows.config';
import { 
  DeploymentConfig, 
  MfaConfig, 
  HiringBannerConfig, 
  PersonalizationConfig,
  NodesConfig 
} from './configs/generic.config';
import { Config, Env, Nested } from './decorators';

// Re-export decorators
export { Config, Env, Nested } from './decorators';

// Re-export custom types
export * from './custom-types';

// Re-export utility functions
export { getN8nFolder, getDataFolder, normalizeN8nPath } from './utils/utils';

// Re-export config classes
export { AuthConfig } from './configs/auth.config';
export { DatabaseConfig, SqliteConfig } from './configs/database.config';
export { LoggingConfig, LOG_SCOPES, CronLoggingConfig } from './configs/logging.config';
export type { LogScope } from './configs/logging.config';
export { TaskRunnersConfig } from './configs/runners.config';
export type { TaskRunnerMode } from './configs/runners.config';
export { SecurityConfig } from './configs/security.config';
export { ExecutionsConfig } from './configs/executions.config';
export { WorkflowsConfig } from './configs/workflows.config';
export { 
  DeploymentConfig, 
  MfaConfig, 
  HiringBannerConfig, 
  PersonalizationConfig,
  NodesConfig 
} from './configs/generic.config';

const protocolSchema = z.enum(['http', 'https']);
export type Protocol = z.infer<typeof protocolSchema>;

/**
 * Global configuration class that aggregates all configuration sections.
 * Access via dependency injection: `Container.get(GlobalConfig)`
 * 
 * @example
 * ```typescript
 * import { Container } from '@expert-dollop/n8n-di';
 * import { GlobalConfig } from '@expert-dollop/n8n-config';
 * 
 * const config = Container.get(GlobalConfig);
 * console.log(config.port); // 5678
 * console.log(config.database.type); // 'sqlite'
 * ```
 */
@Config
export class GlobalConfig {
  @Nested
  auth: AuthConfig;

  @Nested
  database: DatabaseConfig;

  @Nested
  logging: LoggingConfig;

  @Nested
  taskRunners: TaskRunnersConfig;

  @Nested
  security: SecurityConfig;

  @Nested
  executions: ExecutionsConfig;

  @Nested
  workflows: WorkflowsConfig;

  @Nested
  deployment: DeploymentConfig;

  @Nested
  mfa: MfaConfig;

  @Nested
  hiringBanner: HiringBannerConfig;

  @Nested
  personalization: PersonalizationConfig;

  @Nested
  nodes: NodesConfig;

  /** Path n8n is deployed to */
  @Env('N8N_PATH')
  path: string = '/';

  /** Host name n8n can be reached */
  @Env('N8N_HOST')
  host: string = 'localhost';

  /** HTTP port n8n can be reached */
  @Env('N8N_PORT')
  port: number = 5678;

  /** IP address n8n should listen on */
  @Env('N8N_LISTEN_ADDRESS')
  listen_address: string = '::';

  /** HTTP Protocol via which n8n can be reached */
  @Env('N8N_PROTOCOL', protocolSchema)
  protocol: Protocol = 'http';

  /** Default locale for the UI. */
  @Env('N8N_DEFAULT_LOCALE')
  defaultLocale: string = 'en';

  /** Whether to hide the page that shows active workflows and executions count. */
  @Env('N8N_HIDE_USAGE_PAGE')
  hideUsagePage: boolean = false;

  /** Number of reverse proxies n8n is running behind. */
  @Env('N8N_PROXY_HOPS')
  proxy_hops: number = 0;

  /** SSL key for HTTPS protocol. */
  @Env('N8N_SSL_KEY')
  ssl_key: string = '';

  /** SSL cert for HTTPS protocol. */
  @Env('N8N_SSL_CERT')
  ssl_cert: string = '';

  /** Public URL where the editor is accessible. Also used for emails sent from n8n. */
  @Env('N8N_EDITOR_BASE_URL')
  editorBaseUrl: string = '';
}

/**
 * Helper function to get the global config from the container
 */
export function getGlobalConfig(): GlobalConfig {
  return Container.get(GlobalConfig);
}
