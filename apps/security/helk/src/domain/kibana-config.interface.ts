/**
 * Kibana Configuration Domain Interface
 */

export interface KibanaServerConfig {
  host: string;
  port: number;
  name?: string;
  basePath?: string;
}

export interface KibanaElasticsearchConfig {
  hosts: string[];
  username?: string;
  password?: string;
  ssl?: {
    verificationMode?: string;
    certificateAuthorities?: string[];
  };
}

export interface KibanaConfig {
  server: KibanaServerConfig;
  elasticsearch: KibanaElasticsearchConfig;
  logging?: {
    quiet?: boolean;
    verbose?: boolean;
  };
  xpack?: {
    monitoring?: {
      enabled?: boolean;
    };
  };
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  panels: any[];
  timeRestore?: boolean;
  version?: string;
}
