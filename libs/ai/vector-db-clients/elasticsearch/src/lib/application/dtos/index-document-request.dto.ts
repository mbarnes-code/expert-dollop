import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for indexing a single document
 * 
 * @template T - The document type
 * 
 * @example
 * ```typescript
 * interface UserProfile {
 *   name: string;
 *   email: string;
 *   role: string;
 * }
 * 
 * const indexRequest: IndexDocumentRequestDto<UserProfile> = {
 *   index: IndexName.create('users'),
 *   id: 'user-123',
 *   document: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     role: 'admin'
 *   },
 *   refresh: 'wait_for'
 * };
 * ```
 */
export interface IndexDocumentRequestDto<T> {
  /** Index name to store the document */
  index: IndexName;
  
  /** Document ID (optional - auto-generated if not provided) */
  id?: string;
  
  /** The document to index */
  document: T;
  
  /** Refresh policy: 'true' (immediate), 'false' (eventual), 'wait_for' (wait for refresh) */
  refresh?: 'true' | 'false' | 'wait_for';
  
  /** Operation type: 'index' (upsert) or 'create' (fail if exists) */
  op_type?: 'index' | 'create';
  
  /** Pipeline to use for processing the document */
  pipeline?: string;
  
  /** Routing value for the document */
  routing?: string;
  
  /** Timeout for the operation */
  timeout?: string;
}
