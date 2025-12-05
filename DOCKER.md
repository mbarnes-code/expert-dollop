# Docker Setup Guide - Expert Dollop

This directory contains the Docker configuration for the Expert Dollop monorepo, organized by service type (frontend, backend, and AI/ML models).

> **📘 For complete infrastructure details**, see [INFRASTRUCTURE.md](INFRASTRUCTURE.md) which documents all 11 PostgreSQL schemas, 9 Redis databases, 11 DAPR state stores, BullMQ job queues, and the ELK stack.

## Infrastructure Summary

### PostgreSQL - 11 Schemas
The platform uses **11 PostgreSQL schemas** for domain separation:
- dispatch, firecrawl, ghostwriter, goose, hexstrike
- integration, main, mealie, nemesis, nemsis, tcg

### Redis - 9 Active Databases
Redis is configured with **9 databases** (DB 0-8):
- DB 0: User sessions
- DB 1: Application cache  
- DB 2: Rate limiting
- **DB 3: BullMQ job queues** (Node.js background jobs)
- DB 4: Pub/sub channels
- DB 5: Security tokens
- DB 6: TCG state cache
- DB 7: AI model cache
- DB 8: Analytics data

### DAPR Service Mesh - 11 State Stores
DAPR provides **11 state store components** (one per PostgreSQL schema) plus pub/sub messaging via RabbitMQ for Domain-Driven Design compliance.

### BullMQ Job Queues
Centralized job queue system for all Node.js applications using Redis DB 3. Located at `/infrastructure/bullmq/`.

## Overview

The Docker setup consists of:

- **`Dockerfile.frontend`** - Multi-stage Dockerfile for all frontend applications (Node.js/Next.js based)
- **`Dockerfile.backend`** - Multi-stage Dockerfile for all backend services (Python Django/FastAPI based)
- **`docker-compose.yml`** - Main orchestration file for frontend and backend services
- **`docker-compose-models.yml`** - Orchestration file for AI/ML models and related services
- **`.env.example`** - Environment variable template
- **`INFRASTRUCTURE.md`** - Complete infrastructure architecture documentation

## Quick Start

### 1. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start Infrastructure Services

Start just the database, Redis, and RabbitMQ:

```bash
docker-compose up -d postgres redis rabbitmq
```

### 3. Start Backend Services

```bash
# Start all backend services
docker-compose --profile backend up -d

# Or start specific services
docker-compose up -d fastapi-core
docker-compose up -d django-spellbook django-security django-mtg
```

### 4. Start Frontend Services

```bash
# Start all frontend services
docker-compose --profile frontend up -d

# Or start specific services
docker-compose up -d frontend-main
docker-compose up -d n8n-frontend
```

### 5. Start AI/ML Services

```bash
# Start all AI services
docker-compose -f docker-compose-models.yml --profile all up -d

# Or start specific AI services
docker-compose -f docker-compose-models.yml --profile firecrawl up -d
docker-compose -f docker-compose-models.yml --profile llm up -d
docker-compose -f docker-compose-models.yml --profile n8n up -d
```

## Service Profiles

### Main Compose File (`docker-compose.yml`)

- **`backend`** - All backend services (Django + FastAPI)
- **`django`** - Only Django services
- **`fastapi`** - Only FastAPI services
- **`frontend`** - All frontend services
- **`workers`** - Celery workers, beat scheduler, and BullMQ workers
- **`bullmq`** - BullMQ worker for Node.js job processing
- **`dapr`** - DAPR placement service and sidecars (11 state stores)
- **`elk`** - Elasticsearch, Kibana, Logstash analytics stack
- **`analytics`** - Same as elk
- **`proxy`** - Nginx reverse proxy
- **`all`** - All services

### Models Compose File (`docker-compose-models.yml`)

- **`llm`** - Ollama LLM service
- **`embeddings`** - Chroma vector database
- **`firecrawl`** - Web scraping and data extraction services
- **`goose`** - AI development assistant
- **`n8n`** - Workflow automation
- **`workflow`** - Same as n8n
- **`mcp`** - Model Context Protocol servers
- **`analytics`** - AI analytics and monitoring
- **`chat`** - AI chat interface
- **`security`** - Security-related MCP services
- **`all`** - All AI/ML services

## Service Architecture

### Frontend Services (from `features/` directory)

The following frontend services were identified from the features directory:

- **CyberChef** - Data transformation tool
- **Nemesis Frontend** - Security operations frontend
- **Commander Spellbook Site** - MTG combo database frontend
- **Inspector** - Inspection tool frontend
- **IT Tools** - Collection of IT utilities
- **N8N Frontend** - Workflow automation UI
- **Actual** - Budgeting application

### Backend Services (from `features/` directory)

The following backend services were identified:

- **Django Services**:
  - Ghostwriter - Reporting platform
  - Commander Spellbook Backend - MTG combo database API
  - Dispatch - Incident management
  - Nemesis Web API - Security operations API

- **FastAPI/Python Services**:
  - Firecrawl API - Web scraping
  - Goose - AI development assistant
  - Maltrail - Malicious traffic detection
  - RITA - Network analysis
  - Mealie - Recipe management

- **Other Services**:
  - Kong - API gateway
  - N8N - Workflow automation server
  - HELK - Hunting platform

## Port Mapping

### Infrastructure
- PostgreSQL: `5432`
- Redis: `6379`
- RabbitMQ: `5672` (AMQP), `15672` (Management UI)

### Backend Services
- FastAPI Core: `8000`
- Django Spellbook: `8001`
- Django Security: `8002`
- Django MTG: `8003`
- Chroma: `8004`

