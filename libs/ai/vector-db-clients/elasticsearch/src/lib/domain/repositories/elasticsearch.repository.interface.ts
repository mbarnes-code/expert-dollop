/**
 * Elasticsearch Client Repository Interface
 * 
 * Defines the contract for Elasticsearch operations.
 * Following Repository pattern from DDD.
 * 
 * This interface abstracts the underlying Elasticsearch client implementation,
 * allowing for:
 * - Easy testing with mock implementations
 * - Swapping Elasticsearch client versions
 * - Adding caching or other cross-cutting concerns
 */

import { QueryDSL } from '../value-objects/query-dsl.vo';
import { IndexName } from '../value-objects/index-name.vo';

export interface SearchResult<T = unknown> {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: T;
    }>;
  };
  took: number;
  timed_out: boolean;
}

export interface BulkOperation {
  index?: {
    _index: string;
    _id?: string;
  };
  create?: {
    _index: string;
    _id?: string;
  };
  update?: {
    _index: string;
    _id: string;
  };
  delete?: {
    _index: string;
    _id: string;
  };
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: Array<Record<string, unknown>>;
}

/**
 * Repository interface for Elasticsearch operations
 */
export interface IElasticsearchRepository {
  /**
   * Search documents in an index
   */
  search<T = unknown>(index: IndexName, query: QueryDSL): Promise<SearchResult<T>>;

  /**
   * Get a document by ID
   */
  get<T = unknown>(index: IndexName, id: string): Promise<T | null>;

  /**
   * Index a document
   */
  index<T = unknown>(index: IndexName, document: T, id?: string): Promise<{ _id: string; result: string }>;

  /**
   * Update a document
   */
  update<T = unknown>(index: IndexName, id: string, document: Partial<T>): Promise<{ _id: string; result: string }>;

  /**
   * Delete a document
   */
  delete(index: IndexName, id: string): Promise<{ _id: string; result: string }>;

  /**
   * Bulk operations
   */
  bulk(operations: Array<BulkOperation | Record<string, unknown>>): Promise<BulkResponse>;

  /**
   * Check if index exists
   */
  indexExists(index: IndexName): Promise<boolean>;

  /**
   * Create index
   */
  createIndex(index: IndexName, settings?: Record<string, unknown>): Promise<void>;

  /**
   * Delete index
   */
  deleteIndex(index: IndexName): Promise<void>;

  /**
   * Get index mapping
   */
  getMapping(index: IndexName): Promise<Record<string, unknown>>;

  /**
   * Update index mapping
   */
  putMapping(index: IndexName, mapping: Record<string, unknown>): Promise<void>;

  /**
   * Refresh index (make recent changes searchable)
   */
  refresh(index?: IndexName): Promise<void>;

  /**
   * Health check
   */
  ping(): Promise<boolean>;

  /**
   * Close connection
   */
  close(): Promise<void>;
}
