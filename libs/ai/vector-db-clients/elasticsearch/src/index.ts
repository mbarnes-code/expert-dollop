/**
 * Elasticsearch Vector DB Client Library
 * 
 * Provides a clean, type-safe interface to Elasticsearch for AI/ML workloads.
 * 
 * Architecture: Domain-Driven Design (DDD)
 * - Domain Layer: Entities, Value Objects, Repository Interfaces
 * - Application Layer: Services, DTOs
 * - Infrastructure Layer: Elasticsearch Client Implementation
 * 
 * Extracted from: SecurityOnion Elasticsearch Analyzer
 * Migration Pattern: Strangler Fig
 */

// Domain Layer Exports
export { IndexName } from './lib/domain/value-objects/index-name.vo';
export { QueryDSL, QueryDSLOptions } from './lib/domain/value-objects/query-dsl.vo';
export {
  IElasticsearchRepository,
  SearchResult,
  BulkOperation,
  BulkResponse
} from './lib/domain/repositories/elasticsearch.repository.interface';

// Application Layer Exports
export { ElasticsearchService } from './lib/application/services/elasticsearch.service';
export * from './lib/application/dtos';

// Infrastructure Layer Exports
export { ElasticsearchRepository } from './lib/infrastructure/repositories/elasticsearch.repository';
export * from './lib/infrastructure/patterns';
