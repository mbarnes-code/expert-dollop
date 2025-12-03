# AI Agent DAPR Library

DAPR implementations for AI agent repositories and event publishing.

**Phase 3** of the Goose AI Agent strangler fig integration.

## Overview

This library provides DAPR-based implementations of the repository interfaces defined in `@expert-dollop/ai/agent-interface`. It enables:

1. **State persistence** using DAPR state stores (PostgreSQL)
2. **Event-driven communication** via DAPR pub/sub (RabbitMQ)
3. **Service-to-service calls** using DAPR service invocation
4. **Database abstraction** - Can swap backends without code changes

## Installation

This library is part of the Expert-Dollop monorepo:

```typescript
import { DaprConversationRepository, AgentEventPublisher } from '@expert-dollop/ai/agent-dapr';
```

## Components

### 1. Repository Implementations

#### DaprConversationRepository

Implements `ConversationRepository` using DAPR state store:

```typescript
import { DaprConversationRepository } from '@expert-dollop/ai/agent-dapr';
import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();
const repo = new DaprConversationRepository(daprClient);

// Save conversation
await repo.save({
  id: 'conv-123',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Find conversation
const conversation = await repo.findById('conv-123');

// List conversations
const conversations = await repo.list({ limit: 10 });

// Update conversation
await repo.update('conv-123', { title: 'New Title' });

// Delete conversation
await repo.delete('conv-123');
```

#### DaprRecipeRepository

Implements `RecipeRepository` using DAPR state store:

```typescript
import { DaprRecipeRepository } from '@expert-dollop/ai/agent-dapr';

const repo = new DaprRecipeRepository();

// Save recipe
await repo.save({
  id: 'recipe-123',
  name: 'automated-task',
  description: 'Automates a task',
  version: '1.0.0',
  steps: [],
});

// Find by name
const recipes = await repo.findByName('automated-task');

// List with filters
const filtered = await repo.list({
  category: 'automation',
  tags: ['dev', 'testing'],
});
```

### 2. Event Publisher

#### AgentEventPublisher

Publishes agent events to RabbitMQ via DAPR pub/sub:

```typescript
import { AgentEventPublisher, AgentEventType } from '@expert-dollop/ai/agent-dapr';

const publisher = new AgentEventPublisher();

// Publish message event
await publisher.publishMessageEvent(
  'msg-123',
  'conv-123',
  'user-456'
);

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
  'ext-123',
  { version: '1.0.0' }
);

// Publish conversation event
await publisher.publishConversationEvent(
  AgentEventType.ConversationCreated,
  'conv-123',
  { title: 'New Conversation' },
  'user-456'
);
```

## Event Types

```typescript
enum AgentEventType {
  // Agent events
  AgentMessageSent = 'goose.agent.message.sent',
  AgentMessageReceived = 'goose.agent.message.received',
  AgentToolExecuted = 'goose.agent.tool.executed',
  
  // Recipe events
  RecipeStarted = 'goose.recipe.started',
  RecipeCompleted = 'goose.recipe.completed',
  RecipeFailed = 'goose.recipe.failed',
  
  // Extension events
  ExtensionLoaded = 'goose.extension.loaded',
  ExtensionUnloaded = 'goose.extension.unloaded',
  
  // Conversation events
  ConversationCreated = 'goose.conversation.created',
  ConversationUpdated = 'goose.conversation.updated',
}
```

## DAPR Configuration

### State Store

The library uses `statestore-goose` defined in `infrastructure/dapr/components/statestore-goose.yaml`:

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

### Pub/Sub

Events are published to `pubsub-goose` defined in `infrastructure/dapr/components/pubsub-goose.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub-goose
spec:
  type: pubsub.rabbitmq
```

## Running with DAPR

### Development

```bash
# Start service with DAPR sidecar
dapr run \
  --app-id goose-server \
  --app-port 8000 \
  --dapr-http-port 3500 \
  --components-path ./infrastructure/dapr/components \
  --config ./infrastructure/dapr/config/config.yaml \
  -- node dist/server.js
```

### Docker Compose

```yaml
services:
  goose-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DAPR_HTTP_PORT=3500
      
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
```

## Usage Example: Express Server

```typescript
import express from 'express';
import { DaprConversationRepository, AgentEventPublisher } from '@expert-dollop/ai/agent-dapr';
import { MessageRole } from '@expert-dollop/ai/agent-interface';

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

app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const conversation = await conversationRepo.findById(id);
  
  const message = {
    id: generateId(),
    role: MessageRole.User,
    content,
    timestamp: new Date(),
  };
  
  conversation.messages.push(message);
  await conversationRepo.update(id, { messages: conversation.messages });
  
  await eventPublisher.publishMessageEvent(message.id, id);
  
  res.json(message);
});
```

## Benefits

### 1. Database Abstraction
- Swap from PostgreSQL to CosmosDB without code changes
- DAPR handles database specifics

### 2. Event-Driven Architecture
- Loose coupling between services
- Easy integration with n8n workflows
- Audit trail and analytics

### 3. Scalability
- DAPR handles service discovery
- Built-in retry and circuit breaker
- Multi-region support

### 4. DDD Compliance
- State store enforces schema boundaries
- Pub/sub enables bounded context communication
- Clear separation of concerns

## Integration Points

### With n8n

Subscribe to Goose events in n8n workflows:

```json
// n8n RabbitMQ Trigger
{
  "queue": "goose.recipe.completed",
  "exchange": "pubsub-goose"
}
```

### With Analytics

Subscribe to events for analytics:

```typescript
// Subscribe to all agent events
daprClient.pubsub.subscribe(
  'pubsub-goose',
  'goose.agent.*',
  async (event) => {
    // Send to analytics service
    await analytics.track(event);
  }
);
```

## Testing

```typescript
import { DaprConversationRepository } from '@expert-dollop/ai/agent-dapr';
import { DaprClient } from '@dapr/dapr';

// Mock DAPR client
const mockClient = {
  state: {
    get: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
  pubsub: {
    publish: jest.fn(),
  },
} as unknown as DaprClient;

const repo = new DaprConversationRepository(mockClient);

test('saves conversation', async () => {
  await repo.save(conversation);
  
  expect(mockClient.state.save).toHaveBeenCalledWith(
    'statestore-goose',
    expect.arrayContaining([
      expect.objectContaining({
        key: 'conversation:conv-123',
      }),
    ])
  );
});
```

## Migration from SQLite

Phase 3 provides a path to migrate from Goose's SQLite storage:

1. **Dual-write**: Write to both SQLite and DAPR
2. **Verify**: Ensure data consistency
3. **Switch reads**: Start reading from DAPR
4. **Remove SQLite**: Clean up old implementation

## Next Steps: Phase 4

With DAPR integration complete, Phase 4 will:

- Create shared UI components
- Integrate with existing `apps/ai/chat/`
- Unified authentication across services
- Shared state management in frontend

## License

Apache-2.0 (inherited from Goose AI Agent project)

## Related Documentation

- [Phase 3 Implementation Guide](../../../docs/goose-phase3-dapr-integration.md)
- [Agent Interface Library](../agent-interface/README.md)
- [DAPR Documentation](https://docs.dapr.io/)
