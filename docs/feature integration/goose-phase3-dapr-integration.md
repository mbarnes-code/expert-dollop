# Goose Phase 3: DAPR Backend Integration - Implementation Guide

## Overview

**Phase**: 3 - Backend Service Migration  
**Status**: Complete ✅  
**Completion Date**: 2025-12-03  
**Libraries**: `@expert-dollop/ai/agent-dapr`

## What Was Accomplished

Phase 3 successfully integrated Goose AI Agent with DAPR (Distributed Application Runtime), enabling:

1. **DAPR State Stores** - PostgreSQL-backed state management with schema isolation
2. **DAPR Pub/Sub** - Event-driven communication via RabbitMQ
3. **Repository Implementations** - DAPR-based persistence for conversations and recipes
4. **Event Publishing** - Typed event system for agent activities
5. **Database Schema** - Proper PostgreSQL schema with indexes and triggers

## Components Created

### 1. DAPR Infrastructure

#### State Store Component

**File**: `infrastructure/dapr/components/statestore-goose.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore-goose
spec:
  type: state.postgresql
  metadata:
    - name: connectionString
      value: "...options='-c search_path=goose'"
```

**Features**:
- PostgreSQL state store
- Schema isolation (search_path=goose)
- Key prefix for namespacing
- Actor state store enabled

**Scopes**:
- goose-server
- goose-cli
- ai-agent-service
- ai-chat, ai-models, ai-training, ai-analytics

#### Pub/Sub Component

**File**: `infrastructure/dapr/components/pubsub-goose.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-goose
spec:
  type: pubsub.rabbitmq
```

**Event Topics**:
- `goose.agent.message.sent` - Agent sent a message
- `goose.agent.message.received` - Agent received a message
- `goose.agent.tool.executed` - Tool was executed
- `goose.recipe.started` - Recipe execution started
- `goose.recipe.completed` - Recipe execution completed
- `goose.recipe.failed` - Recipe execution failed
- `goose.recipe.step.started` - Recipe step started
- `goose.recipe.step.completed` - Recipe step completed
- `goose.extension.loaded` - Extension loaded
- `goose.extension.unloaded` - Extension unloaded
- `goose.extension.error` - Extension error occurred
- `goose.conversation.created` - Conversation created
- `goose.conversation.updated` - Conversation updated
- `goose.conversation.deleted` - Conversation deleted

### 2. PostgreSQL Schema

**File**: `infrastructure/postgres/schemas/goose.sql`

**Tables Created**:

1. **dapr_state** - DAPR managed state (key-value)
2. **conversations** - Agent conversations with message history
3. **recipes** - Workflow automation recipes
4. **recipe_executions** - Recipe execution history and results
5. **extensions** - MCP extensions registry
6. **agent_sessions** - Agent execution sessions with token usage
7. **events** - Event log for pub/sub and audit trail

**Features**:
- Proper indexes for performance
- Triggers for automatic timestamp updates
- Foreign key constraints
- JSONB columns for flexible data
- Comments for documentation

**Key Features**:
```sql
-- Automatic timestamp updates
CREATE TRIGGER conversations_update_timestamp
    BEFORE UPDATE ON goose.conversations
    FOR EACH ROW
    EXECUTE FUNCTION goose.update_timestamp();

-- Indexes for common queries
CREATE INDEX idx_conversations_user ON goose.conversations(user_id);
CREATE INDEX idx_conversations_updated ON goose.conversations(updated_at DESC);
```

### 3. TypeScript DAPR Library

**Package**: `@expert-dollop/ai/agent-dapr`

#### Repository Implementations

**DaprConversationRepository**

Implements `ConversationRepository` using DAPR state store:

```typescript
import { DaprConversationRepository } from '@expert-dollop/ai/agent-dapr';

const repo = new DaprConversationRepository();

// Save conversation
await repo.save(conversation);

// Find by ID
const conv = await repo.findById('conv-123');

// List conversations
const convs = await repo.list({ limit: 10 });

// Update conversation
await repo.update('conv-123', { title: 'Updated' });

// Delete conversation
await repo.delete('conv-123');
```

**Key Features**:
- Automatic index management
- Proper key prefixing
- Error handling
- TypeScript type safety

**DaprRecipeRepository**

Implements `RecipeRepository` using DAPR state store:

```typescript
import { DaprRecipeRepository } from '@expert-dollop/ai/agent-dapr';

const repo = new DaprRecipeRepository();

// Save recipe
await repo.save(recipe);

// Find by name
const recipes = await repo.findByName('automation-task');

// List with filters
const filtered = await repo.list({
  category: 'automation',
  tags: ['dev', 'testing'],
});
```

**Key Features**:
- Name-based indexing
- Tag filtering
- Category filtering
- Efficient lookups

#### Event Publisher

**AgentEventPublisher**

Publishes events to RabbitMQ via DAPR pub/sub:

