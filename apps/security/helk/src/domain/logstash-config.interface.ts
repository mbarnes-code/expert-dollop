/**
 * Logstash Configuration Domain Interface
 */

export interface LogstashInputConfig {
  type: string;
  port?: number;
  host?: string;
  codec?: string;
  tags?: string[];
  [key: string]: any;
}

export interface LogstashFilterConfig {
  type: string;
  match?: Record<string, any>;
  add_field?: Record<string, any>;
  add_tag?: string[];
  remove_field?: string[];
  [key: string]: any;
}

export interface LogstashOutputConfig {
  type: string;
  hosts?: string[];
  index?: string;
  document_type?: string;
  [key: string]: any;
}

export interface LogstashPipelineConfig {
  'pipeline.id': string;
  'pipeline.workers'?: number;
  'pipeline.batch.size'?: number;
  'pipeline.batch.delay'?: number;
  path?: {
    config?: string;
  };
  config?: {
    reload?: {
      automatic?: boolean;
      interval?: string;
    };
  };
}

export interface Pipeline {
  name: string;
  path: string;
  priority: number;
  type: 'input' | 'filter' | 'output';
  description?: string;
}
