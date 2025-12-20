# Ingestion Domain

Web crawling and data collection with Firecrawl integration.

## Structure

```
ingestion/
├── api/                    # Data access layer
│   ├── repositories/       # Data repositories
│   ├── services/          # Business logic
│   └── clients/           # Firecrawl API client
├── components/            # UI components
│   ├── CrawlerConfig/     # Crawler configuration
│   ├── IngestionStatus/   # Job monitoring
│   └── CrawlHistory/      # History viewer
├── hooks/                 # React hooks
├── stores/                # State management (Zustand)
├── types/                 # TypeScript types
├── factories/             # Factory pattern implementations
└── utils/                 # Utility functions
```

## Integration Points

- **Source**: `features/AI core/firecrawl/` (Firecrawl API)

## Implementation Status

- [ ] Phase 7: Domain Implementation
- [ ] Crawler types and job types
- [ ] Crawl job repository
- [ ] Crawler service with orchestration
- [ ] Firecrawl API client
- [ ] Crawler configuration interface
- [ ] Job status monitoring
- [ ] Crawl history viewer
- [ ] WebSocket for progress updates

## Next Steps

See Phase 7 in the main implementation plan for detailed tasks.
