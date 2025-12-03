/**
 * Response DTO for search operations
 * 
 * Generic type T represents the document type
 * 
 * @template T - The document type
 * 
 * @example
 * ```typescript
 * interface AlertDocument {
 *   title: string;
 *   severity: string;
 *   timestamp: Date;
 * }
 * 
 * const response: SearchResponseDto<AlertDocument> = {
 *   hits: [
 *     { id: '1', index: 'alerts-2024', source: { title: 'Alert', severity: 'high', timestamp: new Date() } }
 *   ],
 *   total: { value: 42, relation: 'eq' },
 *   took: 15
 * };
 * ```
 */
export interface SearchResponseDto<T> {
  /** Array of search hits */
  hits: Array<{
    /** Document ID */
    id: string;
    
    /** Index name */
    index: string;
    
    /** Document source */
    source: T;
    
    /** Search score (optional) */
    score?: number;
    
    /** Highlight results (optional) */
    highlight?: Record<string, string[]>;
  }>;
  
  /** Total hits information */
  total: {
    /** Total number of hits */
    value: number;
    
    /** Relation to the total (eq or gte) */
    relation: 'eq' | 'gte';
  };
  
  /** Time in milliseconds the search took */
  took: number;
  
  /** Aggregation results (optional) */
  aggregations?: Record<string, unknown>;
}
