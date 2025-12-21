# Docker Files Inventory - Features Directory

This document provides a comprehensive inventory of all Docker-related files found in the `features/` directory, organized by service type (frontend, backend, or infrastructure).

## Summary Statistics

- **Frontend Services**: 28
- **Backend Services**: 54
- **Infrastructure/Other Services**: 15
- **Total Docker Files**: 97

---

## Frontend Services (28)

These services provide user interfaces, web applications, and frontend tooling.

### 1. CyberChef
**Path**: `features/CyberChef/Dockerfile`
**Type**: Data transformation and analysis tool
**Tech**: Node.js, JavaScript

### 2. Ghostwriter - Collaboration Server
**Path**: `features/Ghostwriter/compose/production/collab-server/Dockerfile`
**Type**: Real-time collaboration server
**Tech**: Node.js

### 3. Ghostwriter - Node (Local Dev)
**Path**: `features/Ghostwriter/compose/local/node/Dockerfile`
**Type**: Node.js build environment for Ghostwriter frontend
**Tech**: Node.js

### 4. Ghostwriter - Nginx
**Path**: `features/Ghostwriter/compose/production/nginx/Dockerfile`
**Type**: Web server and reverse proxy
**Tech**: Nginx

### 5-11. HELK Services
**Paths**:
- `features/HELK/docker/helk-base/Dockerfile`
- `features/HELK/docker/helk-kafka-base/Dockerfile`
- `features/HELK/docker/helk-kafka-broker/Dockerfile`
- `features/HELK/docker/helk-nginx/Dockerfile`
- `features/HELK/docker/helk-spark-master/Dockerfile`
- `features/HELK/docker/helk-spark-worker/Dockerfile`
- `features/HELK/docker/helk-zookeeper/Dockerfile`

**Type**: Hunting ELK Stack components
**Tech**: Various (Kafka, Spark, Nginx, Zookeeper)

### 12. Nemesis Frontend
**Path**: `features/Nemesis/projects/frontend/Dockerfile`
**Type**: Security operations web interface
**Tech**: Node.js, React

### 13. Actual Budgeting App
**Path**: `features/actual/Dockerfile`
**Type**: Personal budgeting application
**Tech**: Node.js
**Compose**: `features/actual/docker-compose.yml`

### 14. Commander Spellbook Site
**Path**: `features/commander-spellbook-site/Dockerfile`
**Type**: MTG Commander combo database frontend
**Tech**: Next.js, React

### 15. Firecrawl MCP Server
**Path**: `features/firecrawl-mcp-server/Dockerfile`
**Type**: MCP server for Firecrawl
**Tech**: Node.js

### 16. Firecrawl MCP Service
**Path**: `features/firecrawl-mcp-server/Dockerfile.service`
**Type**: Service variant of Firecrawl MCP
**Tech**: Node.js

### 17. Playwright Service
**Path**: `features/firecrawl/apps/playwright-service-ts/Dockerfile`
**Type**: Browser automation service
**Tech**: TypeScript, Playwright

### 18. Inspector
**Path**: `features/inspector/Dockerfile`
**Type**: Code inspection tool
**Tech**: Node.js

### 19. IT Tools
**Path**: `features/it-tools/Dockerfile`
**Type**: Collection of IT utilities
**Tech**: Vue.js, Node.js

### 20. MCP VirusTotal
**Path**: `features/mcp-virustotal/Dockerfile`
**Type**: VirusTotal MCP server
**Tech**: Node.js

### 21. N8N MCP Server
**Path**: `features/n8n-mcp-server/Dockerfile`
**Type**: N8N workflow MCP integration
**Tech**: Node.js

### 22-27. N8N Services
**Paths**:
- `features/n8n/.devcontainer/Dockerfile`
- `features/n8n/docker/images/n8n-base/Dockerfile`
- `features/n8n/docker/images/n8n/Dockerfile`
- `features/n8n/docker/images/runners/Dockerfile`
- `features/n8n/packages/@n8n/benchmark/Dockerfile`

