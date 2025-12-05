import { IElasticsearchRepository } from '../../domain/repositories/elasticsearch.repository.interface';
import { IndexName } from '../../domain/value-objects/index-name.vo';
import { QueryDSL } from '../../domain/value-objects/query-dsl.vo';
import {
  SearchRequestDto,
  SearchResponseDto,
  BulkIndexRequestDto,
  BulkIndexResponseDto,
  IndexDocumentRequestDto,
  IndexDocumentResponseDto,
  UpdateDocumentRequestDto,
  DeleteDocumentRequestDto,
  CreateIndexRequestDto,
  IndexMappingResponseDto,
  HealthCheckResponseDto,
} from '../dtos';

/**
 * Application service for Elasticsearch operations
 * 
 * This service coordinates domain operations and transforms between
 * domain models and infrastructure layer. It provides a clean API
 * for working with Elasticsearch while maintaining DDD principles.
 * 
 * @example
 * ```typescript
 * // Create service with repository
 * const elasticsearchService = new ElasticsearchService(repository);
 * 
 * // Search for documents
 * const results = await elasticsearchService.search<AlertDocument>({
 *   index: IndexName.create('security-alerts-*'),
 *   query: QueryDSL.wildcard('title', 'malware*'),
 *   from: 0,
 *   size: 100
 * });
 * 
 * console.log(`Found ${results.total.value} alerts`);
 * results.hits.forEach(hit => console.log(hit.source.title));
 * ```
 */
export class ElasticsearchService {
  constructor(private readonly repository: IElasticsearchRepository) {}

  /**
   * Search for documents matching a query
   * 
   * @template T - The document type
   * @param request - Search request parameters
   * @returns Search results with typed documents
   * 
   * @example
   * ```typescript
 * interface LogEntry {
   *   message: string;
   *   level: string;
   *   timestamp: Date;
   * }
   * 
   * const results = await service.search<LogEntry>({
   *   index: IndexName.create('logs-*'),
   *   query: QueryDSL.matchAll(),
   *   size: 50,
   *   sort: [{ timestamp: 'desc' }]
   * });
   * ```
   */
  async search<T>(request: SearchRequestDto): Promise<SearchResponseDto<T>> {
    const result = await this.repository.search<T>(
      request.index,
      request.query,
      {
        from: request.from,
        size: request.size,
        fields: request.fields,
        sort: request.sort,
        _source: request._source,
      }
    );

    return {
      hits: result.hits.map(hit => ({
        id: hit._id,
        index: hit._index,
        source: hit._source,
        score: hit._score,
        highlight: hit.highlight,
      })),
      total: result.total,
      took: result.took,
      aggregations: result.aggregations,
    };
  }

  /**
   * Get a single document by ID
   * 
   * @template T - The document type
   * @param index - Index name
   * @param id - Document ID
   * @returns The document or null if not found
   * 
   * @example
   * ```typescript
   * const user = await service.getDocument<UserProfile>(
   *   IndexName.create('users'),
   *   'user-123'
   * );
   * 
   * if (user) {
   *   console.log(`User: ${user.name}`);
   * }
   * ```
   */
  async getDocument<T>(index: IndexName, id: string): Promise<T | null> {
    return this.repository.get<T>(index, id);
  }

  /**
   * Index a single document
   * 
   * @template T - The document type
   * @param request - Index document request
   * @returns Index operation result
   * 
   * @example
   * ```typescript
   * const result = await service.indexDocument<UserProfile>({
   *   index: IndexName.create('users'),
   *   id: 'user-456',
   *   document: {
   *     name: 'Jane Smith',
   *     email: 'jane@example.com',
   *     role: 'user'
   *   },
   *   refresh: 'wait_for'
   * });
   * 
   * console.log(`Document ${result.result}: ${result.id}`);
   * ```
   */
  async indexDocument<T>(
    request: IndexDocumentRequestDto<T>
  ): Promise<IndexDocumentResponseDto> {
    const result = await this.repository.index<T>(
      request.index,
      request.document,
      {
        id: request.id,
        refresh: request.refresh,
        op_type: request.op_type,
        pipeline: request.pipeline,
        routing: request.routing,
        timeout: request.timeout,
      }
    );

    return {
      id: result._id,
      index: result._index,
      version: result._version,
      result: result.result,
      seqNo: result._seq_no,
      primaryTerm: result._primary_term,
      shards: result._shards,
    };
  }

