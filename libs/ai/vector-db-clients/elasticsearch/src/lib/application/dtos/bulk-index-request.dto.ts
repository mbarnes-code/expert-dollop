import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for bulk indexing operations
 * 
 * @template T - The document type
 * 
 * @example
 * ```typescript
 * interface LogEntry {
 *   message: string;
 *   level: string;
 *   timestamp: Date;
 * }
 * 
 * const bulkRequest: BulkIndexRequestDto<LogEntry> = {
 *   index: IndexName.create('logs-2024'),
 *   documents: [
 *     { id: '1', document: { message: 'App started', level: 'info', timestamp: new Date() } },
 *     { id: '2', document: { message: 'Error occurred', level: 'error', timestamp: new Date() } }
 *   ],
 *   refresh: 'wait_for'
 * };
 * ```
 */
export interface BulkIndexRequestDto<T> {
  /** Index name to bulk index into */
  index: IndexName;
  
  /** Array of documents to index */
  documents: Array<{
    /** Optional document ID (auto-generated if not provided) */
    id?: string;
    
    /** The document to index */
    document: T;
  }>;
  
  /** Refresh policy: 'true' (immediate), 'false' (eventual), 'wait_for' (wait for refresh) */
  refresh?: 'true' | 'false' | 'wait_for';
  
  /** Pipeline to use for processing documents */
  pipeline?: string;
  
  /** Routing value for the documents */
  routing?: string;
}
