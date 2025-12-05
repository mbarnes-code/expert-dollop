import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for updating a document
 * 
 * @template T - The document type (partial updates supported)
 * 
 * @example
 * ```typescript
 * interface UserProfile {
 *   name: string;
 *   email: string;
 *   role: string;
 * }
 * 
 * const updateRequest: UpdateDocumentRequestDto<Partial<UserProfile>> = {
 *   index: IndexName.create('users'),
 *   id: 'user-123',
 *   document: {
 *     role: 'moderator'  // Only update the role field
 *   },
 *   refresh: 'wait_for'
 * };
 * ```
 */
export interface UpdateDocumentRequestDto<T> {
  /** Index name where the document exists */
  index: IndexName;
  
  /** Document ID to update */
  id: string;
  
  /** Partial document with fields to update */
  document: Partial<T>;
  
  /** Refresh policy: 'true' (immediate), 'false' (eventual), 'wait_for' (wait for refresh) */
  refresh?: 'true' | 'false' | 'wait_for';
  
  /** Number of retry attempts for version conflicts */
  retry_on_conflict?: number;
  
  /** Routing value for the document */
  routing?: string;
  
  /** Timeout for the operation */
  timeout?: string;
  
  /** Whether to insert the document if it doesn't exist (upsert) */
  upsert?: T;
}
