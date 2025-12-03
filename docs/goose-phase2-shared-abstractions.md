# Goose Phase 2: Shared Abstractions - Implementation Guide

## Overview

**Phase**: 2 - Shared Abstractions  
**Status**: Complete ✅  
**Completion Date**: 2025-12-03  
**Library**: `@expert-dollop/ai/agent-interface`

## What Was Accomplished

Phase 2 successfully extracted key interfaces and types from the Goose AI Agent project into a shared TypeScript library, enabling:

1. **Type-safe integration** between frontend and backend
2. **Shared contracts** for AI agent implementations
3. **Runtime validation** using Zod schemas
4. **Clear repository patterns** for data persistence
5. **Consistent API design** across the platform

## Library Structure

```
libs/ai/agent-interface/
├── src/
│   ├── agent.types.ts        # Core agent and provider interfaces
│   ├── recipe.types.ts       # Recipe workflow types
│   ├── extension.types.ts    # MCP extension interfaces
│   └── index.ts              # Main export
├── package.json
├── tsconfig.json
├── project.json
└── README.md
```

## Core Interfaces Extracted

### 1. Agent Interfaces

Extracted from `crates/goose/src/agents/agent.rs`:

```typescript
// Agent Provider - LLM abstraction
interface AgentProvider {
  getName(): string;
  supportsTools(): boolean;
  complete(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
  stream?(messages: Message[], tools?: Tool[], onChunk: (chunk: string) => void): Promise<LLMResponse>;
}

// Agent - Core AI agent
interface Agent {
  execute(message: string, context: AgentContext): Promise<Message>;
  stream?(message: string, context: AgentContext, onChunk: (chunk: string) => void): Promise<Message>;
}
```

**Key Types**:
- `Message` - Conversation message with role, content, timestamp
- `MessageRole` - Enum: System, User, Assistant, Tool
- `Tool` - Tool definition with parameters
- `LLMResponse` - LLM response with tool calls and usage
- `ProviderConfig` - Provider configuration

### 2. Conversation Types

Extracted from `crates/goose/src/conversation/mod.rs`:

```typescript
// Conversation state
interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Repository pattern
interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: string): Promise<Conversation | null>;
  list(options?: ListOptions): Promise<Conversation[]>;
  update(id: string, updates: Partial<Conversation>): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Key Types**:
- `MessageContent` - Text, image, tool use, or tool result
- `AgentContext` - Execution context with conversation ID, session, tools

### 3. Recipe Types

Extracted from `crates/goose/src/recipe/mod.rs` and `src/agents/sub_recipe_manager.rs`:

```typescript
// Recipe workflow definition
interface Recipe {
  id?: string;
  name: string;
  description: string;
  version: string;
  parameters?: RecipeParameter[];
  steps: RecipeStep[];
  metadata?: RecipeMetadata;
}

// Recipe execution
interface RecipeExecutor {
  execute(recipe: Recipe, parameters?: Record<string, any>): Promise<RecipeExecutionResult>;
  executeById(recipeId: string, parameters?: Record<string, any>): Promise<RecipeExecutionResult>;
  cancel(executionId: string): Promise<void>;
  getExecutionStatus(executionId: string): Promise<RecipeExecutionResult | null>;
}
```

**Key Types**:
- `RecipeStep` - Individual step with tool, action, parameters, conditions
- `RecipeParameter` - Input parameter with validation
- `RecipeCondition` - Conditional execution logic
- `RecipeExecutionResult` - Execution results with step outcomes
- `RecipeExecutionStatus` - Enum: Pending, Running, Success, Failed, Cancelled

### 4. Extension Types (MCP)

Extracted from `crates/goose/src/agents/extension_manager.rs`:

```typescript
// Extension (MCP)
interface Extension {
  id: string;
  metadata: ExtensionMetadata;
  capabilities: ExtensionCapabilities;
  config: ExtensionConfig;
  status: ExtensionStatus;
}