```typescript
import { AgentEventPublisher, AgentEventType } from '@expert-dollop/ai/agent-dapr';

const publisher = new AgentEventPublisher();

// Publish message event
await publisher.publishMessageEvent('msg-123', 'conv-123', 'user-456');

// Publish recipe event
await publisher.publishRecipeEvent(
  AgentEventType.RecipeStarted,
  'recipe-123',
  'exec-456',
  { parameters: {} }
);

// Publish extension event
await publisher.publishExtensionEvent(
  AgentEventType.ExtensionLoaded,
  'ext-123'
);

// Publish conversation event
await publisher.publishConversationEvent(
  AgentEventType.ConversationCreated,
  'conv-123'
);
```

**Event Structure**:
```typescript
interface AgentEvent<T = any> {
  eventType: AgentEventType;
  entityType: string;
  entityId: string;
  data: T;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Architecture Benefits

### 1. Database Abstraction

**Before (Goose Rust)**:
```rust
// Direct SQLite access
let conn = Connection::open("goose.db")?;
conn.execute("INSERT INTO conversations ...")?;
```

**After (DAPR)**:
```typescript
// DAPR state store (can swap backends)
await daprClient.state.save('statestore-goose', [{
  key: 'conversation:123',
  value: conversation
}]);
```

**Benefits**:
- Swap from PostgreSQL to CosmosDB without code changes
- Multi-region replication
- Built-in caching
- Consistent API

### 2. Event-Driven Communication

**Pub/Sub Pattern**:
```typescript
// Publisher (Goose)
await publisher.publishRecipeEvent(
  AgentEventType.RecipeCompleted,
  recipeId,
  executionId,
  results
);

// Subscriber (n8n)
daprClient.pubsub.subscribe(
  'pubsub-goose',
  'goose.recipe.completed',
  async (event) => {
    // Trigger n8n workflow
    await triggerWorkflow(event.data);
  }
);
```

**Benefits**:
- Loose coupling between services
- Easy integration with n8n
- Audit trail
- Analytics and monitoring

### 3. Schema Isolation (DDD)

```sql
-- Each bounded context owns its schema
CREATE SCHEMA IF NOT EXISTS goose;
SET search_path TO goose;

-- Enforced via DAPR connection string
options='-c search_path=goose'
```

**Benefits**:
- Clear boundaries between domains
- No accidental cross-schema queries
- Independent schema evolution
- Database-level isolation

## Integration Patterns

### Pattern 1: Service with DAPR Sidecar

```typescript
// Express server with DAPR repositories
import express from 'express';
import { DaprConversationRepository, AgentEventPublisher } from '@expert-dollop/ai/agent-dapr';

const app = express();
const conversationRepo = new DaprConversationRepository();
const eventPublisher = new AgentEventPublisher();

app.post('/api/conversations', async (req, res) => {
  const conversation = {
    id: generateId(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await conversationRepo.save(conversation);
  await eventPublisher.publishConversationEvent(
    AgentEventType.ConversationCreated,
    conversation.id
  );
  
  res.json(conversation);
});
```

**Run with DAPR**:
```bash
dapr run \
  --app-id goose-server \
  --app-port 8000 \
  --dapr-http-port 3500 \
  --components-path ./infrastructure/dapr/components \
  --config ./infrastructure/dapr/config/config.yaml \
  -- node dist/server.js
```

### Pattern 2: Event Subscriber

```typescript
// Subscribe to Goose events
import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();

// Subscribe to recipe completion
await daprClient.pubsub.subscribe(
  'pubsub-goose',
  'goose.recipe.completed',
  async (event) => {
    console.log('Recipe completed:', event.data);
    
    // Update analytics
    await analytics.trackRecipeCompletion(event.data);
    
    // Trigger notifications
    await notifications.send(event.userId, 'Recipe completed!');
  }
);
```

### Pattern 3: n8n Integration

**n8n Workflow**:
```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.rabbitmqTrigger",
      "parameters": {
        "queue": "goose.recipe.completed",
        "exchange": "pubsub-goose"
      }
    },
    {
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return items.map(item => ({\n  json: {\n    recipeId: item.json.entityId,\n    status: 'completed'\n  }\n}));"
      }
    },
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "workflow-trigger",
        "method": "POST"
      }
    }
  ]
}
```

## Docker Compose Setup

```yaml
version: '3.8'

services:
  # PostgreSQL database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: expert_dollop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./infrastructure/postgres/schemas:/docker-entrypoint-initdb.d

  # RabbitMQ for pub/sub
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  # Goose server
  goose-server:
    build: ./backend/services/goose
    ports:
      - "8000:8000"
    environment:
      - DAPR_HTTP_PORT=3500
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/expert_dollop
    depends_on:
      - postgres
      - rabbitmq

  # DAPR sidecar for Goose
  goose-server-dapr:
    image: daprio/dapr:latest
    command: [
      "./daprd",
      "--app-id", "goose-server",
      "--app-port", "8000",
      "--dapr-http-port", "3500",
      "--components-path", "/components",
      "--config", "/config/config.yaml"
    ]
    volumes:
      - ./infrastructure/dapr/components:/components
      - ./infrastructure/dapr/config:/config
    depends_on:
      - goose-server
      - postgres
      - rabbitmq
    network_mode: "service:goose-server"