**Type**: Workflow automation platform
**Tech**: Node.js, TypeScript

### 28. RITA (Rolling Integration)
**Path**: `features/rita/integration_rolling/Dockerfile`
**Type**: Real Intelligence Threat Analytics
**Tech**: Node.js

---

## Backend Services (54)

These services provide APIs, data processing, and business logic.

### Django-Based Services

#### 1. Ghostwriter Django Backend
**Path**: `features/Ghostwriter/compose/local/django/Dockerfile`
**Type**: Reporting platform backend (local dev)
**Tech**: Python, Django

#### 2. Ghostwriter Django Production
**Path**: `features/Ghostwriter/compose/production/django/Dockerfile`
**Type**: Reporting platform backend (production)
**Tech**: Python, Django

#### 3-6. Commander Spellbook Backend
**Paths**:
- `features/commander-spellbook-backend/backend/Dockerfile`
- `features/commander-spellbook-backend/bot/discord/Dockerfile`
- `features/commander-spellbook-backend/bot/reddit/Dockerfile`
- `features/commander-spellbook-backend/bot/telegram/Dockerfile`

**Type**: MTG combo database API and bots
**Tech**: Python, Django
**Compose**: `features/commander-spellbook-backend/docker-compose.yml`

#### 7-8. Dispatch
**Paths**:
- `features/dispatch/.devcontainer/Dockerfile`
- `features/dispatch/docker/Dockerfile`

**Type**: Incident management platform
**Tech**: Python, FastAPI, Vue.js
**Compose**: `features/dispatch/docker/docker-compose.yml`

### Python/FastAPI Services

#### 9-19. Nemesis Platform
**Paths**:
- `features/Nemesis/projects/agents/Dockerfile`
- `features/Nemesis/projects/alerting/Dockerfile`
- `features/Nemesis/projects/cli/Dockerfile`
- `features/Nemesis/projects/document_conversion/Dockerfile`
- `features/Nemesis/projects/dotnet_service/Dockerfile`
- `features/Nemesis/projects/file_enrichment/Dockerfile`
- `features/Nemesis/projects/housekeeping/Dockerfile`
- `features/Nemesis/projects/jupyter/Dockerfile`
- `features/Nemesis/projects/noseyparker_scanner/Dockerfile`
- `features/Nemesis/projects/web_api/Dockerfile`

**Type**: Security operations platform components
**Tech**: Python, FastAPI, .NET
**Compose**: `features/Nemesis/projects/file_enrichment/docker-compose.debug.yml`, `features/Nemesis/projects/web_api/docker-compose.debug.yml`

#### 20. Chroma MCP
**Path**: `features/chroma-mcp/Dockerfile`
**Type**: Vector database MCP server
**Tech**: Python

#### 21-23. Firecrawl Services
**Paths**:
- `features/firecrawl/apps/api/Dockerfile`
- `features/firecrawl/apps/go-html-to-md-service/Dockerfile`
- `features/firecrawl/apps/nuq-postgres/Dockerfile`

**Type**: Web scraping and data extraction
**Tech**: Node.js, Go, PostgreSQL
**Compose**: `features/firecrawl/docker-compose.yaml`, `features/firecrawl/apps/go-html-to-md-service/docker-compose.yml`

#### 24-27. Goose
**Paths**:
- `features/goose/.devcontainer/Dockerfile`
- `features/goose/Dockerfile`
- `features/goose/documentation/docs/docker/Dockerfile`
- `features/goose/recipe-scanner/Dockerfile`

**Type**: AI-powered development assistant
**Tech**: Python, Rust
**Compose**: `features/goose/documentation/docs/docker/docker-compose.yml`

#### 28. Maltrail
**Path**: `features/maltrail/docker/Dockerfile`
**Type**: Malicious traffic detection
**Tech**: Python
**Compose**: `features/maltrail/docker/docker-compose.yml`

#### 29-31. Mealie
**Paths**:
- `features/mealie/.devcontainer/Dockerfile`
- `features/mealie/docker/Dockerfile`