// Extension Manager
interface ExtensionManager {
  discover(): Promise<ExtensionMetadata[]>;
  load(extensionId: string): Promise<Extension>;
  unload(extensionId: string): Promise<void>;
  getExtension(extensionId: string): Extension | null;
  getAllTools(): Promise<Tool[]>;
  getAllPrompts(): Promise<PromptTemplate[]>;
  getAllResources(): Promise<Resource[]>;
}
```

**Key Types**:
- `ExtensionInterface` - Extension contract with tools, prompts, resources
- `ExtensionMetadata` - Name, version, description, author
- `ExtensionCapabilities` - Tools, prompts, resources, streaming support
- `ExtensionStatus` - Enum: Inactive, Loading, Active, Error, Disabled
- `PromptTemplate` - Reusable prompt with parameters
- `Resource` - External resource definition

## Zod Schema Validation

All interfaces have corresponding Zod schemas for runtime validation:

```typescript
import { MessageSchema, RecipeSchema, ExtensionSchema } from '@expert-dollop/ai/agent-interface';

// Validate at runtime
const result = RecipeSchema.safeParse(recipeData);
if (result.success) {
  const recipe = result.data; // Fully typed
}
```

**Available Schemas**:
- `MessageSchema`, `MessageContentSchema`
- `ToolSchema`, `ToolParameterSchema`
- `ConversationSchema`, `AgentContextSchema`
- `RecipeSchema`, `RecipeStepSchema`, `RecipeParameterSchema`
- `ExtensionSchema`, `ExtensionMetadataSchema`, `ExtensionCapabilitiesSchema`
- `PromptTemplateSchema`, `ResourceSchema`

## Usage Examples

### 1. Implementing an Agent Provider

```typescript
import { AgentProvider, Message, LLMResponse, Tool } from '@expert-dollop/ai/agent-interface';

class OpenAIProvider implements AgentProvider {
  getName(): string {
    return 'openai';
  }

  supportsTools(): boolean {
    return true;
  }

  async complete(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      tools: tools?.map(t => ({ type: 'function', function: t })),
    });

    return {
      content: response.choices[0].message.content || '',
      toolCalls: response.choices[0].message.tool_calls,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }
}
```

### 2. Implementing a Conversation Repository

```typescript
import { ConversationRepository, Conversation } from '@expert-dollop/ai/agent-interface';

class SQLiteConversationRepository implements ConversationRepository {
  async save(conversation: Conversation): Promise<void> {
    await db.insert('conversations', {
      id: conversation.id,
      title: conversation.title,
      messages: JSON.stringify(conversation.messages),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  }

  async findById(id: string): Promise<Conversation | null> {
    const row = await db.selectOne('conversations', { id });
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.title,
      messages: JSON.parse(row.messages),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // ... other methods
}
```

### 3. Implementing a Recipe Executor

```typescript
import { RecipeExecutor, Recipe, RecipeExecutionResult, RecipeExecutionStatus } from '@expert-dollop/ai/agent-interface';

class GooseRecipeExecutor implements RecipeExecutor {
  async execute(recipe: Recipe, parameters?: Record<string, any>): Promise<RecipeExecutionResult> {
    const execution: RecipeExecutionResult = {
      id: generateId(),
      recipeId: recipe.id!,
      recipeName: recipe.name,
      status: RecipeExecutionStatus.Running,
      startedAt: new Date(),
      stepResults: [],
    };

    for (const step of recipe.steps) {
      const result = await this.executeStep(step, parameters);
      execution.stepResults.push(result);
      
      if (result.status === RecipeExecutionStatus.Failed) {
        execution.status = RecipeExecutionStatus.Failed;
        execution.error = result.error;
        break;
      }
    }

    execution.status = RecipeExecutionStatus.Success;
    execution.completedAt = new Date();
    return execution;
  }

  // ... other methods
}
```

### 4. Using with Frontend Components

```typescript
import { Message, MessageRole, Recipe } from '@expert-dollop/ai/agent-interface';
import { useState } from 'react';

function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: MessageRole.User,
      content,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    // Call agent API
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      body: JSON.stringify({ message: content, messages }),
    });

