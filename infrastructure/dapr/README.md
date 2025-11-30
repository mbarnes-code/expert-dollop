# DAPR Service Mesh Configuration

This directory contains DAPR (Distributed Application Runtime) configuration for the Expert-Dollop platform, implementing Domain-Driven Design (DDD) principles.

## Overview

DAPR provides a service mesh architecture for:
- **State Management**: Database-agnostic state storage via DAPR State API
- **Pub/Sub Messaging**: Event-driven communication via RabbitMQ
- **Schema Isolation**: Bounded contexts with PostgreSQL schema restrictions

## DDD Compliance

| Principle | Implementation |
|-----------|----------------|
| **Bounded Contexts** | Each module owns its data via PostgreSQL schema isolation |
| **No Direct DB Access** | Modules use DAPR State API as abstraction layer |
| **Event-Driven** | Modules communicate via RabbitMQ Pub/Sub (loose coupling) |
| **Database Agnostic** | Can swap PostgreSQL → CosmosDB without code changes |
| **Schema Boundaries** | DAPR components enforce `search_path` restrictions |

## Directory Structure

```
dapr/
├── config/
│   └── config.yaml           # Main DAPR configuration
├── components/
│   ├── pubsub.yaml           # RabbitMQ pub/sub component
│   ├── statestore-main.yaml  # Core application state
│   ├── statestore-tcg.yaml   # TCG domain state
│   ├── statestore-nemesis.yaml
│   ├── statestore-dispatch.yaml
│   ├── statestore-hexstrike.yaml
│   ├── statestore-mealie.yaml
│   ├── statestore-ghostwriter.yaml
│   └── statestore-nemsis.yaml
└── README.md
```

## State Store Components

Each state store component maps to a PostgreSQL schema (bounded context):

| Component | Schema | Purpose |
|-----------|--------|---------|
| `statestore-main` | main | Core application data |
| `statestore-tcg` | tcg | Trading Card Game data |
| `statestore-nemesis` | nemesis | Nemesis game data |
| `statestore-dispatch` | dispatch | Dispatch routing |
| `statestore-hexstrike` | hexstrike | HexStrike game |
| `statestore-mealie` | mealie | Recipe management |
| `statestore-ghostwriter` | ghostwriter | Content management |
| `statestore-nemsis` | nemsis | NEMSIS medical data |

## Pub/Sub Topics

Standard topics for cross-module communication:

| Topic | Purpose |
|-------|---------|
| `user.created` | User registration events |
| `user.updated` | User profile updates |
| `order.placed` | Order creation events |
| `card.added` | TCG card additions |
| `deck.created` | TCG deck creation |
| `security.alert` | Security events |
| `audit.log` | Audit trail events |

## Usage

### Starting DAPR Sidecar

```bash
# With Docker Compose (recommended)
docker-compose up -d

# Manual (development)
dapr run --app-id fastapi --app-port 8000 --dapr-http-port 3500 \
  --components-path ./infrastructure/dapr/components \
  --config ./infrastructure/dapr/config/config.yaml \
  -- python -m uvicorn backend.api.fastapi.src.main:app
```

### State Operations (via DAPR API)

```bash
# Save state
curl -X POST http://localhost:3500/v1.0/state/statestore-tcg \
  -H "Content-Type: application/json" \
  -d '[{"key": "card-123", "value": {"name": "Black Lotus"}}]'

# Get state
curl http://localhost:3500/v1.0/state/statestore-tcg/card-123

# Delete state
curl -X DELETE http://localhost:3500/v1.0/state/statestore-tcg/card-123
```

### Publishing Events

```bash
curl -X POST http://localhost:3500/v1.0/publish/pubsub/card.added \
  -H "Content-Type: application/json" \
  -d '{"cardId": "123", "name": "Black Lotus"}'
```

## Swapping Database Backends

To switch from PostgreSQL to CosmosDB (no code changes required):

1. Update component type:
   ```yaml
   spec:
     type: state.azure.cosmosdb
   ```

2. Update metadata:
   ```yaml
   metadata:
     - name: url
       value: "<cosmos-url>"
     - name: masterKey
       value: "<cosmos-key>"
     - name: database
       value: "expert-dollop"
     - name: collection
       value: "state"
   ```

3. Restart DAPR sidecar

## Security

- Access control enforces trust domain boundaries
- Schema isolation prevents cross-context data access
- Rate limiting protects against abuse
- OAuth2 middleware for authentication