**Type**: Recipe management platform
**Tech**: Python, FastAPI, Vue.js
**Compose**: `features/mealie/docker/docker-compose.yml`, `features/mealie/docker/docker-compose.dev.yml`

#### 32. MTG Commander Map
**Path**: `features/mtg-commander-map/Dockerfile`
**Type**: MTG Commander deck mapping tool
**Tech**: Python

#### 33-34. RITA
**Paths**:
- `features/rita/Dockerfile`

**Type**: Real Intelligence Threat Analytics
**Tech**: Go, Python
**Compose**: `features/rita/docker-compose.yml`, `features/rita/docker-compose.prod.yml`

#### 35. Software Forensic Kit
**Path**: `features/software-forensic-kit/Dockerfile`
**Type**: Software forensics analysis
**Tech**: Python

### Go Services

#### 36. HTML to Markdown Service
**Path**: `features/firecrawl/apps/go-html-to-md-service/Dockerfile`
**Type**: HTML to Markdown conversion microservice
**Tech**: Go

### API Gateway / Proxy

#### 37-40. Kong API Gateway
**Paths**:
- `features/kong/.devcontainer/Dockerfile`
- `features/kong/scripts/Dockerfile`

**Type**: API Gateway and management
**Tech**: Lua, OpenResty
**Compose**: `features/kong/scripts/dependency_services/docker-compose-test-services.yml`, `features/kong/scripts/upgrade-tests/docker-compose.yml`

### Data Processing

#### 41-43. HELK Backend Services
**Paths**:
- `features/HELK/docker/helk-elastalert/Dockerfile`
- `features/HELK/docker/helk-jupyter/Dockerfile`
- `features/HELK/docker/helk-spark-base/Dockerfile`

**Type**: Threat hunting platform components
**Tech**: Python, Jupyter, Spark

### N8N Backend Services

#### 44-48. N8N Backend
**Paths**:
- `features/n8n/docker/images/runners/Dockerfile.distroless`

**Type**: Workflow runners and backend services
**Tech**: Node.js
**Compose**: Multiple compose files for different setups in `features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/`

---

## Infrastructure / Database Services (15)

These services provide supporting infrastructure like databases, caches, and message queues.

### 1. Ghostwriter Hasura
**Path**: `features/Ghostwriter/compose/production/hasura/Dockerfile`
**Type**: GraphQL engine
**Tech**: Hasura

### 2. Ghostwriter PostgreSQL
**Path**: `features/Ghostwriter/compose/production/postgres/Dockerfile`
**Type**: Database
**Tech**: PostgreSQL

### 3. Ghostwriter Redis
**Path**: `features/Ghostwriter/compose/production/redis/Dockerfile`
**Type**: Cache and message broker
**Tech**: Redis

### 4. HELK Elasticsearch
**Path**: `features/HELK/docker/helk-elasticsearch/Dockerfile`
**Type**: Search and analytics engine
**Tech**: Elasticsearch

### 5. HELK Kibana
**Path**: `features/HELK/docker/helk-kibana/Dockerfile`
**Type**: Data visualization
**Tech**: Kibana

### 6. HELK Logstash
**Path**: `features/HELK/docker/helk-logstash/Dockerfile`
**Type**: Data processing pipeline
**Tech**: Logstash

### 7. Firecrawl Redis
**Path**: `features/firecrawl/apps/redis/Dockerfile`
**Type**: Cache for Firecrawl
**Tech**: Redis

### 8. Kong Scripts
**Path**: `features/kong/scripts/Dockerfile`
**Type**: Kong utility scripts
**Tech**: Shell, Lua

### 9. Actual Dev Container
**Path**: `features/actual/.devcontainer/docker-compose.yml`
**Type**: Development environment
**Tech**: Docker Compose

### 10. Actual Sync Server
**Path**: `features/actual/packages/sync-server/docker-compose.yml`
**Type**: Synchronization service
**Tech**: Node.js

