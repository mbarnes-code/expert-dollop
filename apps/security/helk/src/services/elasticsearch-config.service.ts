/**
 * Elasticsearch Configuration Service
 * Combines HELK and SecurityOnion configurations following DDD patterns
 */

import { ElasticsearchConfig, IndexTemplate, LifecyclePolicy } from '../domain/elasticsearch-config.interface';

export abstract class ElasticsearchConfigService {
  /**
   * Get the base Elasticsearch configuration
   */
  abstract getBaseConfig(): ElasticsearchConfig;

  /**
   * Get HELK-specific configuration
   */
  abstract getHELKConfig(): Partial<ElasticsearchConfig>;

  /**
   * Get SecurityOnion-specific configuration
   */
  abstract getSecurityOnionConfig(): Partial<ElasticsearchConfig>;

  /**
   * Merge configurations in an additive manner
   */
  abstract getMergedConfig(): ElasticsearchConfig;

  /**
   * Get index templates
   */
  abstract getIndexTemplates(): IndexTemplate[];

  /**
   * Get lifecycle policies
   */
  abstract getLifecyclePolicies(): LifecyclePolicy[];
}

export class ElasticsearchConfigServiceImpl extends ElasticsearchConfigService {
  getBaseConfig(): ElasticsearchConfig {
    return {
      network: {
        host: '0.0.0.0',
        port: 9200,
      },
      path: {
        logs: '/var/log/elasticsearch',
        data: '/var/lib/elasticsearch',
      },
      bootstrap: {
        memory_lock: true,
      },
      action: {
        destructive_requires_name: true,
      },
    };
  }

  getHELKConfig(): Partial<ElasticsearchConfig> {
    return {
      cluster: {
        name: 'helk-elk',
      },
      node: {
        name: 'helk-1',
      },
      discovery: {
        type: 'single-node',
        zen: {
          minimum_master_nodes: 1,
        },
      },
      indices: {
        query: {
          bool: {
            max_clause_count: 4096,
          },
        },
      },
      xpack: {
        monitoring: {
          collection: {
            enabled: true,
          },
        },
        ml: {
          enabled: false,
        },
        security: {
          enabled: false, // HELK uses basic security
        },
      },
    };
  }

  getSecurityOnionConfig(): Partial<ElasticsearchConfig> {
    return {
      cluster: {
        routing: {
          allocation: {
            disk: {
              threshold_enabled: true,
              watermark: {
                flood_stage: '90%',
                high: '85%',
                low: '80%',
              },
            },
          },
        },
      },
      indices: {
        id_field_data: {
          enabled: false,
        },
      },
      logger: {
        org: {
          elasticsearch: {
            deprecation: 'ERROR',
          },
        },
      },
      script: {
        max_compilations_rate: '20000/1m',
      },
      transport: {
        bind_host: '0.0.0.0',
        publish_port: 9300,
      },
      xpack: {
        ml: {
          enabled: false,
        },
        security: {
          enabled: true,
          http: {
            ssl: {
              enabled: true,
              certificate: '/usr/share/elasticsearch/config/elasticsearch.crt',
              key: '/usr/share/elasticsearch/config/elasticsearch.key',
              certificate_authorities: ['/usr/share/elasticsearch/config/ca.crt'],
              client_authentication: 'none',
            },
          },
          transport: {
            ssl: {
              enabled: true,
              certificate: '/usr/share/elasticsearch/config/elasticsearch.crt',
              key: '/usr/share/elasticsearch/config/elasticsearch.key',
              certificate_authorities: ['/usr/share/elasticsearch/config/ca.crt'],
              verification_mode: 'none',
            },
          },
          authc: {
            anonymous: {
              username: '_anonymous',
              roles: [],
              authz_exception: true,
            },
          },
        },
      },
    };
  }

  getMergedConfig(): ElasticsearchConfig {
    const base = this.getBaseConfig();
    const helk = this.getHELKConfig();
    const securityOnion = this.getSecurityOnionConfig();

    // Deep merge configurations - SecurityOnion security settings take precedence
    return this.deepMerge(base, helk, securityOnion) as ElasticsearchConfig;
  }

  getIndexTemplates(): IndexTemplate[] {
    return [
      {
        name: 'helk-winevent-*',
        index_patterns: ['logs-winevent-*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            refresh_interval: '5s',
          },
        },
        priority: 100,
      },
      {
        name: 'helk-sysmon-*',
        index_patterns: ['logs-sysmon-*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            refresh_interval: '5s',
          },
        },
        priority: 100,
      },
    ];
  }

  getLifecyclePolicies(): LifecyclePolicy[] {
    return [
      {
        name: 'helk-logs-policy',
        phases: {
          hot: {
            min_age: '0ms',
            actions: {
              rollover: {
                max_age: '30d',
                max_primary_shard_size: '50gb',
              },
              set_priority: {
                priority: 100,
              },
            },
          },
          warm: {
            min_age: '30d',
            actions: {
              set_priority: {
                priority: 50,
              },
            },
          },
          cold: {
            min_age: '60d',
            actions: {
              set_priority: {
                priority: 0,
              },
            },
          },
          delete: {
            min_age: '365d',
            actions: {
              delete: {},
            },
          },
        },
      },
    ];
  }

  /**
   * Deep merge utility for combining configurations
   */
  private deepMerge(...objects: any[]): any {
    const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);

    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = [...pVal, ...oVal];
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = this.deepMerge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    }, {});
  }
}
