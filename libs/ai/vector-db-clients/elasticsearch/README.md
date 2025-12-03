# @expert-dollop/ai-vector-db-clients-elasticsearch

Enterprise-grade Elasticsearch client library for AI/ML workloads.

**Status:** 🟡 In Progress (Domain Layer Complete - 30%)  
**Architecture:** Domain-Driven Design (DDD) with Clean Architecture  
**Migration Pattern:** Strangler Fig from SecurityOnion Elasticsearch Analyzer

---

## Overview

This library provides a clean, type-safe abstraction over Elasticsearch for use in AI and security applications across the monorepo. It extracts and enhances the Elasticsearch integration patterns from SecurityOnion's analyzer system.

### Key Features

- ✅ **Type-Safe Query Builder**: Build complex Elasticsearch queries with full TypeScript support
- ✅ **Domain-Driven Design**: Clean separation of concerns with DDD principles
- ✅ **Validated Value Objects**: Index names and queries validated at creation time
- ⏳ **Connection Pooling**: Efficient connection management (planned)
- ⏳ **Retry Logic**: Circuit breaker and exponential backoff (planned)
- ⏳ **Bulk Operations**: Efficient batch indexing and updates (planned)
- ⏳ **Index Management**: Create, delete, and manage indices (planned)

---

## Installation

```bash
npm install @expert-dollop/ai-vector-db-clients-elasticsearch
```

## Usage

### Basic Search (Domain Layer - COMPLETE)

```typescript
import {
  IndexName,
  QueryDSL,
  IElasticsearchRepository
} from '@expert-dollop/ai-vector-db-clients-elasticsearch';

// Create validated index name
const index = IndexName.create('security-alerts');

// Build a query with QueryDSL value object
const query = QueryDSL.wildcard('signature', '*malware*', {
  from: 0,
  size: 10
});

// Use the repository interface (implementation pending)
// const repo: IElasticsearchRepository = ...;
// const results = await repo.search(index, query);
```

### Boolean Query with Filters

```typescript
import { QueryDSL } from '@expert-dollop/ai-vector-db-clients-elasticsearch';

// Complex boolean query with time range filter
const query = QueryDSL.bool({
  must: [
    { wildcard: { 'event.category': '*intrusion*' } }
  ],
  filter: QueryDSL.range('@timestamp', {
    gte: '2024-01-01T00:00:00',
    lte: '2024-12-31T23:59:59'
  }),
  size: 100
});
```

### Match All Query

```typescript
import { QueryDSL } from '@expert-dollop/ai-vector-db-clients-elasticsearch';

// Simple match all query
const query = QueryDSL.matchAll(50);
```

---

## Architecture

### DDD Layers

```
libs/ai/vector-db-clients/elasticsearch/
├── src/
│   ├── lib/
│   │   ├── domain/                    ✅ COMPLETE
│   │   │   ├── value-objects/
│   │   │   │   ├── index-name.vo.ts          # Validated index names
│   │   │   │   └── query-dsl.vo.ts           # Type-safe query builder
│   │   │   └── repositories/
│   │   │       └── elasticsearch.repository.interface.ts  # Repository contract
│   │   ├── application/               ⏳ PENDING
│   │   │   ├── services/
│   │   │   │   └── elasticsearch.service.ts  # Business logic
│   │   │   └── dtos/
│   │   │       ├── search-request.dto.ts
│   │   │       └── search-response.dto.ts
│   │   └── infrastructure/            ⏳ PENDING
│   │       ├── repositories/
│   │       │   └── elasticsearch.repository.ts    # @elastic/elasticsearch implementation
│   │       ├── client/
│   │       │   ├── elasticsearch-client.config.ts # Connection configuration
│   │       │   ├── connection-pool.ts             # Pool management
│   │       │   └── retry-strategy.ts              # Circuit breaker & retry
│   │       └── query/
│   │           └── query-builder.ts               # Advanced query utilities
│   └── index.ts
```

### Design Principles

**Domain-Driven Design (DDD)**
- **Value Objects**: `IndexName`, `QueryDSL` - Immutable, self-validating
- **Repository Pattern**: Abstract data access behind `IElasticsearchRepository`
- **Ubiquitous Language**: Domain terminology (Index, Query, Document, Search)

