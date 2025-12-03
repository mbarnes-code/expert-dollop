# Firecrawl Strangler Fig Migration Guide

This document describes the migration of the Firecrawl project into the expert-dollop platform using the strangler fig pattern.

## Overview

The strangler fig pattern is an incremental migration approach where new functionality is built alongside the old system. This allows for gradual transition without disrupting existing services.

## What Was Migrated

### 1. Core API Service
**From:** `features/firecrawl/apps/api`  
**To:** `apps/ai/firecrawl-api`

The TypeScript Express.js API service with:
- REST API endpoints (v0, v1, v2)
- BullMQ queue management
- Scraping engine
- WebSocket support
- Bull Board queue monitoring

### 2. Playwright Service
**From:** `features/firecrawl/apps/playwright-service-ts`  
**To:** `apps/ai/playwright-service`

Dedicated browser automation microservice:
- Playwright integration
- Headless browser support
- Browser actions (click, scroll, input)

### 3. UI Components
**From:** `features/firecrawl/apps/ui/ingestion-ui`  
**To:** `apps/ai/firecrawl-ui`

React-based ingestion interface:
- Vite + React + TypeScript
- Radix UI components
- Tailwind CSS styling

### 4. SDKs
**From:** `features/firecrawl/apps/*-sdk`  
**To:** `apps/ai/firecrawl-sdks/`

Multi-language SDK support:
- JavaScript/TypeScript SDK
- Python SDK
- Rust SDK (for goose integration)

### 5. Examples
**From:** `features/firecrawl/examples`  
**To:** `apps/ai/firecrawl-examples`

50+ AI/ML integration examples:
- LLM integration patterns
- RAG systems
- Web crawlers
- Data extraction pipelines

### 6. Database Schema
**Created:** `infrastructure/postgres/schemas/firecrawl.sql`

PostgreSQL schema with tables:
- `api_keys` - Authentication
- `scrape_jobs` - Single URL scraping
- `crawl_jobs` - Multi-page crawling
- `crawl_pages` - Crawled pages
- `map_jobs` - URL discovery
- `extract_jobs` - Data extraction
- `search_jobs` - Web search
- `batch_scrape_jobs` - Batch operations
- `documents` - Content cache
- `usage_metrics` - API usage
- `webhooks` - Webhook configurations
- `events` - Event log
- `dapr_state` - DAPR state store

### 7. DDD Backend Module
**Created:** `backend/api/firecrawl/`

Python DDD module following clean architecture:
```
backend/api/firecrawl/
├── domain/
│   ├── models/           # Domain entities
│   ├── services/         # Domain services
│   └── repositories/     # Repository interfaces
├── application/          # Use cases
├── infrastructure/       # External dependencies
└── presentation/         # API controllers
```

### 8. DAPR Integration
**Created:**
- `infrastructure/dapr/components/statestore-firecrawl.yaml`
- `infrastructure/dapr/components/pubsub-firecrawl.yaml`

DAPR components for:
- State management (PostgreSQL-backed)
- Pub/sub messaging (RabbitMQ-backed)

## Architecture Decisions

### 1. Domain-Driven Design (DDD)
The backend module follows DDD principles:
- **Bounded Context:** Firecrawl owns its scraping domain
- **Aggregate Roots:** ScrapeJob, CrawlJob
- **Repository Pattern:** Abstraction over persistence
- **Domain Services:** Business logic encapsulation

### 2. Schema Isolation
Firecrawl has its own PostgreSQL schema:
- No direct cross-schema queries
- DAPR enforces schema boundaries via `search_path`
- Loose coupling via pub/sub events

### 3. Event-Driven Communication
Services communicate via DAPR pub/sub:
- `firecrawl.scrape.completed`
- `firecrawl.crawl.progress`
- `firecrawl.extract.completed`

### 4. Queue Management
BullMQ handles async job processing:
- Separate queues per job type
- Redis-backed persistence
- Bull Board for monitoring

### 5. Rust SDK for Goose Integration
The Rust SDK enables:
- Type-safe Firecrawl client
- Integration with Goose AI agent
- Async/await support

## Directory Structure

