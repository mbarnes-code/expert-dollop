import { ElasticsearchFieldMapping } from './create-index-request.dto';

/**
 * Response DTO for getting index mapping
 * 
 * @example
 * ```typescript
 * const mappingResponse: IndexMappingResponseDto = {
 *   index: 'security-alerts',
 *   mappings: {
 *     properties: {
 *       title: { type: 'text' },
 *       severity: { type: 'keyword' },
 *       timestamp: { type: 'date' }
 *     }
 *   }
 * };
 * ```
 */
export interface IndexMappingResponseDto {
  /** Index name */
  index: string;
  
  /** Index mappings */
  mappings: {
    properties: Record<string, ElasticsearchFieldMapping>;
    dynamic?: boolean | 'strict';
    _source?: {
      enabled: boolean;
    };
  };
}
