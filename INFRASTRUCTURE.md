# Infrastructure Architecture - Expert Dollop

## Complete Infrastructure Overview

This document provides the complete and accurate infrastructure architecture for the Expert Dollop platform, correcting and expanding the initial Docker documentation.

## PostgreSQL Database - 11 Schemas

The platform uses PostgreSQL with **11 distinct schemas** (not 8 or 9):

| Schema | Purpose | Source |
|--------|---------|--------|
| **dispatch** | Dispatch and routing operations | infrastructure/postgres/schemas/dispatch.sql |
| **firecrawl** | Web scraping and crawling data | infrastructure/postgres/schemas/firecrawl.sql |
| **ghostwriter** | Content management data | infrastructure/postgres/schemas/ghostwriter.sql |
| **goose** | AI development assistant data | infrastructure/postgres/schemas/goose.sql |
| **hexstrike** | HexStrike game data | infrastructure/postgres/schemas/hexstrike.sql |
| **integration** | Cross-service integration data | infrastructure/postgres/schemas/integration.sql |
| **main** | Core application data | infrastructure/postgres/schemas/main.sql |
| **mealie** | Recipe management data | infrastructure/postgres/schemas/mealie.sql |
| **nemesis** | Nemesis game project data | infrastructure/postgres/schemas/nemesis.sql |
| **nemsis** | NEMSIS medical data | infrastructure/postgres/schemas/nemsis.sql |
| **tcg** | Trading Card Game data | infrastructure/postgres/schemas/tcg.sql |

All schema files are located in `/infrastructure/postgres/schemas/` and are automatically initialized on first container startup.

## Redis - 9 Active Databases

Redis is configured with **9 active databases** (0-8 out of 16 available):