```
expert-dollop/
├── apps/ai/
│   ├── firecrawl-api/          # TypeScript API service
│   ├── firecrawl-ui/           # React UI
│   ├── playwright-service/     # Browser automation
│   ├── firecrawl-sdks/         # Multi-language SDKs
│   │   ├── js-sdk/
│   │   ├── python-sdk/
│   │   └── rust-sdk/
│   └── firecrawl-examples/     # AI/ML examples
├── backend/api/firecrawl/      # Python DDD module
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
└── infrastructure/
    ├── postgres/schemas/
    │   └── firecrawl.sql       # Database schema
    └── dapr/components/
        ├── statestore-firecrawl.yaml
        └── pubsub-firecrawl.yaml
```

## Running Firecrawl

### Prerequisites
```bash
# Install dependencies
cd apps/ai/firecrawl-api
pnpm install

cd ../firecrawl-ui
pnpm install

cd ../playwright-service
pnpm install
```

### Database Setup
```bash
# Apply schema
psql -h localhost -U postgres -d expert_dollop \
  -f infrastructure/postgres/schemas/firecrawl.sql
```

### Start Services

#### API Server
```bash
cd apps/ai/firecrawl-api
pnpm dev
# Runs on http://localhost:8080
```

#### Workers (BullMQ)
```bash
cd apps/ai/firecrawl-api
pnpm workers
# Processes jobs from Redis queues
```

#### Playwright Service
```bash
cd apps/ai/playwright-service
pnpm dev
# Runs browser automation service
```

#### UI
```bash
cd apps/ai/firecrawl-ui
pnpm dev
# Runs on http://localhost:5173
```

### With DAPR

```bash
# Start API with DAPR sidecar
dapr run --app-id firecrawl-api --app-port 8080 \
  --dapr-http-port 3600 --dapr-grpc-port 50001 \
  --components-path ../../../infrastructure/dapr/components \
  --config ../../../infrastructure/dapr/config/config.yaml \
  -- pnpm dev

# Workers with DAPR
dapr run --app-id firecrawl-worker \
  --dapr-http-port 3601 --dapr-grpc-port 50002 \
  --components-path ../../../infrastructure/dapr/components \
  --config ../../../infrastructure/dapr/config/config.yaml \
  -- pnpm workers
```

## Integration Points

### 1. Goose AI Agent
The Rust SDK enables Goose to use Firecrawl:
```rust
use firecrawl::FirecrawlApp;

let app = FirecrawlApp::new("api_key").unwrap();
let scrape = app.scrape_url("https://example.com", None).await?;
println!("{}", scrape.markdown);
```

### 2. N8N Workflows
Firecrawl can be used in n8n workflows:
- Web scraping nodes
- Crawling automation
- Data extraction tasks

### 3. AI Chat Applications
The firecrawl-examples show integration with:
- GPT-4, Claude, Gemini, Llama
- Langchain, LlamaIndex
- RAG systems

## Environment Variables

```bash
# API Service
PORT=8080
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/expert_dollop
REDIS_URL=redis://localhost:6379

# DAPR
DAPR_HTTP_PORT=3600
DAPR_GRPC_PORT=50001

# Queue Management
BULL_AUTH_KEY=your-auth-key

# Playwright Service
PLAYWRIGHT_PORT=8081
```

## Testing

```bash
# API tests
cd apps/ai/firecrawl-api
pnpm test

# Python backend tests
cd backend/api/firecrawl
pytest

# SDK tests
cd apps/ai/firecrawl-sdks/rust-sdk
cargo test
```

## Monitoring

### Bull Board
Access queue monitoring at:
```
http://localhost:8080/admin/{BULL_AUTH_KEY}/queues
```

### DAPR Dashboard
```bash
dapr dashboard
# Access at http://localhost:8080 (if DAPR_DASHBOARD_PORT=8080)
```

## Future Enhancements

1. **Complete Repository Implementations**
   - PostgreSQL repository
   - DAPR state store repository

2. **Application Layer**
   - Use case implementations
   - DTOs for API requests/responses

3. **Presentation Layer**
   - FastAPI controllers
   - GraphQL API

4. **Advanced Features**
   - Rate limiting
   - Webhook delivery
   - Change tracking
   - Multi-tenant support

5. **Integration Tests**
   - E2E tests
   - Performance tests
   - Load tests

## References

- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [DAPR Documentation](https://docs.dapr.io)
- [BullMQ Documentation](https://docs.bullmq.io)

## License

Firecrawl is licensed under AGPL-3.0. SDKs and UI components are MIT licensed.