```

## Migration Strategy

### From SQLite to DAPR

Phase 3 provides a migration path from Goose's SQLite storage:

**Step 1: Dual-Write**
```typescript
async function saveConversation(conversation: Conversation) {
  // Write to both SQLite and DAPR
  await sqliteRepo.save(conversation);
  await daprRepo.save(conversation);
}
```

**Step 2: Verify Consistency**
```typescript
async function verifyConsistency(id: string) {
  const sqliteConv = await sqliteRepo.findById(id);
  const daprConv = await daprRepo.findById(id);
  
  assert.deepEqual(sqliteConv, daprConv);
}
```

**Step 3: Switch Reads**
```typescript
async function getConversation(id: string) {
  // Start reading from DAPR
  return await daprRepo.findById(id);
}
```

**Step 4: Remove SQLite**
```typescript
// Clean up old implementation
// Remove sqliteRepo usage
```

## Testing

```typescript
import { DaprConversationRepository } from '@expert-dollop/ai/agent-dapr';
import { DaprClient } from '@dapr/dapr';

describe('DaprConversationRepository', () => {
  let repo: DaprConversationRepository;
  let mockClient: jest.Mocked<DaprClient>;

  beforeEach(() => {
    mockClient = {
      state: {
        get: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repo = new DaprConversationRepository(mockClient);
  });

  it('saves conversation to state store', async () => {
    const conversation = {
      id: 'conv-123',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.save(conversation);

    expect(mockClient.state.save).toHaveBeenCalledWith(
      'statestore-goose',
      expect.arrayContaining([
        expect.objectContaining({
          key: 'conversation:conv-123',
          value: conversation,
        }),
      ])
    );
  });

  it('retrieves conversation by ID', async () => {
    const conversation = {
      id: 'conv-123',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockClient.state.get.mockResolvedValue(conversation);

    const result = await repo.findById('conv-123');

    expect(result).toEqual(conversation);
    expect(mockClient.state.get).toHaveBeenCalledWith(
      'statestore-goose',
      'conversation:conv-123'
    );
  });
});
```

## Performance Considerations

### Indexing Strategy

```sql
-- Indexes for common query patterns
CREATE INDEX idx_conversations_user ON goose.conversations(user_id);
CREATE INDEX idx_conversations_updated ON goose.conversations(updated_at DESC);
CREATE INDEX idx_recipes_name ON goose.recipes(name);
CREATE INDEX idx_recipe_executions_status ON goose.recipe_executions(status);
```

### Caching Strategy

DAPR supports TTL-based caching:

```typescript
await daprClient.state.save('statestore-goose', [
  {
    key: 'conversation:123',
    value: conversation,
    metadata: {
      ttlInSeconds: '3600' // Cache for 1 hour
    }
  }
]);
```

### Query Optimization

For complex queries, consider:

1. **Separate index tables** for filtering
2. **PostgreSQL query API** via DAPR
3. **Read replicas** for analytics
4. **Materialized views** for aggregations

## Monitoring & Observability

### DAPR Metrics

DAPR exposes metrics:
- State store operations
- Pub/sub messages
- Service invocations
- Error rates

**Prometheus scraping**:
```yaml
- job_name: 'dapr'
  static_configs:
    - targets: ['localhost:9090']
```

### Event Logging

All events are logged in the events table:

```sql
SELECT 
  event_type,
  entity_type,
  COUNT(*) as count
FROM goose.events
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY event_type, entity_type;
```

### Distributed Tracing

DAPR integrates with Zipkin:

```yaml
# infrastructure/dapr/config/config.yaml
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin:9411/api/v2/spans"
```

## Security Considerations

### State Store Security

- PostgreSQL connection uses search_path restriction
- DAPR enforces access control policies
- Encryption at rest via PostgreSQL
- TLS for data in transit

### Pub/Sub Security

- RabbitMQ authentication required
- DAPR validates message signatures
- Topic-based access control
- Message encryption supported

### Secret Management

Use DAPR secret stores:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
spec:
  type: secretstores.kubernetes
```

## Next Steps: Phase 4

With DAPR integration complete, Phase 4 will:

1. **Create shared UI components** in `libs/ai/ui/`
2. **Integrate with `apps/ai/chat/`** using DAPR repos
3. **Unified authentication** across frontend and backend
4. **Shared state management** with React hooks
5. **Real-time updates** via WebSockets and pub/sub

## Summary

Phase 3 successfully integrated Goose with DAPR, enabling:

- ✅ DAPR state stores for PostgreSQL persistence
- ✅ DAPR pub/sub for event-driven communication
- ✅ Repository implementations with type safety
- ✅ Event publishing system for agent activities
- ✅ Database schema with proper indexing
- ✅ Docker Compose setup for local development
- ✅ Migration path from SQLite to DAPR

**Libraries Created**: `@expert-dollop/ai/agent-dapr`  
**Status**: Production Ready ✅  
**Next Phase**: Frontend Integration (Phase 4)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-03  
**Phase**: 3 Complete ✅
