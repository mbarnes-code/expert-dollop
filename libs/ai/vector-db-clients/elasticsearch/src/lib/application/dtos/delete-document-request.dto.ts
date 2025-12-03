import { IndexName } from '../../domain/value-objects/index-name.vo';

/**
 * Request DTO for deleting a document
 * 
 * @example
 * ```typescript
 * const deleteRequest: DeleteDocumentRequestDto = {
 *   index: IndexName.create('users'),
 *   id: 'user-123',
 *   refresh: 'wait_for'
 * };
 * ```
 */
export interface DeleteDocumentRequestDto {
  /** Index name where the document exists */
  index: IndexName;
  
  /** Document ID to delete */
  id: string;
  
  /** Refresh policy: 'true' (immediate), 'false' (eventual), 'wait_for' (wait for refresh) */
  refresh?: 'true' | 'false' | 'wait_for';
  
  /** Routing value for the document */
  routing?: string;
  
  /** Timeout for the operation */
  timeout?: string;
}
