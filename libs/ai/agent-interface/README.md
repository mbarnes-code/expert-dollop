# AI Agent Interface Library

Shared interfaces and types for AI agent implementations across the Expert-Dollop platform.

**Phase 2** of the Goose AI Agent strangler fig integration.

## Overview

This library provides TypeScript interfaces and Zod schemas extracted from the Goose AI Agent project. These abstractions enable:

1. Multiple AI agent implementations to share common interfaces
2. Type-safe integration between frontend and backend
3. Runtime validation using Zod schemas
4. Clear contracts for repositories and services

## Installation

This library is part of the Expert-Dollop monorepo and is consumed by other packages within the workspace.

```typescript
import { Agent, Recipe, ExtensionManager } from '@expert-dollop/ai-agent-interface';
```

## Core Concepts

### Agent Interface

The `Agent` interface defines the contract for AI agent implementations:

```typescript
interface Agent {
  execute(message: string, context: AgentContext): Promise<Message>;
  stream?(message: string, context: AgentContext, onChunk: (chunk: string) => void): Promise<Message>;
}
```

### Provider Interface

The `AgentProvider` interface abstracts LLM provider implementations:

```typescript
interface AgentProvider {
  getName(): string;
  supportsTools(): boolean;
  complete(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
  stream?(messages: Message[], tools?: Tool[], onChunk: (chunk: string) => void): Promise<LLMResponse>;
}
```

### Recipe System

Recipes define multi-step workflows for automation:

```typescript
interface Recipe {
  id?: string;
  name: string;
  description: string;
  steps: RecipeStep[];
  parameters?: RecipeParameter[];
}
```

### Extension System (MCP)

Extensions follow the Model Context Protocol for plugin architecture:

```typescript
interface ExtensionInterface {
  getMetadata(): ExtensionMetadata;
  getCapabilities(): ExtensionCapabilities;
  initialize(config: ExtensionConfig): Promise<void>;
  getTools?(): Promise<Tool[]>;
  getPrompts?(): Promise<PromptTemplate[]>;
}
```

## Exported Types

### Agent Types
- `Agent` - Core agent interface
- `AgentProvider` - LLM provider interface
- `AgentContext` - Execution context
- `Message` - Conversation message
- `Tool` - Tool definition
- `Conversation` - Conversation state
- `ConversationRepository` - Persistence interface

### Recipe Types
- `Recipe` - Recipe definition
- `RecipeStep` - Individual workflow step
- `RecipeParameter` - Recipe parameter definition
- `RecipeExecutor` - Execution interface
- `RecipeRepository` - Persistence interface
- `RecipeValidator` - Validation interface

### Extension Types
- `Extension` - Extension state
- `ExtensionInterface` - Extension contract
- `ExtensionManager` - Lifecycle manager interface
- `ExtensionRepository` - Persistence interface
- `PromptTemplate` - Prompt definition
- `Resource` - Resource definition

## Usage Examples

### Using Zod Schemas for Validation

```typescript
import { RecipeSchema, MessageSchema } from '@expert-dollop/ai-agent-interface';

// Validate a recipe
const recipeData = { name: 'Test', description: 'Test recipe', steps: [] };
const result = RecipeSchema.safeParse(recipeData);

if (result.success) {
  console.log('Valid recipe:', result.data);
}
```

### Implementing an Agent

```typescript
import { Agent, AgentContext, Message } from '@expert-dollop/ai-agent-interface';

class MyAgent implements Agent {
  async execute(message: string, context: AgentContext): Promise<Message> {
    // Implementation
    return {
      id: 'msg-1',
      role: MessageRole.Assistant,
      content: 'Response',
      timestamp: new Date(),
    };
  }
}
```

### Implementing a Recipe Executor

```typescript
import { RecipeExecutor, Recipe, RecipeExecutionResult } from '@expert-dollop/ai-agent-interface';

class MyRecipeExecutor implements RecipeExecutor {
  async execute(recipe: Recipe, parameters?: Record<string, any>): Promise<RecipeExecutionResult> {
    // Execute steps
    return {
      id: 'exec-1',
      recipeId: recipe.id!,
      recipeName: recipe.name,
      status: RecipeExecutionStatus.Success,
      startedAt: new Date(),
      stepResults: [],
    };
  }
  
  // ... other methods
}
```

## Integration with Goose

This library extracts key interfaces from the Goose AI Agent (Rust implementation):

| Goose Component | TypeScript Interface |
|----------------|---------------------|
| `src/agents/agent.rs` | `Agent`, `AgentProvider` |
| `src/conversation/mod.rs` | `Conversation`, `Message` |
| `src/recipe/mod.rs` | `Recipe`, `RecipeStep` |
| `src/agents/extension_manager.rs` | `ExtensionManager` |
| `src/providers/` | `AgentProvider`, `ProviderConfig` |

## Repository Interfaces

All repository interfaces follow a consistent pattern:

```typescript
interface Repository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  list(options?: ListOptions): Promise<T[]>;
  update(id: string, updates: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}
```

This enables:
- Consistent data access patterns
- Easy mocking for tests
- Multiple backend implementations (SQLite, DAPR, PostgreSQL)

## Future Enhancements

### Phase 3: DAPR Integration
- Implement repositories using DAPR state stores
- Add pub/sub for agent events
- Service-to-service communication

### Phase 4: Additional Types
- Streaming types for real-time updates
- Error types and error handling
- Observability and tracing types

## Development

This library uses:
- **TypeScript** 5.9+ for type safety
- **Zod** for runtime schema validation
- **NX** for monorepo management

## License

Apache-2.0 (inherited from Goose AI Agent project)

## Related Documentation

- [Goose Integration Guide](../../../docs/goose-integration.md)
- [Phase 2 Migration Details](../../../docs/goose-integration-manifest.md)
- [Original Goose Documentation](../../../apps/ai/goose/documentation/)