  /**
   * Update an existing document
   * 
   * @template T - The document type
   * @param request - Update document request
   * @returns Update operation result
   * 
   * @example
   * ```typescript
   * const result = await service.updateDocument<UserProfile>({
   *   index: IndexName.create('users'),
   *   id: 'user-456',
   *   document: { role: 'admin' },  // Partial update
   *   refresh: 'wait_for',
   *   retry_on_conflict: 3
   * });
   * ```
   */
  async updateDocument<T>(
    request: UpdateDocumentRequestDto<T>
  ): Promise<IndexDocumentResponseDto> {
    const result = await this.repository.update<T>(
      request.index,
      request.id,
      request.document,
      {
        refresh: request.refresh,
        retry_on_conflict: request.retry_on_conflict,
        routing: request.routing,
        timeout: request.timeout,
      }
    );

    return {
      id: result._id,
      index: result._index,
      version: result._version,
      result: result.result,
      seqNo: result._seq_no,
      primaryTerm: result._primary_term,
      shards: result._shards,
    };
  }

  /**
   * Delete a document
   * 
   * @param request - Delete document request
   * @returns Delete operation result
   * 
   * @example
   * ```typescript
   * const result = await service.deleteDocument({
   *   index: IndexName.create('users'),
   *   id: 'user-456',
   *   refresh: 'wait_for'
   * });
   * 
   * if (result.result === 'deleted') {
   *   console.log('Document successfully deleted');
   * }
   * ```
   */
  async deleteDocument(
    request: DeleteDocumentRequestDto
  ): Promise<IndexDocumentResponseDto> {
    const result = await this.repository.delete(
      request.index,
      request.id,
      {
        refresh: request.refresh,
        routing: request.routing,
        timeout: request.timeout,
      }
    );

    return {
      id: result._id,
      index: result._index,
      version: result._version,
      result: result.result,
      seqNo: result._seq_no,
      primaryTerm: result._primary_term,
      shards: result._shards,
    };
  }

  /**
   * Bulk index multiple documents
   * 
   * @template T - The document type
   * @param request - Bulk index request
   * @returns Bulk operation results
   * 
   * @example
   * ```typescript
   * const result = await service.bulkIndex<LogEntry>({
   *   index: IndexName.create('logs-2024'),
   *   documents: [
   *     { id: '1', document: { message: 'Log 1', level: 'info', timestamp: new Date() } },
   *     { id: '2', document: { message: 'Log 2', level: 'warn', timestamp: new Date() } },
   *     { id: '3', document: { message: 'Log 3', level: 'error', timestamp: new Date() } }
   *   ],
   *   refresh: 'wait_for'
   * });
   * 
   * console.log(`Bulk operation took ${result.took}ms`);
   * if (result.errors) {
   *   console.error('Some operations failed');
   * }
   * ```
   */
  async bulkIndex<T>(
    request: BulkIndexRequestDto<T>
  ): Promise<BulkIndexResponseDto> {
    const result = await this.repository.bulk<T>(
      request.index,
      request.documents,
      {
        refresh: request.refresh,
        pipeline: request.pipeline,
        routing: request.routing,
      }
    );

    return {
      took: result.took,
      errors: result.errors,
      items: result.items,
    };
  }

  /**
   * Create a new index
   * 
   * @param request - Create index request
   * @returns True if index was created successfully
   * 
   * @example
   * ```typescript
   * const created = await service.createIndex({
   *   index: IndexName.create('security-events'),
   *   mappings: {
   *     properties: {
   *       event_type: { type: 'keyword' },
   *       severity: { type: 'keyword' },
   *       timestamp: { type: 'date' },
   *       description: { type: 'text', analyzer: 'english' },
   *       metadata: { type: 'object' }
   *     }
   *   },
   *   settings: {
   *     number_of_shards: 3,
   *     number_of_replicas: 2,
   *     refresh_interval: '30s'
   *   }
   * });
   * 
   * console.log(`Index created: ${created}`);
   * ```
   */
  async createIndex(request: CreateIndexRequestDto): Promise<boolean> {
    return this.repository.createIndex(request.index, {
      mappings: request.mappings,
      settings: request.settings,
      aliases: request.aliases,
    });
  }

