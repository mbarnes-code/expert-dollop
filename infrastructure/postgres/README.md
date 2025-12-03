# PostgreSQL Database Configuration

This directory contains the PostgreSQL database schema configurations for the expert-dollop platform.

## Schemas

The database is organized into 9 distinct schemas:

1. **dispatch** - Dispatch and routing operations
2. **hexstrike** - HexStrike game data
3. **mealie** - Mealie recipe management
4. **tcg** - Trading Card Game data
5. **nemesis** - Nemesis game project data
6. **main** - Core application data
7. **ghostwriter** - Ghostwriter content data
8. **nemsis** - NEMSIS data
9. **firecrawl** - Web scraping and crawling data

## Usage

Each schema is defined in its own SQL file and can be applied using standard PostgreSQL tools.

```bash
psql -h localhost -U postgres -d expert_dollop -f schemas/dispatch.sql
psql -h localhost -U postgres -d expert_dollop -f schemas/firecrawl.sql
```

### Firecrawl Schema

The firecrawl schema includes tables for:
- API authentication and authorization
- Scrape jobs (single URL scraping)
- Crawl jobs (multi-page crawling)
- Map jobs (URL discovery)
- Extract jobs (structured data extraction)
- Search jobs (web search with scraping)
- Document cache
- Usage metrics and webhooks
- DAPR state management

See `firecrawl.sql` for full schema definition.
