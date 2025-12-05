import { Client, ClientOptions, estypes } from '@elastic/elasticsearch';
import {
  IElasticsearchRepository,
  SearchResult,
  BulkIndexResult,
} from '../../domain/repositories/elasticsearch.repository.interface';
import { IndexName } from '../../domain/value-objects/index-name.vo';
import { QueryDSL } from '../../domain/value-objects/query-dsl.vo';

/**
 * Elasticsearch Repository Implementation
 *
 * Implements the IElasticsearchRepository interface using the @elastic/elasticsearch client.
 * Provides full CRUD operations, bulk indexing, index management, and health checks.
 *
 * Features:
 * - Connection management with retry logic
 * - Type-safe document operations with generics
 * - Error handling and mapping to domain errors
 * - Environment-based configuration
 * - TLS support for secure connections
 *
 * @example
 * ```typescript
 * const repository = new ElasticsearchRepository({
 *   node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
 *   auth: {
 *     username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
 *     password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
 *   }
 * });
 *
 * const indexName = IndexName.create('security-alerts');
 * const query = QueryDSL.matchAll();
 * const results = await repository.search(indexName, query);
 * ```
 */
export class ElasticsearchRepository implements IElasticsearchRepository {
  private client: Client;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // ms

  /**
   * Creates a new Elasticsearch repository instance
   *
   * @param options - Elasticsearch client configuration options
   *
   * @example
   * ```typescript
   * const repository = new ElasticsearchRepository({
   *   node: 'https://elasticsearch.example.com:9200',
   *   auth: { username: 'user', password: 'pass' },
   *   tls: { rejectUnauthorized: true }
   * });
   * ```
   */
  constructor(options: ClientOptions) {
    this.client = new Client(options);
  }

