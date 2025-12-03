/**
 * Response DTO for bulk indexing operations
 * 
 * @example
 * ```typescript
 * const bulkResponse: BulkIndexResponseDto = {
 *   took: 127,
 *   errors: false,
 *   items: [
 *     { index: { _id: '1', _index: 'logs-2024', status: 201, result: 'created' } },
 *     { index: { _id: '2', _index: 'logs-2024', status: 201, result: 'created' } }
 *   ]
 * };
 * ```
 */
export interface BulkIndexResponseDto {
  /** Time in milliseconds the bulk operation took */
  took: number;
  
  /** Whether any of the bulk operations had errors */
  errors: boolean;
  
  /** Array of individual operation results */
  items: Array<{
    /** Operation type and result */
    index?: BulkOperationResult;
    create?: BulkOperationResult;
    update?: BulkOperationResult;
    delete?: BulkOperationResult;
  }>;
}

/**
 * Result of an individual bulk operation
 */
export interface BulkOperationResult {
  /** Document ID */
  _id: string;
  
  /** Index name */
  _index: string;
  
  /** HTTP status code */
  status: number;
  
  /** Operation result (created, updated, deleted, noop) */
  result?: 'created' | 'updated' | 'deleted' | 'noop';
  
  /** Error information if the operation failed */
  error?: {
    type: string;
    reason: string;
    caused_by?: {
      type: string;
      reason: string;
    };
  };
  
  /** Document version */
  _version?: number;
  
  /** Sequence number */
  _seq_no?: number;
  
  /** Primary term */
  _primary_term?: number;
}
