import { Config, Env } from '../decorators';

/**
 * Deployment configuration
 */
@Config
export class DeploymentConfig {
  /** Deployment type identifier */
  @Env('N8N_DEPLOYMENT_TYPE')
  type: string = 'default';
}

/**
 * MFA (Multi-Factor Authentication) configuration
 */
@Config
export class MfaConfig {
  /** Whether MFA is enabled */
  @Env('N8N_MFA_ENABLED')
  enabled: boolean = true;
}

/**
 * Hiring banner configuration
 */
@Config
export class HiringBannerConfig {
  /** Whether hiring banner is enabled */
  @Env('N8N_HIRING_BANNER_ENABLED')
  enabled: boolean = true;
}

/**
 * Personalization configuration
 */
@Config
export class PersonalizationConfig {
  /** Whether personalization is enabled */
  @Env('N8N_PERSONALIZATION_ENABLED')
  enabled: boolean = true;
}

/**
 * Nodes configuration
 */
@Config
export class NodesConfig {
  /** Error trigger node type */
  @Env('NODES_ERROR_TRIGGER_TYPE')
  errorTriggerType: string = 'n8n-nodes-base.errorTrigger';

  /** Nodes to include (JSON array) */
  @Env('NODES_INCLUDE')
  include: string[] = [];

  /** Nodes to exclude (JSON array) */
  @Env('NODES_EXCLUDE')
  exclude: string[] = [];

  /** Whether Python is enabled for code nodes */
  @Env('N8N_NODES_PYTHON_ENABLED')
  pythonEnabled: boolean = true;
}
