/**
 * Elasticsearch Configuration Domain Interface
 * Following DDD principles for configuration management
 */

export interface ClusterConfig {
  name: string;
  routing?: {
    allocation?: {
      disk?: {
        threshold_enabled?: boolean;
        watermark?: {
          flood_stage?: string;
          high?: string;
          low?: string;
        };
      };
    };
  };
}

export interface NodeConfig {
  name?: string;
  attr?: Record<string, string>;
}

export interface NetworkConfig {
  host: string;
  port?: number;
}

export interface SecurityConfig {
  enabled: boolean;
  http?: {
    ssl?: {
      enabled: boolean;
      certificate?: string;
      key?: string;
      certificate_authorities?: string[];
      client_authentication?: string;
    };
  };
  transport?: {
    ssl?: {
      enabled: boolean;
      certificate?: string;
      key?: string;
      certificate_authorities?: string[];
      verification_mode?: string;
    };
  };
  authc?: {
    anonymous?: {
      username?: string;
      roles?: string[];
      authz_exception?: boolean;
    };
  };
}

export interface XPackConfig {
  monitoring?: {
    collection?: {
      enabled: boolean;
    };
  };
  ml?: {
    enabled: boolean;
  };
  security: SecurityConfig;
}

export interface PathConfig {
  data?: string;
  logs: string;
}

export interface DiscoveryConfig {
  type?: string;
  zen?: {
    minimum_master_nodes?: number;
  };
}

export interface IndicesConfig {
  query?: {
    bool?: {
      max_clause_count?: number;
    };
  };
  id_field_data?: {
    enabled?: boolean;
  };
}

export interface ElasticsearchConfig {
  cluster?: ClusterConfig;
  node?: NodeConfig;
  network: NetworkConfig;
  path: PathConfig;
  discovery?: DiscoveryConfig;
  bootstrap?: {
    memory_lock: boolean;
  };
  indices?: IndicesConfig;
  xpack?: XPackConfig;
  action?: {
    destructive_requires_name?: boolean;
  };
  script?: {
    max_compilations_rate?: string;
  };
  transport?: {
    bind_host?: string;
    publish_port?: number;
  };
  logger?: {
    org?: {
      elasticsearch?: {
        deprecation?: string;
      };
    };
  };
}

export interface IndexTemplate {
  name: string;
  index_patterns: string[];
  template: {
    settings: Record<string, any>;
    mappings?: Record<string, any>;
  };
  composed_of?: string[];
  priority?: number;
}

export interface LifecyclePolicy {
  name: string;
  phases: {
    hot?: any;
    warm?: any;
    cold?: any;
    delete?: any;
  };
}
