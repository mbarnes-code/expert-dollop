/**
 * Jupyter and Spark Configuration Domain Interfaces
 */

export interface JupyterConfig {
  ip: string;
  port: number;
  allow_origin?: string;
  token?: string;
  notebook_dir?: string;
  ServerApp?: {
    token?: string;
    password?: string;
    allow_origin?: string;
  };
}

export interface SparkConfig {
  master: string;
  app_name?: string;
  executor?: {
    memory?: string;
    cores?: number;
  };
  driver?: {
    memory?: string;
    maxResultSize?: string;
  };
  jars?: {
    packages?: string[];
    repositories?: string[];
  };
}

export interface NotebookMetadata {
  name: string;
  path: string;
  category: 'tutorial' | 'sigma' | 'demo' | 'analysis';
  description?: string;
  requires?: string[];
}