| DB | Purpose | Used By | Config Location |
|----|---------|---------|-----------------|
| **0** | User sessions | Authentication services | infrastructure/redis/README.md |
| **1** | Application cache | General caching | infrastructure/redis/README.md |
| **2** | Rate limiting | API rate limiting | infrastructure/redis/README.md |
| **3** | **BullMQ job queues** | **All Node.js background jobs** | **infrastructure/bullmq/** |
| **4** | Pub/sub channels | Real-time messaging | infrastructure/redis/README.md |
| **5** | Security tokens | Auth tokens, locks | infrastructure/redis/README.md |
| **6** | TCG state cache | TCG game state | infrastructure/redis/README.md |
| **7** | AI model cache | LLM embeddings, cache | infrastructure/redis/README.md |
| **8** | Analytics data | Metrics aggregation | infrastructure/redis/README.md |

### BullMQ Infrastructure (Redis DB 3)

**Location**: `/infrastructure/bullmq/`

BullMQ provides centralized job queue management for all Node.js applications:

- **Shared connection pool**: Single Redis connection to DB 3
- **Standardized factories**: Queue and worker creation
- **Type safety**: Full TypeScript support
- **DAPR integration**: Queue events published to RabbitMQ
- **Multi-project support**: Firecrawl, N8N, Inspector, Dispatch, MCP servers

**Projects Using BullMQ**:
- Firecrawl API (already integrated)
- N8N (placeholder ready)
- Inspector (placeholder ready)
- Dispatch (placeholder ready)
- MCP Servers: VirusTotal, Firecrawl, N8N (placeholders ready)
- Generic queues: Email, Notifications, Analytics, Background Jobs

See `/infrastructure/bullmq/README.md` for detailed documentation.

## DAPR Service Mesh - 11 State Stores

**Location**: `/infrastructure/dapr/`

DAPR provides a service mesh implementing Domain-Driven Design (DDD) principles with **11 state store components** (one per PostgreSQL schema):

| State Store Component | PostgreSQL Schema | Purpose |
|-----------------------|-------------------|---------|
| `statestore-dispatch` | dispatch | Dispatch routing state |
| `statestore-firecrawl` | firecrawl | Web scraping state |
| `statestore-ghostwriter` | ghostwriter | Content management state |
| `statestore-goose` | goose | AI assistant state |
| `statestore-hexstrike` | hexstrike | HexStrike game state |
| `statestore-integration` | integration | Integration state |
| `statestore-main` | main | Core application state |
| `statestore-mealie` | mealie | Recipe management state |
| `statestore-nemesis` | nemesis | Nemesis project state |
| `statestore-nemsis` | nemsis | NEMSIS medical state |
| `statestore-tcg` | tcg | Trading card game state |

### DAPR Pub/Sub Components

**Location**: `/infrastructure/dapr/components/`

- `pubsub.yaml` - Main RabbitMQ pub/sub
- `pubsub-bullmq.yaml` - BullMQ integration
- `pubsub-firecrawl.yaml` - Firecrawl-specific pub/sub
- `pubsub-goose.yaml` - Goose-specific pub/sub
- `pubsub-integration.yaml` - Cross-service pub/sub

### DAPR Configuration

**Location**: `/infrastructure/dapr/config/config.yaml`

Provides:
- Access control and trust domains
- Schema isolation enforcement
- Rate limiting
- OAuth2 middleware
- Tracing and monitoring

See `/infrastructure/dapr/README.md` for complete documentation.

## RabbitMQ Message Broker

RabbitMQ serves as the backbone for:
- **DAPR pub/sub messaging**: Event-driven communication between services
- **Celery broker**: Python task queue messaging
- **Cross-service events**: Domain events for DDD compliance

**Ports**:
- 5672: AMQP protocol
- 15672: Management UI

## Elasticsearch/Kibana/Logstash Stack (HELK)

**Location**: `/features/HELK/docker/`

The HELK (Hunting ELK) stack provides:

### Elasticsearch
- **Purpose**: Search and analytics engine
- **Location**: `features/HELK/docker/helk-elasticsearch/`
- **Version**: 7.6.2
- **Port**: 9200

### Kibana
- **Purpose**: Data visualization and dashboards
- **Location**: `features/HELK/docker/helk-kibana/`
- **Version**: 7.6.2
- **Ports**: 5601 (UI), exposed via Nginx

### Logstash
- **Purpose**: Data processing pipeline
- **Location**: `features/HELK/docker/helk-logstash/`
- **Version**: 7.6.2
- **Ports**: 5044, 5514, 8515, 8516, 8531, 3515

### Supporting Services
- **Kafka**: Message streaming (Zookeeper, Broker, KSQL)
- **Spark**: Distributed processing (Master, Workers)
- **Nginx**: Reverse proxy with authentication

**Docker Compose Files**:
- `helk-kibana-analysis-basic.yml` - Basic ELK stack
- `helk-kibana-notebook-analysis-basic.yml` - With Jupyter notebooks
- `helk-kibana-analysis-alert-basic.yml` - With alerting
- `helk-kibana-notebook-analysis-alert-basic.yml` - Full stack

## Additional Infrastructure Services

### From Features Directory

**Kong API Gateway**:
- Location: `features/kong/`
- Purpose: API gateway and management
- Services: Kong, PostgreSQL, Redis

**Kafka/Zookeeper** (HELK):
- Location: `features/HELK/docker/`
- Purpose: Event streaming
- Ports: 9092 (Kafka), 2181 (Zookeeper)

**Apache Spark** (HELK):
- Location: `features/HELK/docker/`
- Purpose: Distributed data processing
- Components: Master, Workers

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  Frontend Apps (22) | Backend APIs (Django/FastAPI) | Workers    │
└──────────────┬──────────────────────┬────────────────┬───────────┘
               │                      │                │
               ├──────────────────────┼────────────────┤
               │                      │                │
┌──────────────┴──────────┐ ┌─────────┴────────┐ ┌────┴──────────┐
│   PostgreSQL (11)       │ │   Redis (9 DBs)  │ │   RabbitMQ    │
├─────────────────────────┤ ├──────────────────┤ ├───────────────┤
│ • dispatch              │ │ 0: sessions      │ │ • DAPR pub/sub│
│ • firecrawl             │ │ 1: cache         │ │ • Celery      │
│ • ghostwriter           │ │ 2: rate_limit    │ │ • Events      │
│ • goose                 │ │ 3: BullMQ ★      │ └───────────────┘
│ • hexstrike             │ │ 4: pubsub        │
│ • integration           │ │ 5: security      │ ┌───────────────┐
│ • main                  │ │ 6: tcg_state     │ │ DAPR (11)     │
│ • mealie                │ │ 7: ai_cache      │ ├───────────────┤
│ • nemesis               │ │ 8: analytics     │ │ State Stores  │
│ • nemsis                │ └──────────────────┘ │ (1 per schema)│
│ • tcg                   │                      └───────────────┘
└─────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────────────────┐
│              Optional Analytics Stack (HELK)                     │
├──────────────────────────────────────────────────────────────────┤
│  Elasticsearch | Kibana | Logstash | Kafka | Spark | Jupyter    │
└──────────────────────────────────────────────────────────────────┘
```

## Infrastructure Files Reference

| Component | Location | Files |
|-----------|----------|-------|
| PostgreSQL Schemas | `/infrastructure/postgres/schemas/` | 11 .sql files |
| Redis Config | `/infrastructure/redis/` | README.md, configs/ |
| BullMQ | `/infrastructure/bullmq/` | README.md, config/, types/, queues/ |
| DAPR Components | `/infrastructure/dapr/components/` | 11 state stores + pub/sub yamls |
| DAPR Config | `/infrastructure/dapr/config/` | config.yaml |
| Docker Base | `/infrastructure/docker/` | docker-compose.yml, Dockerfiles |
| HELK Stack | `/features/HELK/docker/` | Multiple docker-compose.yml files |

## Service-to-Infrastructure Mapping

### Django Services
| Service | PostgreSQL Schema | Redis DB | DAPR State Store |
|---------|-------------------|----------|------------------|
| spellbook | tcg | 0 (sessions) | statestore-tcg |
| security | main | 5 (security) | statestore-main |
| mtg | tcg | 6 (tcg_state) | statestore-tcg |
| nemesis | nemesis | 1 (cache) | statestore-nemesis |

### FastAPI Services
| Service | PostgreSQL Schema | Redis DB | DAPR State Store |
|---------|-------------------|----------|------------------|
| fastapi-core | main | 1 (cache) | statestore-main |
| firecrawl-api | firecrawl | 1 (cache) | statestore-firecrawl |

### Node.js Services (BullMQ)
| Service | Redis DB | Queues |
|---------|----------|--------|
| Firecrawl API | 3 (BullMQ) | scrape, crawl, map, extract, search |
| N8N | 3 (BullMQ) | workflow, execution |
| Inspector | 3 (BullMQ) | analysis |
| Dispatch | 3 (BullMQ) | incident, notification |

## Summary of Corrections

From the initial documentation:

| Item | Initial | Corrected | Source |
|------|---------|-----------|--------|
| PostgreSQL Schemas | 8-9 | **11** | `infrastructure/postgres/schemas/` |
| Redis Databases | Not specified | **9 (0-8)** | `infrastructure/redis/README.md` |
| BullMQ Database | Not mentioned | **Redis DB 3** | `infrastructure/bullmq/README.md` |
| DAPR State Stores | Not fully specified | **11** | `infrastructure/dapr/components/` |
| DAPR Pub/Sub | Mentioned | **5 components** | `infrastructure/dapr/components/` |
| Elasticsearch Stack | Not included | **Available (HELK)** | `features/HELK/docker/` |
| Kafka/Spark | Not mentioned | **Available (HELK)** | `features/HELK/docker/` |

## Next Steps

1. Update `docker-compose.yml` with:
   - Correct PostgreSQL schema count (11)
   - Redis database documentation (9 active DBs, DB 3 for BullMQ)
   - DAPR placement service
   - BullMQ worker container
   - Optional ELK stack profile

2. Update `docker-compose-models.yml` with:
   - Better integration with main compose file
   - References to shared Redis and PostgreSQL

3. Update `DOCKER.md` with:
   - Complete infrastructure overview
   - Correct service counts and mappings
   - BullMQ documentation
   - DAPR documentation
   - ELK stack information

4. Update `.env.example` with:
   - BullMQ configuration variables
   - DAPR configuration variables
   - ELK stack variables

## References

- Infrastructure README: `/infrastructure/README.md`
- PostgreSQL README: `/infrastructure/postgres/README.md`
- Redis README: `/infrastructure/redis/README.md`
- BullMQ README: `/infrastructure/bullmq/README.md`
- DAPR README: `/infrastructure/dapr/README.md`
- HELK Documentation: `/features/HELK/`
