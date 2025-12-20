# AI/ML Domain

This domain contains all AI and ML-focused modules including:
- Firecrawl (Web Scraping & Crawling)
- Firecrawl MCP Server
- Goose (AI Agent)
- Chroma MCP (Vector Database)
- FileScope MCP Server
- MCP Inspector
- Analytics Service
- Playwright Service
- HTML to Markdown Service
- PostgreSQL for AI
- KasmVNC (Remote Desktop)

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
