import { QueryDSL } from '../../domain/value-objects/query-dsl.vo';
import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for searching documents in Elasticsearch
 * 
 * @example
 * ```typescript
 * const searchRequest: SearchRequestDto = {
 *   index: IndexName.create('security-alerts-*'),
 *   query: QueryDSL.matchAll(),
 *   from: 0,
 *   size: 100,
 *   fields: ['title', 'severity', 'timestamp'],
 *   sort: [{ timestamp: 'desc' }]
 * };
 * ```
 */
export interface SearchRequestDto {
  /** Index name or pattern to search */
  index: IndexName;
  
  /** Query DSL for filtering documents */
  query: QueryDSL;
  
  /** Offset for pagination (default: 0) */
  from?: number;
  
  /** Number of results to return (default: 10, max: 10000) */
  size?: number;
  
  /** Fields to include in results (default: all fields) */
  fields?: string[];
  
  /** Sort order for results */
  sort?: Array<{ [field: string]: 'asc' | 'desc' }>;
  
  /** Source filtering - include/exclude fields */
  _source?: boolean | string[] | {
    includes?: string[];
    excludes?: string[];
  };
}