### 11-15. Various Infrastructure Compose Files
**Paths**:
- `features/dispatch/.devcontainer/docker-compose.yml`
- `features/kong/.devcontainer/docker-compose.yml`
- `features/maltrail/docker/docker-compose.yml`
- `features/rita/docker-compose.yml`
- `features/n8n/.devcontainer/docker-compose.yml`
- `features/n8n/.github/docker-compose.yml`

**Type**: Development and testing infrastructure
**Tech**: Various

---

## Docker Compose Files Summary

### Complete Application Stacks
1. **Commander Spellbook**: `features/commander-spellbook-backend/docker-compose.yml`
2. **Dispatch**: `features/dispatch/docker/docker-compose.yml`
3. **Firecrawl**: `features/firecrawl/docker-compose.yaml`
4. **Goose**: `features/goose/documentation/docs/docker/docker-compose.yml`
5. **Maltrail**: `features/maltrail/docker/docker-compose.yml`
6. **Mealie**: `features/mealie/docker/docker-compose.yml`
7. **RITA**: `features/rita/docker-compose.yml`
8. **Actual**: `features/actual/docker-compose.yml`

### Development Environments
1. **Dispatch Dev**: `features/dispatch/.devcontainer/docker-compose.yml`
2. **Kong Dev**: `features/kong/.devcontainer/docker-compose.yml`
3. **N8N Dev**: `features/n8n/.devcontainer/docker-compose.yml`
4. **Actual Dev**: `features/actual/.devcontainer/docker-compose.yml`
5. **Mealie Dev**: `features/mealie/docker/docker-compose.dev.yml`

### Testing & Benchmarking
1. **Kong Test Services**: `features/kong/scripts/dependency_services/docker-compose-test-services.yml`
2. **Kong Upgrade Tests**: `features/kong/scripts/upgrade-tests/docker-compose.yml`
3. **N8N Benchmarks**: Multiple files in `features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/`
4. **Mealie E2E Tests**: `features/mealie/tests/e2e/docker/docker-compose.yml`

### Debug Configurations
1. **Nemesis File Enrichment Debug**: `features/Nemesis/projects/file_enrichment/docker-compose.debug.yml`
2. **Nemesis Web API Debug**: `features/Nemesis/projects/web_api/docker-compose.debug.yml`

---

## Integration Strategy

The root-level Docker files (`Dockerfile.frontend`, `Dockerfile.backend`, `docker-compose.yml`, and `docker-compose-models.yml`) provide a unified way to build and run services. To integrate specific features:

1. **Reference existing Dockerfiles** from features directory in compose services
2. **Use build contexts** pointing to feature directories
3. **Extend base images** defined in root Dockerfiles
4. **Organize by profile** to enable/disable feature sets

### Example Integration

```yaml
services:
  maltrail:
    build:
      context: ./features/maltrail
      dockerfile: docker/Dockerfile
    # ... rest of configuration
```

This approach allows the monorepo to leverage existing, tested Docker configurations while maintaining a clean root-level orchestration layer.

---

## Technology Stack Summary

### Languages & Frameworks
- **Frontend**: Node.js, React, Next.js, Vue.js, TypeScript
- **Backend**: Python (Django, FastAPI), Go, Rust, .NET
- **Data Processing**: Spark, Kafka, Logstash

### Databases & Storage
- PostgreSQL
- Redis
- Elasticsearch

### Message Queues & Streaming
- Kafka
- Zookeeper
- RabbitMQ (in root compose)

### Web Servers & Proxies
- Nginx
- Kong API Gateway

### AI/ML Tools
- Goose (AI assistant)
- Various MCP servers
- N8N (workflow automation with AI)
- Ollama (LLM, in root compose)
- Chroma (vector database)

### Security Tools
- Ghostwriter (reporting)
- Nemesis (security ops)
- Maltrail (traffic analysis)
- RITA (network analysis)
- Software Forensic Kit

### Development Tools
- CyberChef (data operations)
- Inspector (code inspection)
- IT Tools (utilities)
