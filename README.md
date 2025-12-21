# Expert-Dollop Platform

A domain-based NX monorepo implementing a comprehensive multi-domain architecture using PNPM as the package manager.

## Architecture Overview

This platform consists of 22 Next.js frontend applications organized by domain, with a modular backend supporting both FastAPI and Django, PostgreSQL with 8 schemas, Redis with 9 databases, DAPR service mesh for state management and pub/sub messaging, and MCP server integration.

### DAPR Service Mesh (DDD Compliant)

The platform uses DAPR (Distributed Application Runtime) to enforce Domain-Driven Design (DDD) principles:

| Principle | Implementation |
|-----------|----------------|
| **Bounded Contexts** | Each module owns its data via PostgreSQL schema isolation |
| **No Direct DB Access** | Modules use DAPR State API as abstraction layer |
| **Event-Driven** | Modules communicate via RabbitMQ Pub/Sub (loose coupling) |
| **Database Agnostic** | Can swap PostgreSQL → CosmosDB without code changes |
| **Schema Boundaries** | DAPR components enforce `search_path` restrictions |

### Frontend Applications (Next.js + React)

| Domain | Applications | Count |
|--------|--------------|-------|
| **Security** | auth, firewall, scanner, monitor, vault, compliance, audit | 7 |
| **Productivity** | tasks, calendar, notes, documents, projects, dashboard | 6 |
| **AI** | chat, models, training, analytics | 4 |
| **TCG** | collection, decks, marketplace, tournaments, analytics | 5 |

### Backend Architecture

#### API Layer
- **FastAPI**: High-performance async API with DAPR integration
- **Django REST Framework**: Full-featured web framework with DAPR integration
- **Modular design**: Choose backend per service
- **DAPR Sidecar**: State management and pub/sub for each service

#### Django Projects
- `mtg` - Magic: The Gathering backend
- `nemesis` - Nemesis game backend
- `security` - Security services backend

#### PostgreSQL Schemas (9)
| Schema | Purpose |
|--------|---------|
| dispatch | Dispatch and routing operations |
| hexstrike | HexStrike game data |
| mealie | Recipe management |
| tcg | Trading Card Game data |
| nemesis | Nemesis game data |
| main | Core application data |
| ghostwriter | Content management |
| nemsis | NEMSIS medical data |
| firecrawl | Web scraping and crawling data |

#### Redis Databases (9)
| DB | Purpose |
|----|---------|
| 0 | User sessions |
| 1 | Application cache |
| 2 | Rate limiting |
| **3** | **Job queues (BullMQ)** |
| 4 | Pub/sub channels |
| 5 | Security tokens |
| 6 | TCG state cache |
| 7 | AI model cache |
| 8 | Analytics data |

#### BullMQ Job Queue System
Centralized job queue management for all Node.js applications using BullMQ and Redis database 3.

**Features:**
- Shared connection pool and queue factory
- Predefined queues for common use cases
- TypeScript type safety
- DAPR pub/sub integration
- Support for: Firecrawl, N8N, Inspector, Dispatch, MCP servers

**Usage:**
```typescript
import { createQueue, createWorker, QueueName } from '@expert-dollop/bullmq-infrastructure';

const queue = createQueue(QueueName.EMAIL);
await queue.add('send', { to: 'user@example.com', subject: 'Hello' });
```

See [BullMQ Infrastructure README](./infrastructure/bullmq/README.md) for details.

#### DAPR State Stores (9)
Each state store maps to a PostgreSQL schema (bounded context):

| State Store | Schema |
|-------------|--------|
| statestore-main | main |
| statestore-tcg | tcg |
| statestore-nemesis | nemesis |
| statestore-dispatch | dispatch |
| statestore-hexstrike | hexstrike |
| statestore-mealie | mealie |
| statestore-ghostwriter | ghostwriter |
| statestore-nemsis | nemsis |
| statestore-firecrawl | firecrawl |

#### MCP Server Integration
- Extensible MCP server framework
- Tool, prompt, and resource protocols
- AI model integration ready

## Project Structure

```
expert-dollop/
├── apps/                          # Frontend applications
│   ├── security/                  # 7 security apps
│   ├── productivity/              # 6 productivity apps
│   ├── ai/                        # 4 AI apps
│   └── tcg/                       # 5 TCG apps
├── libs/                          # Shared libraries
│   ├── shared/                    # Cross-domain shared libs
│   │   └── data-access/           # DAPR client for frontends
│   ├── security/                  # Security domain libs
│   ├── productivity/              # Productivity domain libs
│   ├── ai/                        # AI domain libs
│   └── tcg/                       # TCG domain libs
├── backend/                       # Backend services
│   ├── api/                       # API layer
│   │   ├── core/dapr/             # Python DAPR client
│   │   └── fastapi/               # FastAPI with DAPR
│   ├── django/                    # Django projects
│   │   ├── dapr_client/           # Django DAPR client
│   │   └── ...                    # Django apps
│   └── services/                  # Additional services (MCP)
├── infrastructure/                # Infrastructure configs
│   ├── bullmq/                    # BullMQ job queue system
│   │   ├── config/                # Connection & factory configs
│   │   ├── queues/                # Predefined queue configs
│   │   └── types/                 # TypeScript type definitions
│   ├── dapr/                      # DAPR configuration
│   │   ├── components/            # State stores & pub/sub
│   │   └── config/                # DAPR config
│   ├── docker/                    # Docker configurations
│   ├── postgres/                  # PostgreSQL schemas
│   └── redis/                     # Redis configurations
└── tools/                         # Build tools and generators
```

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 10+
- Python 3.11+ (for backend)
- Docker & Docker Compose (for infrastructure)
- DAPR CLI (optional, for local development)

