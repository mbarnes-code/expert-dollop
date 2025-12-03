import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for creating an index
 * 
 * @example
 * ```typescript
 * const createIndexRequest: CreateIndexRequestDto = {
 *   index: IndexName.create('security-alerts'),
 *   mappings: {
 *     properties: {
 *       title: { type: 'text' },
 *       severity: { type: 'keyword' },
 *       timestamp: { type: 'date' },
 *       description: { type: 'text', analyzer: 'english' }
 *     }
 *   },
 *   settings: {
 *     number_of_shards: 3,
 *     number_of_replicas: 2,
 *     refresh_interval: '30s'
 *   }
 * };
 * ```
 */
export interface CreateIndexRequestDto {
  /** Index name to create */
  index: IndexName;
  
  /** Index mappings - field definitions */
  mappings?: {
    properties: Record<string, ElasticsearchFieldMapping>;
    dynamic?: boolean | 'strict';
    _source?: {
      enabled: boolean;
    };
  };
  
  /** Index settings - shards, replicas, analyzers, etc. */
  settings?: {
    number_of_shards?: number;
    number_of_replicas?: number;
    refresh_interval?: string;
    max_result_window?: number;
    analysis?: {
      analyzer?: Record<string, unknown>;
      tokenizer?: Record<string, unknown>;
      filter?: Record<string, unknown>;
    };
  };
  
  /** Index aliases */
  aliases?: Record<string, {
    filter?: unknown;
    routing?: string;
  }>;
}

/**
 * Elasticsearch field mapping definition
 */
export interface ElasticsearchFieldMapping {
  /** Field type */
  type: 'text' | 'keyword' | 'date' | 'long' | 'double' | 'boolean' | 'ip' | 'object' | 'nested' | 'geo_point' | 'geo_shape';
  
  /** Analyzer for text fields */
  analyzer?: string;
  
  /** Search analyzer */
  search_analyzer?: string;
  
  /** Field format (for dates) */
  format?: string;
  
  /** Whether the field is indexed */
  index?: boolean;
  
  /** Whether the field is stored */
  store?: boolean;
  
  /** Nested properties (for object/nested types) */
  properties?: Record<string, ElasticsearchFieldMapping>;
  
  /** Fields for multi-field mapping */
  fields?: Record<string, ElasticsearchFieldMapping>;
  
  /** Copy to other fields */
  copy_to?: string | string[];
  
  /** Null value to use */
  null_value?: unknown;
  
  /** Whether to accept malformed values */
  ignore_malformed?: boolean;
}
