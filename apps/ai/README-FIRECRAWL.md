# Firecrawl Integration

This directory contains the Firecrawl web scraping and crawling service integrated into the expert-dollop platform using the strangler fig pattern.

## Overview

Firecrawl is an API service that takes a URL, crawls it, and converts it into clean markdown or structured data. It provides advanced scraping, crawling, and data extraction capabilities.

## Architecture

The integration follows Domain-Driven Design (DDD) principles with a modular monolith architecture:

### Backend API (`apps/ai/firecrawl-api`)
- **Core TypeScript API Service**: Express.js-based REST API
- **Queue Management**: BullMQ for async job processing
- **Scraping Engine**: Advanced web scraping with anti-bot mechanisms
- **Multi-format Output**: Markdown, HTML, JSON, screenshots

### Playwright Service (`apps/ai/playwright-service`)
- **Browser Automation**: Dedicated Playwright microservice
- **Headless Browsers**: Chrome, Firefox support
- **Actions**: Click, scroll, input, wait capabilities

### UI (`apps/ai/firecrawl-ui`)
- **React-based UI**: Vite + React + TypeScript
- **Ingestion Interface**: Configure and monitor scraping jobs
- **Radix UI Components**: Modern UI component library

### SDKs (`apps/ai/firecrawl-sdks`)
- **JavaScript SDK**: Node.js/Browser SDK
- **Python SDK**: Python client library
- **Rust SDK**: Rust client library (supports goose integration)

### Examples (`apps/ai/firecrawl-examples`)
- **AI/ML Integration Patterns**: 50+ examples
- **LLM Framework Integration**: Langchain, LlamaIndex, Crew.ai
- **Use Cases**: RAG, web crawling, data extraction, research

## Database Schema

PostgreSQL schema: `firecrawl` (in `infrastructure/postgres/schemas/firecrawl.sql`)

Tables:
- `api_keys` - API authentication
- `scrape_jobs` - Single URL scraping
- `crawl_jobs` - Multi-page crawling
- `crawl_pages` - Crawled pages
- `map_jobs` - URL discovery
- `extract_jobs` - Structured data extraction
- `search_jobs` - Web search with scraping
- `batch_scrape_jobs` - Batch operations
- `documents` - Cached content
- `usage_metrics` - API usage tracking
- `webhooks` - Webhook configurations
- `events` - Event log

## DAPR Integration

DAPR state store: `statestore-firecrawl`
- Schema isolation: `firecrawl` schema
- State management via DAPR API
- Pub/sub for event-driven communication

## Queue Architecture

BullMQ queues:
- `scrape-queue` - Single URL scraping jobs
- `crawl-queue` - Multi-page crawling jobs
- `extract-queue` - Data extraction jobs
- `search-queue` - Search jobs
- `batch-queue` - Batch scraping jobs

## Key Features

1. **Scraping**: Single URL scraping with multiple output formats
2. **Crawling**: Multi-page crawling with depth control
3. **Map**: Fast URL discovery across websites
4. **Search**: Web search with content extraction
5. **Extract**: LLM-powered structured data extraction
6. **Actions**: Browser automation (click, scroll, input)
7. **Batch**: Parallel scraping of multiple URLs

## Getting Started

### Prerequisites
- Node.js 20+
- PNPM 10+
- PostgreSQL with `firecrawl` schema
- Redis for BullMQ
- DAPR runtime (optional)

### Installation

```bash
# Install API dependencies
cd apps/ai/firecrawl-api
pnpm install

# Install UI dependencies
cd ../firecrawl-ui
pnpm install

# Install Playwright service dependencies
cd ../playwright-service
pnpm install
```

### Running Services

```bash
# Start API server
cd apps/ai/firecrawl-api
pnpm dev

# Start Playwright service
cd apps/ai/playwright-service
pnpm dev

# Start UI
cd apps/ai/firecrawl-ui
pnpm dev

# Start workers (BullMQ)
cd apps/ai/firecrawl-api
pnpm workers
```

### With DAPR

```bash
# Start API with DAPR sidecar
dapr run --app-id firecrawl-api --app-port 8080 --dapr-http-port 3600 \
  --components-path ../../../infrastructure/dapr/components \
  --config ../../../infrastructure/dapr/config/config.yaml \
  -- pnpm dev
```

## API Endpoints

- `POST /v2/scrape` - Scrape single URL
- `POST /v2/crawl` - Start crawl job
- `GET /v2/crawl/:id` - Check crawl status
- `POST /v2/map` - Map website URLs
- `POST /v2/extract` - Extract structured data
- `POST /v2/search` - Search and scrape
- `POST /v2/batch/scrape` - Batch scrape URLs

## Environment Variables

```bash
# API Configuration
PORT=8080
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/expert_dollop

# Redis
REDIS_URL=redis://localhost:6379

# DAPR
DAPR_HTTP_PORT=3600
DAPR_GRPC_PORT=50001

# API Keys
BULL_AUTH_KEY=your-bull-board-auth-key
```

## DDD Backend Module

The Python backend module in `backend/api/firecrawl/` provides:
- Domain models (ScrapeJob, CrawlJob)
- Repository interfaces
- Domain services
- Clean architecture layers

## Rust SDK for Goose Integration

The Rust SDK (`apps/ai/firecrawl-sdks/rust-sdk`) enables integration with Goose AI agent:
- Type-safe Firecrawl client
- Async/await support
- Error handling
- Connection pooling

## Examples

Check `apps/ai/firecrawl-examples/` for 50+ integration examples:
- AI web crawlers (GPT-4, Claude, Gemini, Llama)
- RAG systems
- Company research tools
- Data extraction pipelines
- Real-time web analysis

## License

Firecrawl is licensed under AGPL-3.0. SDKs and UI components are MIT licensed.

## References

- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Firecrawl GitHub](https://github.com/firecrawl/firecrawl)
- [API Reference](https://docs.firecrawl.dev/api-reference/introduction)
