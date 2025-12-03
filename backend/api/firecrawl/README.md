# Firecrawl Backend API Module

Domain-Driven Design (DDD) backend module for Firecrawl web scraping service.

## Architecture

This module follows Clean Architecture and DDD principles with clear separation of concerns:

```
backend/api/firecrawl/
├── domain/                 # Domain Layer (Business Logic)
│   ├── models/            # Domain Models (Entities & Value Objects)
│   │   ├── scrape_job.py  # ScrapeJob aggregate root
│   │   └── crawl_job.py   # CrawlJob aggregate root
│   ├── services/          # Domain Services
│   │   └── scrape_service.py
│   └── repositories/      # Repository Interfaces
│       ├── scrape_job_repository.py
│       └── crawl_job_repository.py
├── application/           # Application Layer (Use Cases)
│   ├── usecases/         # Application Use Cases
│   └── dtos/             # Data Transfer Objects
├── infrastructure/        # Infrastructure Layer (External Dependencies)
│   ├── database/         # Database implementations
│   ├── queue/            # BullMQ queue implementations
│   └── cache/            # Redis cache implementations
└── presentation/          # Presentation Layer (API Controllers)
```

## Domain Models

### ScrapeJob
Aggregate root for single URL scraping operations.

**Attributes:**
- `id`: Unique job identifier
- `url`: URL to scrape
- `status`: Job execution status (pending, processing, completed, failed, cancelled)
- `formats`: Output formats (markdown, html, json, screenshot, links)
- `options`: Scraping options
- `result`: Scraping result
- `credits_used`: API credits consumed

**Methods:**
- `start()`: Mark job as started
- `complete(result)`: Mark job as completed
- `fail(error)`: Mark job as failed
- `retry()`: Retry the job
- `cancel()`: Cancel the job

### CrawlJob
Aggregate root for multi-page crawling operations.

**Attributes:**
- `id`: Unique job identifier
- `url`: Starting URL
- `status`: Job execution status
- `limit_pages`: Maximum pages to crawl
- `max_depth`: Maximum crawl depth
- `discovered_urls`: Number of discovered URLs
- `completed_urls`: Number of completed URLs
- `total_credits_used`: Total API credits consumed

**Methods:**
- `start()`: Start the crawl
- `add_discovered_url()`: Increment discovered counter
- `mark_url_completed(credits)`: Mark URL as completed
- `mark_url_failed()`: Mark URL as failed
- `complete()`: Complete the crawl
- `get_progress()`: Get crawl progress percentage

## Repository Pattern

Repositories provide abstraction over data persistence:

```python
from backend.api.firecrawl import ScrapeService, ScrapeJob

# Inject repository implementation
scrape_service = ScrapeService(repository=PostgresScrapeJobRepository())

# Create scrape job
job = await scrape_service.create_scrape_job(
    url="https://example.com",
    api_key_id="key-123",
    formats=["markdown", "html"]
)

# Get job status
job = await scrape_service.get_job(job.id)

# Complete job
job = await scrape_service.complete_job(job.id, result={
    "markdown": "...",
    "html": "..."
})
```

## Domain Services

### ScrapeService
Encapsulates scraping business logic:
- Job creation
- Job lifecycle management
- Retry logic
- Status tracking

### CrawlService (TODO)
Encapsulates crawling business logic:
- Crawl job creation
- URL discovery
- Progress tracking
- Result aggregation

## Integration with DAPR

The backend module integrates with DAPR for state management:

```python
from dapr.clients import DaprClient

# Save state via DAPR
with DaprClient() as client:
    client.save_state(
        store_name="statestore-firecrawl",
        key=f"job-{job.id}",
        value=job.to_dict()
    )
```

## Integration with BullMQ (TypeScript API)

The Python backend module works alongside the TypeScript API which handles:
- Express.js REST API
- BullMQ queue processing
- Actual scraping execution
- Browser automation

Python backend provides:
- Domain models and business logic
- Repository abstractions
- Clean architecture patterns
- Type-safe domain layer

## Usage Example

```python
from backend.api.firecrawl import (
    ScrapeJob,
    JobStatus,
    ScrapeFormat,
    ScrapeService
)

# Create service with repository
service = ScrapeService(repository)

# Create scrape job
job = await service.create_scrape_job(
    url="https://docs.firecrawl.dev",
    api_key_id="api-key-123",
    team_id="team-456",
    formats=[ScrapeFormat.MARKDOWN.value, ScrapeFormat.HTML.value],
    options={
        "max_retries": 3,
        "timeout": 30000
    }
)

# Job lifecycle
await service.start_job(job.id)
# ... scraping happens ...
await service.complete_job(job.id, result={
    "markdown": "# Documentation\n...",
    "html": "<html>...</html>",
    "metadata": {...}
})
```

## Benefits of DDD Architecture

1. **Separation of Concerns**: Clear boundaries between layers
2. **Business Logic Focus**: Domain models encapsulate business rules
3. **Testability**: Easy to unit test domain logic
4. **Maintainability**: Changes isolated to specific layers
5. **Database Agnostic**: Repository pattern abstracts persistence
6. **DAPR Integration**: Can swap databases via DAPR without code changes

## Next Steps

1. Implement repository concrete classes (PostgreSQL, DAPR)
2. Create application use cases
3. Build presentation layer (FastAPI controllers)
4. Add unit tests for domain models
5. Add integration tests with TypeScript API
6. Implement CrawlService domain service
7. Add DTOs for API requests/responses

## License

Apache-2.0