### Frontend Services
- Frontend Main: `3000`
- Playwright Service: `3001`
- Go HTML-to-MD: `3002`
- Firecrawl API: `3002`
- AI Analytics: `3003`
- AI Chat: `3004`
- N8N: `5678`

### AI/ML Services
- Ollama: `11434`
- Firecrawl PostgreSQL: `5433`
- Firecrawl Redis: `6380`

### Analytics & Monitoring (ELK Stack)
- Elasticsearch: `9200`, `9300`
- Kibana: `5601`
- Logstash: `5044`, `9600`

### Reverse Proxy
- Nginx HTTP: `80`
- Nginx HTTPS: `443`

### DAPR Service Mesh
- Placement Service: `50006`
- FastAPI DAPR HTTP: `3500`, GRPC: `50001`
- Django Spellbook DAPR HTTP: `3501`, GRPC: `50002`

## Docker Multi-Stage Builds

### Frontend Dockerfile Stages
- **`base`** - Common Node.js setup with system dependencies
- **`deps`** - Install all npm dependencies
- **`builder`** - Build all frontend applications using Nx
- **`production`** - Minimal runtime image for production
- **`development`** - Development image with hot-reload

### Backend Dockerfile Stages
- **`base`** - Common Python setup
- **`django-builder`** - Django dependencies builder
- **`fastapi-builder`** - FastAPI dependencies builder
- **`django-production`** - Production Django image
- **`fastapi-production`** - Production FastAPI image
- **`development`** - Development image with dev tools
- **`celery-worker`** - Celery worker for background tasks
- **`celery-beat`** - Celery beat scheduler

## Usage Examples

### Start Everything

```bash
# Start all infrastructure, backend, and frontend services
docker-compose --profile all up -d

# Start all AI/ML services
docker-compose -f docker-compose-models.yml --profile all up -d
```

### Development Mode

```bash
# Build and start in development mode
docker-compose build --build-arg BUILD_ENV=development
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### Run Specific Service Groups

```bash
# Only Django services
docker-compose --profile django up -d

# Only workers
docker-compose --profile workers up -d

# Only Firecrawl stack
docker-compose -f docker-compose-models.yml --profile firecrawl up -d
```

### Stop Services

```bash
# Stop all services
docker-compose down
docker-compose -f docker-compose-models.yml down

# Stop and remove volumes
docker-compose down -v
docker-compose -f docker-compose-models.yml down -v
```

## Volume Management

Persistent data is stored in named volumes:

- `expert-dollop-postgres-data` - PostgreSQL database
- `expert-dollop-redis-data` - Redis cache
- `expert-dollop-rabbitmq-data` - RabbitMQ messages
- `expert-dollop-static-files` - Django static files
- `expert-dollop-media-files` - User uploaded media
- `expert-dollop-ollama-data` - Ollama models
- `expert-dollop-chroma-data` - Vector embeddings
- `expert-dollop-firecrawl-redis-data` - Firecrawl cache
- `expert-dollop-firecrawl-postgres-data` - Firecrawl database
- `expert-dollop-n8n-data` - N8N workflows

## Networking

All services are connected via the `expert-dollop-network` bridge network, allowing inter-service communication using service names as hostnames.

## Health Checks

Services include health checks for:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- RabbitMQ: `rabbitmq-diagnostics check_running`
- Backend services: HTTP health endpoints

## Build Context

The Dockerfiles are designed to be built from the repository root:

```bash
# Frontend build
docker build -f Dockerfile.frontend -t expert-dollop-frontend .

# Backend build
docker build -f Dockerfile.backend -t expert-dollop-backend .
```

## GPU Support

Ollama service includes GPU support for NVIDIA GPUs. Ensure you have:
- NVIDIA Docker runtime installed
- nvidia-docker2 package
- Proper GPU drivers

If you don't have GPU support, remove the `deploy.resources.reservations` section from the Ollama service in `docker-compose-models.yml`.

## Troubleshooting

### Check service status
```bash
docker-compose ps
docker-compose -f docker-compose-models.yml ps
```

### View logs
```bash
docker-compose logs -f [service-name]
docker-compose -f docker-compose-models.yml logs -f [service-name]
```

### Rebuild after code changes
```bash
docker-compose build [service-name]
docker-compose up -d [service-name]
```

### Access service shell
```bash
docker-compose exec [service-name] /bin/sh
docker-compose exec [service-name] /bin/bash
```

### Database migrations
```bash
# Django migrations
docker-compose exec django-spellbook python manage.py migrate

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d expert_dollop
```

## Security Notes

1. **Change default passwords** in `.env` before deploying to production
2. **Set strong SECRET_KEY** values
3. **Configure ALLOWED_HOSTS** properly
4. **Use HTTPS** in production (configure Nginx with SSL certificates)
5. **Secure API keys** - Never commit `.env` to version control
6. **Review exposed ports** - Only expose necessary ports to the host

## Feature Docker Files Organization

The `features/` directory contains Docker files organized by service type:

### Frontend Services (28 total)
Located in features directory, these provide specialized UI/web interfaces for various tools and platforms.

### Backend Services (54 total)
Located in features directory, these provide API services, data processing, and business logic.

### Infrastructure Services (15 total)
Support services like databases, caches, message queues, etc.

All of these can be integrated into the main compose files as needed. The current setup provides a foundation that can be extended by referencing specific feature Dockerfiles.

## Contributing

When adding new services:

1. Add service definition to appropriate compose file
2. Use existing network: `expert-dollop`
3. Add health checks where applicable
4. Document environment variables in `.env.example`
5. Update port mappings in this README
6. Use profiles to organize related services

## License

Apache-2.0
