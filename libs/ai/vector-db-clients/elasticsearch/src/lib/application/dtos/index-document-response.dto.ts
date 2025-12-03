/**
 * Response DTO for index/update/delete document operations
 * 
 * @example
 * ```typescript
 * const indexResponse: IndexDocumentResponseDto = {
 *   id: 'user-123',
 *   index: 'users',
 *   version: 1,
 *   result: 'created',
 *   seqNo: 42,
 *   primaryTerm: 1
 * };
 * ```
 */
export interface IndexDocumentResponseDto {
  /** Document ID */
  id: string;
  
  /** Index name */
  index: string;
  
  /** Document version */
  version: number;
  
  /** Operation result */
  result: 'created' | 'updated' | 'deleted' | 'noop' | 'not_found';
  
  /** Sequence number */
  seqNo?: number;
  
  /** Primary term */
  primaryTerm?: number;
  
  /** Shards information */
  shards?: {
    total: number;
    successful: number;
    failed: number;
  };
}