    const assistantMessage: Message = await response.json();
    setMessages([...messages, userMessage, assistantMessage]);
  };

  // ... render
}
```

## Integration Points

### With Goose Backend (Rust)

The TypeScript interfaces mirror the Rust implementations:

| TypeScript | Rust (Goose) |
|-----------|--------------|
| `AgentProvider` | `trait Provider` in `providers/base.rs` |
| `Agent` | `struct Agent` in `agents/agent.rs` |
| `Conversation` | `struct Conversation` in `conversation/mod.rs` |
| `Recipe` | `struct Recipe` in `recipe/mod.rs` |
| `Extension` | `struct Extension` in `agents/extension_manager.rs` |

### With n8n Workflows

Recipes can integrate with n8n via webhooks:

```typescript
const n8nIntegrationRecipe: Recipe = {
  name: 'n8n-integration',
  description: 'Trigger n8n workflow',
  version: '1.0.0',
  steps: [
    {
      name: 'trigger-n8n',
      tool: 'webhook',
      parameters: {
        url: 'http://n8n:5678/webhook/goose-trigger',
        method: 'POST',
        body: { /* data */ },
      },
    },
  ],
};
```

### With DAPR (Future - Phase 3)

Repository implementations can use DAPR state stores:

```typescript
class DAPRConversationRepository implements ConversationRepository {
  private daprClient = new DaprClient();

  async save(conversation: Conversation): Promise<void> {
    await this.daprClient.state.save('statestore-goose', [
      {
        key: conversation.id,
        value: conversation,
      },
    ]);
  }

  // ... other methods
}
```

## Benefits Achieved

### 1. Type Safety
- Full TypeScript type checking across frontend and backend
- Autocomplete and IntelliSense support in IDEs
- Compile-time error detection

### 2. Runtime Validation
- Zod schemas validate data at runtime
- Prevents invalid data from entering the system
- Clear error messages for debugging

### 3. Consistent Patterns
- Repository pattern for all persistence
- Consistent interface design
- Predictable API contracts

### 4. Decoupling
- Abstractions separate interface from implementation
- Multiple implementations possible (SQLite, PostgreSQL, DAPR)
- Easy testing with mocks

### 5. Documentation
- Types serve as documentation
- Clear contracts for all interfaces
- Examples and usage patterns

## Next Steps: Phase 3

With shared abstractions in place, Phase 3 will implement:

1. **DAPR State Stores** - Implement repositories using DAPR
2. **DAPR Pub/Sub** - Event-driven communication
3. **Service Wrappers** - Wrap Goose services with DAPR sidecars
4. **State Migration** - Migrate from SQLite to DAPR stores
5. **Event Publishing** - Publish agent events to RabbitMQ

## Configuration

The library is configured in `tsconfig.base.json`:

```json
{
  "paths": {
    "@expert-dollop/ai/agent-interface": ["libs/ai/agent-interface/src/index.ts"]
  }
}
```

Import in any project:

```typescript
import { Agent, Recipe, Extension } from '@expert-dollop/ai/agent-interface';
```

## Testing

Example test using the interfaces:

```typescript
import { ConversationRepository, Conversation } from '@expert-dollop/ai/agent-interface';

class MockConversationRepository implements ConversationRepository {
  private conversations = new Map<string, Conversation>();

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  // ... other methods
}

describe('Agent Service', () => {
  it('should save conversations', async () => {
    const repo = new MockConversationRepository();
    const conversation: Conversation = {
      id: 'test-1',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.save(conversation);
    const retrieved = await repo.findById('test-1');
    
    expect(retrieved).toEqual(conversation);
  });
});
```

## Summary

Phase 2 successfully extracted and formalized the core interfaces from Goose into a reusable TypeScript library. This enables:

- ✅ Type-safe development across the platform
- ✅ Runtime validation with Zod
- ✅ Clear contracts for implementations
- ✅ Repository patterns for data access
- ✅ Foundation for Phase 3 DAPR integration

**Library Package**: `@expert-dollop/ai/agent-interface`  
**Status**: Production Ready ✅  
**Next Phase**: DAPR Service Migration (Phase 3)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-03  
**Phase**: 2 Complete ✅