**SOLID Principles**
- **Single Responsibility**: Each class has one reason to change
- **Dependency Inversion**: Depend on abstractions (IElasticsearchRepository)
- **Interface Segregation**: Clean, focused interfaces

**Type Safety**
- Full TypeScript strict mode
- Generic types for document shapes
- Compile-time query validation

---

## Domain Model

### Value Objects

#### IndexName

Represents a validated Elasticsearch index name following Elasticsearch naming rules:
- Must be lowercase
- Cannot contain special characters: `\, /, *, ?, ", <, >, |, space, comma, #`
- Cannot start with `-, _, +`
- Cannot be `.` or `..`
- Cannot exceed 255 bytes

```typescript
// Valid
const index1 = IndexName.create('security-alerts');
const index2 = IndexName.create('logs-2024.01.01');

// Invalid - throws errors
IndexName.create('UPPERCASE');     // Error: must be lowercase
IndexName.create('has spaces');    // Error: invalid characters
IndexName.create('-starts-dash');  // Error: cannot start with -
```

#### QueryDSL

Type-safe Elasticsearch Query DSL builder with validation:

**Factory Methods:**
- `QueryDSL.matchAll(size)` - Match all documents
- `QueryDSL.wildcard(field, value, options)` - Wildcard search
- `QueryDSL.bool(options)` - Boolean query with must/should/filter/must_not
- `QueryDSL.range(field, options)` - Range query helper

**Validation:**
- `from` must be non-negative
- `size` must be between 0 and 10,000 (Elasticsearch limit)

```typescript
// Wildcard query
const q1 = QueryDSL.wildcard('host.name', 'web-*');

// Boolean query with multiple conditions
const q2 = QueryDSL.bool({
  must: [
    { match: { 'event.category': 'intrusion' } }
  ],
  filter: QueryDSL.range('@timestamp', {
    gte: '2024-01-01',
    lte: '2024-12-31'
  }),
  size: 100
});
```

### Repository Interface

`IElasticsearchRepository` defines the contract for all Elasticsearch operations:

**Document Operations:**
- `search<T>(index, query)` - Search documents
- `get<T>(index, id)` - Get document by ID
- `index<T>(index, document, id?)` - Index a document
- `update<T>(index, id, document)` - Update a document
- `delete(index, id)` - Delete a document
- `bulk(operations)` - Bulk operations

**Index Management:**
- `indexExists(index)` - Check if index exists
- `createIndex(index, settings?)` - Create index
- `deleteIndex(index)` - Delete index
- `getMapping(index)` - Get index mapping
- `putMapping(index, mapping)` - Update mapping
- `refresh(index?)` - Refresh index

**Client Management:**
- `ping()` - Health check
- `close()` - Close connection

---

## Remaining Work

### Application Layer (⏳ Not Started)

**ElasticsearchService**
- Query orchestration logic
- Result transformation
- Error handling
- Pagination helpers
- Aggregation builders

**DTOs**
- SearchRequestDto - Input validation
- SearchResponseDto - Output formatting
- BulkRequestDto - Bulk operation inputs
- IndexConfigDto - Index creation config

**Estimated Time:** 3-5 days

### Infrastructure Layer (⏳ Not Started)

**ElasticsearchRepository Implementation**
- Implement `IElasticsearchRepository` using `@elastic/elasticsearch`
- Connection management with `Client`
- Error mapping (Elasticsearch errors → domain errors)
- Logging and metrics hooks
- Transaction support (where applicable)

**Client Configuration**
- Connection pooling configuration
- TLS/SSL setup for SecurityOnion compatibility
- API key vs username/password auth
- Node discovery and failover
- Timeout configuration

**Retry & Resilience**
- Exponential backoff retry strategy
- Circuit breaker pattern
- Request timeout handling
- Connection error recovery

**Query Builder Utilities**
- Advanced query helpers
- Aggregation builders
- Script query support
- Geo query support

**Estimated Time:** 1.5 weeks

### Testing (⏳ Not Started)

**Unit Tests**
- Value object validation tests
- Query builder tests
- Service logic tests

**Integration Tests**
- Real Elasticsearch connection (testcontainers)
- CRUD operations
- Bulk operations
- Index management

**E2E Tests**
- SecurityOnion integration tests
- HELK integration tests
- Performance tests

**Estimated Time:** 1 week

