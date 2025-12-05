/**
 * HELK Configuration Orchestrator
 * Main service that coordinates all HELK subsystems
 * Follows DDD and modular monolith patterns
 */

import { ElasticsearchConfigService, ElasticsearchConfigServiceImpl } from './elasticsearch-config.service';
import { KibanaConfigService, KibanaConfigServiceImpl } from './kibana-config.service';
import { LogstashConfigService, LogstashConfigServiceImpl } from './logstash-config.service';
import { JupyterConfigService, JupyterConfigServiceImpl } from './jupyter-config.service';

export interface HELKServices {
  elasticsearch: ElasticsearchConfigService;
  kibana: KibanaConfigService;
  logstash: LogstashConfigService;
  jupyter: JupyterConfigService;
}

export interface HELKDeploymentConfig {
  version: string;
  name: string;
  description: string;
  components: {
    elasticsearch: boolean;
    kibana: boolean;
    logstash: boolean;
    jupyter: boolean;
    spark: boolean;
  };
  integration: {
    securityonion: boolean;
  };
}

/**
 * Main orchestrator for HELK platform
 * Provides unified access to all HELK subsystems
 */
export class HELKConfigOrchestrator {
  private services: HELKServices;
  private deploymentConfig: HELKDeploymentConfig;

  constructor() {
    this.services = {
      elasticsearch: new ElasticsearchConfigServiceImpl(),
      kibana: new KibanaConfigServiceImpl(),
      logstash: new LogstashConfigServiceImpl(),
      jupyter: new JupyterConfigServiceImpl(),
    };

    this.deploymentConfig = {
      version: '0.1.0',
      name: 'HELK - Hunting ELK',
      description: 'Advanced threat hunting platform with analytics capabilities',
      components: {
        elasticsearch: true,
        kibana: true,
        logstash: true,
        jupyter: true,
        spark: true,
      },
      integration: {
        securityonion: true,
      },
    };
  }

  /**
   * Get Elasticsearch service
   */
  getElasticsearchService(): ElasticsearchConfigService {
    return this.services.elasticsearch;
  }

  /**
   * Get Kibana service
   */
  getKibanaService(): KibanaConfigService {
    return this.services.kibana;
  }

  /**
   * Get Logstash service
   */
  getLogstashService(): LogstashConfigService {
    return this.services.logstash;
  }

  /**
   * Get Jupyter service
   */
  getJupyterService(): JupyterConfigService {
    return this.services.jupyter;
  }

  /**
   * Get deployment configuration
   */
  getDeploymentConfig(): HELKDeploymentConfig {
    return this.deploymentConfig;
  }

  /**
   * Generate complete configuration for deployment
   */
  generateDeploymentManifest(): any {
    return {
      metadata: {
        name: this.deploymentConfig.name,
        version: this.deploymentConfig.version,
        description: this.deploymentConfig.description,
      },
      components: {
        elasticsearch: this.deploymentConfig.components.elasticsearch
          ? {
              config: this.services.elasticsearch.getMergedConfig(),
              templates: this.services.elasticsearch.getIndexTemplates(),
              policies: this.services.elasticsearch.getLifecyclePolicies(),
            }
          : null,
        kibana: this.deploymentConfig.components.kibana
          ? {
              config: this.services.kibana.getConfig(),
              dashboards: this.services.kibana.getDashboards(),
            }
          : null,
        logstash: this.deploymentConfig.components.logstash
          ? {
              config: this.services.logstash.getPipelineConfig(),
              pipelines: this.services.logstash.getPipelines(),
            }
          : null,
        jupyter: this.deploymentConfig.components.jupyter
          ? {
              config: this.services.jupyter.getJupyterConfig(),
              notebooks: this.services.jupyter.getNotebooks(),
            }
          : null,
        spark: this.deploymentConfig.components.spark
          ? {
              config: this.services.jupyter.getSparkConfig(),
            }
          : null,
      },
      integration: this.deploymentConfig.integration,
    };
  }

  /**
   * Export configuration as YAML
   */
  exportAsYAML(): string {
    const manifest = this.generateDeploymentManifest();
    // In a real implementation, this would use a YAML library
    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Validate configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate Elasticsearch config
    const esConfig = this.services.elasticsearch.getMergedConfig();
    if (!esConfig.network || !esConfig.network.host) {
      errors.push('Elasticsearch network host is required');
    }

    // Validate Kibana config
    const kibanaConfig = this.services.kibana.getConfig();
    if (!kibanaConfig.elasticsearch.hosts || kibanaConfig.elasticsearch.hosts.length === 0) {
      errors.push('Kibana must have at least one Elasticsearch host');
    }

    // Validate Logstash pipelines
    const pipelines = this.services.logstash.getPipelines();
    if (pipelines.length === 0) {
      errors.push('At least one Logstash pipeline is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