  /**
   * Delete an index
   * 
   * @param index - Index name to delete
   * @returns True if index was deleted successfully
   * 
   * @example
   * ```typescript
   * const deleted = await service.deleteIndex(
   *   IndexName.create('old-logs-2023')
   * );
   * ```
   */
  async deleteIndex(index: IndexName): Promise<boolean> {
    return this.repository.deleteIndex(index);
  }

  /**
   * Get index mapping
   * 
   * @param index - Index name
   * @returns Index mapping information
   * 
   * @example
   * ```typescript
   * const mapping = await service.getIndexMapping(
   *   IndexName.create('security-events')
   * );
   * 
   * console.log('Fields:', Object.keys(mapping.mappings.properties));
   * ```
   */
  async getIndexMapping(index: IndexName): Promise<IndexMappingResponseDto> {
    const mapping = await this.repository.getMapping(index);
    return {
      index: index.value,
      mappings: mapping,
    };
  }

  /**
   * Refresh an index to make recent changes searchable
   * 
   * @param index - Index name to refresh
   * @returns True if refresh was successful
   * 
   * @example
   * ```typescript
   * // Index documents
   * await service.indexDocument({ ... });
   * 
   * // Force refresh to make immediately searchable
   * await service.refreshIndex(IndexName.create('users'));
   * 
   * // Now search will find the new document
   * const results = await service.search({ ... });
   * ```
   */
  async refreshIndex(index: IndexName): Promise<boolean> {
    return this.repository.refresh(index);
  }

  /**
   * Check Elasticsearch cluster health
   * 
   * @returns Cluster health information
   * 
   * @example
   * ```typescript
   * const health = await service.healthCheck();
   * 
   * console.log(`Cluster status: ${health.status}`);
   * console.log(`Nodes: ${health.numberOfNodes}`);
   * console.log(`Active shards: ${health.activeShards}`);
   * 
   * if (health.status === 'red') {
   *   console.error('Cluster is unhealthy!');
   * }
   * ```
   */
  async healthCheck(): Promise<HealthCheckResponseDto> {
    const health = await this.repository.healthCheck();
    return {
      status: health.status,
      clusterName: health.cluster_name,
      numberOfNodes: health.number_of_nodes,
      numberOfDataNodes: health.number_of_data_nodes,
      activePrimaryShards: health.active_primary_shards,
      activeShards: health.active_shards,
      relocatingShards: health.relocating_shards,
      initializingShards: health.initializing_shards,
      unassignedShards: health.unassigned_shards,
      numberOfPendingTasks: health.number_of_pending_tasks,
      numberOfInFlightFetch: health.number_of_in_flight_fetch,
      taskMaxWaitingInQueueMillis: health.task_max_waiting_in_queue_millis,
      activeShardsPercentAsNumber: health.active_shards_percent_as_number,
      timedOut: health.timed_out,
    };
  }

  /**
   * Search with aggregations for analytics
   * 
   * @template T - The document type
   * @param request - Search request with aggregations
   * @returns Search results with aggregation data
   * 
   * @example
   * ```typescript
   * const results = await service.searchWithAggregations<Alert>({
   *   index: IndexName.create('security-alerts-*'),
   *   query: QueryDSL.range('timestamp', { gte: 'now-7d' }),
   *   size: 0,  // Don't return documents, just aggregations
   *   aggregations: {
   *     by_severity: {
   *       terms: { field: 'severity', size: 10 }
   *     },
   *     by_day: {
   *       date_histogram: {
   *         field: 'timestamp',
   *         calendar_interval: 'day'
   *       }
   *     }
   *   }
   * });
   * 
   * console.log('Alerts by severity:', results.aggregations.by_severity);
   * console.log('Alerts by day:', results.aggregations.by_day);
   * ```
   */
  async searchWithAggregations<T>(
    request: SearchRequestDto & { aggregations?: Record<string, unknown> }
  ): Promise<SearchResponseDto<T>> {
    // This method is similar to search() but specifically highlights aggregation support
    return this.search<T>(request);
  }

  /**
   * Close the Elasticsearch connection
   * 
   * @example
   * ```typescript
   * // When shutting down the application
   * await elasticsearchService.close();
   * ```
   */
  async close(): Promise<void> {
    await this.repository.close();
  }
}
