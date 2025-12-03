# Infrastructure

This directory contains infrastructure configuration and shared services for the expert-dollop platform.

## Components

### BullMQ (`/bullmq`)
Centralized job queue management system for all Node.js applications using BullMQ and Redis.

**Key Features:**
- Shared Redis connection pool (Database 3)
- Standardized queue and worker factories
- TypeScript type safety
- DAPR pub/sub integration
- Predefined queues for all Node.js projects

**Projects Using BullMQ:**
- Firecrawl API (already integrated)
- N8N (placeholder ready)
- Inspector (placeholder ready)
- Dispatch (placeholder ready)
- MCP Servers: VirusTotal, Firecrawl (placeholders ready)
- Generic: Email, Notifications, Analytics, Background Jobs

See [BullMQ README](./bullmq/README.md) for detailed documentation.

### DAPR (`/dapr`)
Service mesh configuration providing:
- State management via PostgreSQL
- Pub/Sub messaging via RabbitMQ
- Domain-Driven Design (DDD) compliance
- Schema isolation for bounded contexts

See [DAPR README](./dapr/README.md) for usage.

### Docker (`/docker`)
Docker Compose configurations for:
- PostgreSQL database
- Redis cache/queues
- RabbitMQ message broker
- DAPR placement service
- Backend services (FastAPI, Django)

### PostgreSQL (`/postgres`)
Database schemas for domain separation:
- dispatch
- hexstrike
- mealie
- tcg
- nemesis
- main
- ghostwriter
- nemsis
- firecrawl

### Redis (`/redis`)
Redis database allocations:
- DB 0: Sessions
- DB 1: Cache
- DB 2: Rate limiting
- **DB 3: Job queues (BullMQ)**
- DB 4: Pub/sub
- DB 5: Security tokens
- DB 6: TCG state cache
- DB 7: AI cache
- DB 8: Analytics

See [Redis README](./redis/README.md) for details.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Applications                      │
│  (Firecrawl, N8N, Inspector, Dispatch, MCP Servers, etc.)  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├──► BullMQ Infrastructure
                    │    └──► Redis DB 3 (Queues)
                    │
                    ├──► DAPR Service Mesh
                    │    ├──► PostgreSQL (State Stores)
                    │    └──► RabbitMQ (Pub/Sub)
                    │
                    └──► Redis (Sessions, Cache, etc.)
```

## Getting Started

### Start Infrastructure

```bash
cd infrastructure/docker
docker-compose up -d postgres redis rabbitmq
```

### Start with DAPR (recommended)

```bash
cd infrastructure/docker
docker-compose --profile dapr up -d
```

### Use BullMQ in Your Node.js Project

```typescript
import {
  createQueue,
  createWorker,
  QueueName,
} from '@expert-dollop/bullmq-infrastructure';

// Create a queue
const queue = createQueue(QueueName.EMAIL);

// Add a job
await queue.add('send-welcome', {
  to: 'user@example.com',
  subject: 'Welcome!',
});

// Create a worker
const worker = createWorker(QueueName.EMAIL, async (job) => {
  console.log('Processing email:', job.data);
  // Process email...
  return { success: true };
});
```

## License

Apache-2.0
