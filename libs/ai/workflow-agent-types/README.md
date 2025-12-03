# @expert-dollop/workflow-agent-types

Shared TypeScript types and Zod schemas for deep integration between Goose AI Agent and n8n workflow automation platform.

## Overview

This library provides common type definitions and runtime validation schemas that enable system-level integration between:
- **Goose AI Agent** (Rust/TypeScript) - AI-powered coding assistant
- **n8n** (TypeScript/Node.js) - Workflow automation platform

## Features

- **Type Safety**: Full TypeScript type definitions for all integration points
- **Runtime Validation**: Zod schemas for data validation
- **Event System**: Typed events for pub/sub integration
- **Execution Context**: Shared context for workflow and agent executions
- **Statistics**: Metrics and analytics types

## Installation

```bash
npm install @expert-dollop/workflow-agent-types
```

Or using pnpm:

```bash
pnpm add @expert-dollop/workflow-agent-types
```

## Usage

### Import Types

```typescript
import {
  WorkflowExecutionContext,
  AgentWorkflowRequest,
  ExecutionResult,
  IntegrationEvent,
  IntegrationEventType,
} from '@expert-dollop/workflow-agent-types';
```

### Runtime Validation

```typescript
import {
  AgentWorkflowRequestSchema,
  ExecutionResultSchema,
} from '@expert-dollop/workflow-agent-types';

// Validate agent workflow request
const request = AgentWorkflowRequestSchema.parse({
  workflowId: 'wf_123',
  conversationId: 'conv_456',
  messageId: 'msg_789',
  parameters: { email: 'user@example.com' },
  waitForCompletion: true,
});

// Validate execution result
const result = ExecutionResultSchema.parse({
  success: true,
  data: { userId: '123' },
  duration: 1500,
  resourceUsage: {
    tokensUsed: 250,
    executedNodes: 5,
  },
});
```

### Event Publishing

```typescript
import {
  IntegrationEvent,
  IntegrationEventType,
} from '@expert-dollop/workflow-agent-types';

const event: IntegrationEvent = {
  id: crypto.randomUUID(),
  type: IntegrationEventType.AGENT_TRIGGERED_WORKFLOW,
  timestamp: new Date(),
  source: 'goose',
  payload: {
    workflowId: 'wf_123',
    conversationId: 'conv_456',
  },
  correlationId: 'conv_456',
};

// Publish to event bus (DAPR, RabbitMQ, etc.)
await eventBus.publish('integration-events', event);
```

## Type Definitions

### Workflow Execution Context

```typescript
interface WorkflowExecutionContext {
  executionId: string;
  workflowId: string;
  triggeredBy: 'agent' | 'schedule' | 'webhook' | 'manual';
  agentConversationId?: string;
  agentSessionId?: string;
  inputData: Record<string, unknown>;
  metadata: {
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'success' | 'error' | 'cancelled';
    error?: string;
  };
}
```

### Agent Workflow Request

```typescript
interface AgentWorkflowRequest {
  workflowId: string;
  conversationId: string;
  messageId: string;
  parameters: Record<string, unknown>;
  waitForCompletion: boolean;
  timeout?: number;
}
```

### Execution Result

```typescript
interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  duration: number;
  resourceUsage?: {
    tokensUsed?: number;
    apiCalls?: number;
    executedNodes?: number;
  };
}
```

### Integration Events

```typescript
enum IntegrationEventType {
  // Agent events
  AGENT_CONVERSATION_STARTED = 'agent.conversation.started',
  AGENT_MESSAGE_SENT = 'agent.message.sent',
  AGENT_TOOL_EXECUTED = 'agent.tool.executed',
  AGENT_RECIPE_COMPLETED = 'agent.recipe.completed',
  
  // Workflow events
  WORKFLOW_EXECUTION_STARTED = 'workflow.execution.started',
  WORKFLOW_EXECUTION_COMPLETED = 'workflow.execution.completed',
  WORKFLOW_EXECUTION_FAILED = 'workflow.execution.failed',
  
  // Integration events
  AGENT_TRIGGERED_WORKFLOW = 'integration.agent_triggered_workflow',
  WORKFLOW_TRIGGERED_AGENT = 'integration.workflow_triggered_agent',
}

interface IntegrationEvent<T = unknown> {
  id: string;
  type: IntegrationEventType;
  timestamp: Date;
  source: 'goose' | 'n8n';
  payload: T;
  correlationId?: string;
}
```

## Integration Patterns

### Pattern 1: Agent Triggers Workflow

```typescript
// Goose agent side
const request: AgentWorkflowRequest = {
  workflowId: 'customer-onboarding',
  conversationId: conversation.id,
  messageId: message.id,
  parameters: {
    email: 'john@example.com',
    name: 'John Doe',
  },
  waitForCompletion: true,
  timeout: 30000,
};

// Execute workflow
const result = await workflowAdapter.execute(request);

if (result.success) {
  console.log('Workflow completed:', result.data);
} else {
  console.error('Workflow failed:', result.error);
}
```

### Pattern 2: Workflow Triggers Agent

```typescript
// n8n workflow node
const request: WorkflowAgentRequest = {
  agentId: 'goose-default',
  action: 'message',
  context: {
    workflowId: workflow.id,
    executionId: execution.id,
    nodeId: node.id,
  },
  payload: {
    message: 'Please analyze this error and suggest a fix',
    error: errorDetails,
  },
};

// Call agent
const result = await agentAdapter.execute(request);
```

### Pattern 3: Event-Driven Integration

```typescript
// Publisher (Goose)
await eventPublisher.publish({
  id: crypto.randomUUID(),
  type: IntegrationEventType.AGENT_RECIPE_COMPLETED,
  timestamp: new Date(),
  source: 'goose',
  payload: {
    recipeId: 'deploy-pipeline',
    success: true,
    workflows: ['build', 'test', 'deploy'],
  },
  correlationId: conversationId,
});

// Subscriber (n8n)
eventBus.subscribe('agent-events', (event: IntegrationEvent) => {
  if (event.type === IntegrationEventType.AGENT_RECIPE_COMPLETED) {
    // Trigger follow-up workflow
    workflow.execute('post-deployment-checks');
  }
});
```

## Database Integration

These types map to database schemas for persisting integration data:

```sql
-- Agent-Workflow executions table
CREATE TABLE integration.agent_workflow_executions (
    id UUID PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    -- ... other fields
);
```

## Related Libraries

- `@expert-dollop/ai-agent-interface` - Goose agent interfaces
- `@expert-dollop/integration-adapters` - API adapters for integration
- `@expert-dollop/ai-agent-dapr` - DAPR integration for agents

## Contributing

When adding new integration types:

1. Add TypeScript interface
2. Add corresponding Zod schema
3. Export from `index.ts`
4. Update this README
5. Add tests (if test infrastructure exists)

## License

Apache-2.0

## Version

0.0.1 - Initial release