  /**
   * Searches documents in the specified index
   *
   * @template T - The document type
   * @param index - The index name to search in
   * @param query - The query DSL to execute
   * @returns Search results with documents and metadata
   *
   * @example
   * ```typescript
   * interface Alert { id: string; severity: string; }
   * const index = IndexName.create('alerts');
   * const query = QueryDSL.wildcard({ field: 'severity', value: 'high*' });
   * const results = await repository.search<Alert>(index, query);
   * ```
   */
  async search<T>(index: IndexName, query: QueryDSL): Promise<SearchResult<T>> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.search<T>({
          index: index.value,
          ...query.toElasticsearchQuery(),
        });
      });

      return {
        hits: response.hits.hits.map((hit) => ({
          _id: hit._id!,
          _source: hit._source as T,
          _score: hit._score,
        })),
        total: typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0,
        took: response.took,
      };
    } catch (error) {
      throw this.mapElasticsearchError(error, `Failed to search index ${index.value}`);
    }
  }

  /**
   * Gets a single document by ID
   *
   * @template T - The document type
   * @param index - The index name
   * @param id - The document ID
   * @returns The document or null if not found
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const document = await repository.getDocument<Alert>(index, 'alert-123');
   * ```
   */
  async getDocument<T>(index: IndexName, id: string): Promise<T | null> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.get<T>({
          index: index.value,
          id,
        });
      });

      return response._source || null;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      throw this.mapElasticsearchError(error, `Failed to get document ${id} from index ${index.value}`);
    }
  }

  /**
   * Indexes a single document
   *
   * @template T - The document type
   * @param index - The index name
   * @param document - The document to index
   * @param id - Optional document ID (auto-generated if not provided)
   * @returns The indexed document ID
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const alert = { severity: 'high', message: 'Threat detected' };
   * const id = await repository.indexDocument(index, alert, 'alert-123');
   * ```
   */
  async indexDocument<T>(
    index: IndexName,
    document: T,
    id?: string
  ): Promise<string> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.index({
          index: index.value,
          id,
          document: document as any,
        });
      });

      return response._id;
    } catch (error) {
      throw this.mapElasticsearchError(error, `Failed to index document in ${index.value}`);
    }
  }

  /**
   * Updates a document by ID
   *
   * @template T - The document type
   * @param index - The index name
   * @param id - The document ID
   * @param partialDocument - The partial document with fields to update
   * @returns True if updated, false if not found
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const updated = await repository.updateDocument(
   *   index,
   *   'alert-123',
   *   { status: 'resolved' }
   * );
   * ```
   */
  async updateDocument<T>(
    index: IndexName,
    id: string,
    partialDocument: Partial<T>
  ): Promise<boolean> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.update({
          index: index.value,
          id,
          doc: partialDocument as any,
        });
      });

      return response.result === 'updated' || response.result === 'noop';
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return false;
      }
      throw this.mapElasticsearchError(error, `Failed to update document ${id} in index ${index.value}`);
    }
  }

  /**
   * Deletes a document by ID
   *
   * @param index - The index name
   * @param id - The document ID
   * @returns True if deleted, false if not found
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const deleted = await repository.deleteDocument(index, 'alert-123');
   * ```
   */
  async deleteDocument(index: IndexName, id: string): Promise<boolean> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.delete({
          index: index.value,
          id,
        });
      });

      return response.result === 'deleted';
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return false;
      }
      throw this.mapElasticsearchError(error, `Failed to delete document ${id} from index ${index.value}`);
    }
  }

  /**
   * Indexes multiple documents in a single request
   *
   * @template T - The document type
   * @param index - The index name
   * @param documents - Array of documents to index
   * @returns Bulk indexing results with success/failure counts
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const alerts = [
   *   { id: '1', severity: 'high' },
   *   { id: '2', severity: 'low' }
   * ];
   * const result = await repository.bulkIndex(index, alerts);
   * console.log(`Indexed: ${result.indexed}, Failed: ${result.failed}`);
   * ```
   */
  async bulkIndex<T extends { id?: string }>(
    index: IndexName,
    documents: T[]
  ): Promise<BulkIndexResult> {
    try {
      const operations = documents.flatMap((doc) => [
        { index: { _index: index.value, _id: doc.id } },
        doc,
      ]);

      const response = await this.executeWithRetry(async () => {
        return await this.client.bulk({
          operations: operations as any,
        });
      });

      const result: BulkIndexResult = {
        took: response.took,
        indexed: 0,
        failed: 0,
        errors: [],
      };

      if (response.items) {
        response.items.forEach((item: any, idx: number) => {
          const operation = item.index || item.create;
          if (operation.error) {
            result.failed++;
            result.errors.push({
              index: idx,
              id: operation._id,
              error: operation.error.reason || 'Unknown error',
            });
          } else {
            result.indexed++;
          }
        });
      }

      return result;
    } catch (error) {
      throw this.mapElasticsearchError(error, `Failed to bulk index documents in ${index.value}`);
    }
  }

  /**
   * Creates a new index with optional mapping
   *
   * @param index - The index name
   * @param mapping - Optional index mapping configuration
   * @returns True if created successfully
   *
   * @example
   * ```typescript
   * const index = IndexName.create('security-alerts');
   * const mapping = {
   *   properties: {
   *     severity: { type: 'keyword' },
   *     timestamp: { type: 'date' }
   *   }
   * };
   * await repository.createIndex(index, mapping);
   * ```
   */
  async createIndex(
    index: IndexName,
    mapping?: estypes.MappingTypeMapping
  ): Promise<boolean> {
    try {
      await this.executeWithRetry(async () => {
        return await this.client.indices.create({
          index: index.value,
          mappings: mapping,
        });
      });

      return true;
    } catch (error: any) {
      if (error.meta?.body?.error?.type === 'resource_already_exists_exception') {
        return false;
      }
      throw this.mapElasticsearchError(error, `Failed to create index ${index.value}`);
    }
  }

  /**
   * Deletes an index
   *
   * @param index - The index name
   * @returns True if deleted, false if not found
   *
   * @example
   * ```typescript
   * const index = IndexName.create('old-alerts');
   * const deleted = await repository.deleteIndex(index);
   * ```
   */
  async deleteIndex(index: IndexName): Promise<boolean> {
    try {
      await this.executeWithRetry(async () => {
        return await this.client.indices.delete({
          index: index.value,
        });
      });

      return true;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return false;
      }
      throw this.mapElasticsearchError(error, `Failed to delete index ${index.value}`);
    }
  }

  /**
   * Gets the mapping for an index
   *
   * @param index - The index name
   * @returns The index mapping or null if not found
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * const mapping = await repository.getIndexMapping(index);
   * ```
   */
  async getIndexMapping(
    index: IndexName
  ): Promise<estypes.MappingTypeMapping | null> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.indices.getMapping({
          index: index.value,
        });
      });

      const indexMapping = response[index.value];
      return indexMapping?.mappings || null;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      throw this.mapElasticsearchError(error, `Failed to get mapping for index ${index.value}`);
    }
  }

  /**
   * Refreshes an index to make recent changes visible
   *
   * @param index - The index name
   *
   * @example
   * ```typescript
   * const index = IndexName.create('alerts');
   * await repository.refreshIndex(index);
   * ```
   */
  async refreshIndex(index: IndexName): Promise<void> {
    try {
      await this.executeWithRetry(async () => {
        return await this.client.indices.refresh({
          index: index.value,
        });
      });
    } catch (error) {
      throw this.mapElasticsearchError(error, `Failed to refresh index ${index.value}`);
    }
  }

  /**
   * Checks the health of the Elasticsearch cluster
   *
   * @returns Health status information
   *
   * @example
   * ```typescript
   * const health = await repository.healthCheck();
   * console.log(`Cluster status: ${health.status}`);
   * ```
   */
  async healthCheck(): Promise<{
    status: 'green' | 'yellow' | 'red';
    clusterName: string;
    numberOfNodes: number;
  }> {
    try {
      const response = await this.client.cluster.health();

      return {
        status: response.status,
        clusterName: response.cluster_name,
        numberOfNodes: response.number_of_nodes,
      };
    } catch (error) {
      throw this.mapElasticsearchError(error, 'Failed to check cluster health');
    }
  }

  /**
   * Closes the Elasticsearch client connection
   *
   * @example
   * ```typescript
   * await repository.close();
   * ```
   */
  async close(): Promise<void> {
    await this.client.close();
  }

  /**
   * Executes an operation with retry logic for transient failures
   *
   * @template T - The return type
   * @param operation - The async operation to execute
   * @returns The operation result
   * @throws Error if all retries exhausted
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry client errors (4xx)
        if (error.meta?.statusCode && error.meta.statusCode >= 400 && error.meta.statusCode < 500) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Maps Elasticsearch errors to domain-friendly error messages
   *
   * @param error - The Elasticsearch error
   * @param context - Additional context about the operation
   * @returns A domain error with useful information
   */
  private mapElasticsearchError(error: any, context: string): Error {
    const message = error.meta?.body?.error?.reason || error.message || 'Unknown Elasticsearch error';
    const statusCode = error.meta?.statusCode;

    let errorMessage = `${context}: ${message}`;
    if (statusCode) {
      errorMessage += ` (HTTP ${statusCode})`;
    }

    const domainError = new Error(errorMessage);
    domainError.name = 'ElasticsearchError';
    (domainError as any).statusCode = statusCode;
    (domainError as any).originalError = error;

    return domainError;
  }

  /**
   * Sleeps for the specified duration
   *
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