### Quick Start with Docker

The easiest way to get started is using Docker:

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 2. Start infrastructure only
make infra-up

# 3. Start all backend services
make backend-up

# 4. Start all frontend services
make frontend-up

# 5. (Optional) Start AI/ML services
make ai-up

# See all available commands
make help
```

For detailed Docker documentation, see [DOCKER.md](DOCKER.md).

### Installation (Manual)

```bash
# Install dependencies
pnpm install

# Start infrastructure with RabbitMQ
cd infrastructure/docker
docker-compose up -d postgres redis rabbitmq

# Start with DAPR sidecars (recommended for full DDD compliance)
docker-compose --profile dapr up -d

# Start development
pnpm dev
```

### Common Commands

```bash
# Build all projects
pnpm build

# Lint all projects
pnpm lint

# Test all projects
pnpm test

# Run specific app
pnpm nx dev security-auth

# Build specific library
pnpm nx build shared-ui
```

### Docker Management

```bash
# View all Docker commands
make help

# Start everything
make up-all

# View service status
make ps

# View logs
make logs

# Stop everything
make down
```

## Domain Architecture

### Security Domain
Applications and services for authentication, authorization, firewall management, security scanning, monitoring, vault management, compliance tracking, and audit logging.

### Productivity Domain
Applications for task management, calendar, notes, document editing, project management, and unified dashboards.

### AI Domain
Applications for AI chat interfaces, model management, training pipelines, and AI analytics.

#### Firecrawl Integration
Web scraping and crawling service integrated using the strangler fig pattern:
- **firecrawl-api**: TypeScript API service with Express.js and BullMQ
- **playwright-service**: Dedicated browser automation microservice
- **firecrawl-ui**: React-based ingestion interface
- **firecrawl-sdks**: Multi-language SDKs (JavaScript, Python, Rust)
- **firecrawl-examples**: 50+ AI/ML integration examples

See `apps/ai/README-FIRECRAWL.md` for detailed documentation.

### TCG Domain
Applications for trading card game collection management, deck building, marketplace, tournaments, and analytics.

## Backend Selection

The backend API layer supports both FastAPI and Django with DAPR integration:

### FastAPI (with DAPR)
```bash
cd backend/api/fastapi
pip install -r requirements.txt

# With DAPR sidecar
dapr run --app-id fastapi --app-port 8000 --dapr-http-port 3500 \
  --components-path ../../infrastructure/dapr/components \
  --config ../../infrastructure/dapr/config/config.yaml \
  -- uvicorn src.main:app --reload
```

### Django (with DAPR)
```bash
cd backend/django/mtg  # or nemesis, security
pip install -r requirements.txt

# With DAPR sidecar
dapr run --app-id django-mtg --app-port 8000 --dapr-http-port 3501 \
  --components-path ../../../infrastructure/dapr/components \
  --config ../../../infrastructure/dapr/config/config.yaml \
  -- python manage.py runserver
```

## DAPR Integration

### Using DAPR State API (Python - FastAPI)

```python
from core.dapr import DaprClient, StateStore, Topic

# Initialize client
client = DaprClient(app_id="tcg-service")

# Save state (no direct DB access)
await client.save_state(StateStore.TCG, "card-123", {"name": "Black Lotus"})

# Get state
card = await client.get_state(StateStore.TCG, "card-123")

# Publish event (event-driven communication)
await client.publish(Topic.CARD_ADDED, {"cardId": "123"})
```

### Using DAPR State API (TypeScript - Next.js)

```typescript
import { DaprClient, StateStore, Topic } from '@expert-dollop/shared-data-access';

// Initialize client
const client = new DaprClient({ appId: 'tcg-frontend' });

// Save state (no direct DB access)
await client.saveState(StateStore.TCG, 'card-123', { name: 'Black Lotus' });

// Get state
const card = await client.getState(StateStore.TCG, 'card-123');

// Publish event (event-driven communication)
await client.publish(Topic.CARD_ADDED, { cardId: '123' });
```

### Swapping Database Backends

One of the key DDD benefits: swap databases without code changes.

```yaml
# From PostgreSQL
spec:
  type: state.postgresql

# To CosmosDB (no code changes required)
spec:
  type: state.azure.cosmosdb
```

## License

Apache-2.0