### Documentation (⏳ Partial)

- [x] README with architecture overview
- [x] Domain model documentation
- [ ] API documentation
- [ ] Migration guide from SecurityOnion analyzer
- [ ] Performance tuning guide
- [ ] Security best practices

**Estimated Time:** 2-3 days

---

## Total Completion Estimate

**Current Progress:** 30% (Domain layer complete)

**Remaining Work:**
- Application layer: 3-5 days
- Infrastructure layer: 1.5 weeks
- Testing: 1 week
- Documentation: 2-3 days

**Total Time to 100%:** 3-4 weeks

---

## Source Extraction

### Original Code (SecurityOnion)

```
features/securityonion/salt/sensoroni/files/analyzers/elasticsearch/
├── elasticsearch.py          # Python analyzer
├── elasticsearch.yaml        # Configuration template
└── elasticsearch_test.py     # Tests
```

### Migration Strategy (Strangler Fig)

**Phase 1: Parallel Run** (Current)
1. Create TypeScript library with clean architecture
2. Implement equivalent functionality
3. Add comprehensive tests
4. Document API

**Phase 2: Integration** (Next)
1. Create adapter for SecurityOnion to use TypeScript client
2. Run both Python and TypeScript in parallel
3. Compare results for validation
4. Monitor performance metrics

**Phase 3: Migration** (Future)
1. Route some SecurityOnion requests to TypeScript client
2. Gradually increase traffic
3. Deprecate Python analyzer
4. Remove old code

---

## Integration Points

### SecurityOnion Integration

The library will integrate with SecurityOnion's analyzer system:
- Replace Python `elasticsearch.py` analyzer
- Maintain compatibility with existing YAML configuration
- Support same query patterns (wildcard, time-based)
- Return compatible response format

### HELK Integration

Support for HELK's threat hunting workflows:
- Jupyter notebook integration (via REST API)
- Spark DataFrame-compatible queries
- Graph traversal query support
- Time series aggregations

### Cross-Service Usage

Other services can use this library:
- `apps/ai/threat-hunting` - Threat correlation queries
- `apps/ai/alert-intelligence` - Alert search and aggregation
- `apps/security/dispatch` - Incident data search
- `apps/ai/analytics` - Usage metrics storage

---

## Dependencies

```json
{
  "dependencies": {
    "@elastic/elasticsearch": "^8.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

**Note:** Using Elasticsearch 8.x client for modern features and security.

---

## Configuration Example (Pending Implementation)

```typescript
import { ElasticsearchClient } from '@expert-dollop/ai-vector-db-clients-elasticsearch';

const client = new ElasticsearchClient({
  nodes: ['https://elasticsearch:9200'],
  auth: {
    username: 'elastic',
    password: 'changeme',
    // OR
    apiKey: 'base64EncodedApiKey'
  },
  tls: {
    ca: '/path/to/ca.crt',
    rejectUnauthorized: true
  },
  maxRetries: 3,
  requestTimeout: 30000,
  pool: {
    maxConnections: 10,
    minConnections: 2
  }
});
```

---

## Contributing

When implementing remaining components:

1. **Follow DDD Principles**: Keep domain logic pure, infrastructure isolated
2. **Add Tests First**: TDD approach for reliability
3. **Document APIs**: Clear documentation for each public method
4. **Validate Inputs**: Use value objects for all domain concepts
5. **Handle Errors**: Convert infrastructure errors to domain errors

---

## License

Internal use only - Part of expert-dollop monorepo

---

## Status Summary

| Component | Status | Progress |
|-----------|--------|----------|
| Domain Layer | ✅ Complete | 100% |
| Application Layer | ⏳ Not Started | 0% |
| Infrastructure Layer | ⏳ Not Started | 0% |
| Testing | ⏳ Not Started | 0% |
| Documentation | 🟡 Partial | 50% |
| **Overall** | 🟡 In Progress | **30%** |

---

**Next Steps:**
1. Implement `ElasticsearchService` in application layer
2. Implement `ElasticsearchRepository` in infrastructure layer
3. Add comprehensive tests
4. Complete API documentation
5. Create migration guide

---

**Last Updated:** 2025-12-03  
**Maintainer:** GitHub Copilot for @mbarnes-code  
**Project:** Security AI Integration - Phase 1
