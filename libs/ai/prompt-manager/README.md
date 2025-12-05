# @expert-dollop/ai-prompt-manager

AI Prompt Management Library with Domain-Driven Design architecture.

## Overview

This library provides a robust, production-ready system for managing AI prompts with versioning, multi-tenancy support, and type safety. It's designed following Domain-Driven Design (DDD) principles and extracted from Netflix Dispatch's production-tested AI prompt management system.

## Features

- ✅ **Domain-Driven Design Architecture**: Clean separation of domain, application, and infrastructure layers
- ✅ **Type-Safe**: Full TypeScript implementation with strict typing
- ✅ **Versioning**: Built-in support for prompt versioning and history
- ✅ **Multi-Tenancy**: Project-based isolation for prompts
- ✅ **Validation**: Comprehensive validation at all layers
- ✅ **Immutable Value Objects**: Prompt types and content as value objects
- ✅ **Repository Pattern**: Clean abstraction over data access
- ✅ **Production-Tested**: Migrated from Netflix Dispatch

## Installation

```bash
npm install @expert-dollop/ai-prompt-manager
```

## Usage

### Basic Usage

```typescript
import { 
  PromptService, 
  CreatePromptDto,
  GenAITypeEnum 
} from '@expert-dollop/ai-prompt-manager';

// Initialize service with repository implementation
const promptService = new PromptService(promptRepository);

// Create a new prompt
const newPrompt = await promptService.createPrompt({
  genaiType: GenAITypeEnum.INCIDENT_SUMMARY,
  genaiPrompt: 'Summarize the following incident...',
  genaiSystemMessage: 'You are a helpful security analyst...',
  enabled: true,
  projectId: 1
});

// Get prompt by type
const prompt = await promptService.getPromptByType(
  GenAITypeEnum.INCIDENT_SUMMARY,
  1 // projectId
);

// Update prompt
await promptService.updatePrompt(prompt.id, {
  genaiPrompt: 'Updated prompt text...',
  enabled: true
});

// Get all available types
const types = promptService.getAllGenAITypes();
```

### Domain Entities

```typescript
import { PromptEntity, PromptType } from '@expert-dollop/ai-prompt-manager';

// Create a prompt entity
const prompt = new PromptEntity({
  genaiType: GenAITypeEnum.TAG_RECOMMENDATIONS,
  genaiPrompt: 'Recommend tags for...',
  enabled: true,
  projectId: 1
});

// Domain methods
prompt.enable();
prompt.disable();
prompt.updatePrompt('New prompt text');
```

### Value Objects

```typescript
import { PromptType, PromptContent } from '@expert-dollop/ai-prompt-manager';

// Prompt Type (immutable)
const type = new PromptType(GenAITypeEnum.TACTICAL_REPORT);
console.log(type.getDisplayName()); // "Tactical Report"

// Prompt Content (immutable with validation)
const content = PromptContent.create(
  'Generate a tactical report...',
  'You are a security analyst...'
);
```

## Architecture

### Domain Layer (`lib/domain/`)
- **Entities**: `PromptEntity` - Rich domain model with behavior
- **Value Objects**: `PromptType`, `PromptContent` - Immutable, validated values
- **Repositories**: `IPromptRepository` - Interface for data access

### Application Layer (`lib/application/`)
- **Services**: `PromptService` - Business logic orchestration
- **DTOs**: Data transfer objects for API boundaries
- **Use Cases**: (Future) Specific business use cases

### Infrastructure Layer (`lib/infrastructure/`)
- **Repositories**: Concrete repository implementations
- **Database**: Schema and migrations
- **HTTP**: API controllers and routes

## GenAI Types

The library supports the following prompt types:

1. **Tag Recommendations** (`TAG_RECOMMENDATIONS`)
2. **Incident Summary** (`INCIDENT_SUMMARY`)
3. **Tactical Report** (`TACTICAL_REPORT`)
4. **Executive Report** (`EXECUTIVE_REPORT`)
5. **Signal Analysis** (`SIGNAL_ANALYSIS`)
6. **Case Summary** (`CASE_SUMMARY`)
7. **Read-in Summary** (`READ_IN_SUMMARY`)

## Implementing a Repository

```typescript
import { IPromptRepository } from '@expert-dollop/ai-prompt-manager';

class PostgresPromptRepository implements IPromptRepository {
  async findById(id: number): Promise<PromptEntity | null> {
    // Implementation
  }
  
  async create(prompt: PromptEntity): Promise<PromptEntity> {
    // Implementation
  }
  
  // ... implement other methods
}
```

## Migration from Dispatch

This library is extracted from Netflix Dispatch. Key mappings:

- `dispatch.ai.prompt.models.Prompt` → `PromptEntity`
- `dispatch.ai.prompt.service` → `PromptService`
- `dispatch.ai.enums.GenAIType` → `PromptType`

## Development

```bash
# Build
nx build ai-prompt-manager

# Test
nx test ai-prompt-manager

# Lint
nx lint ai-prompt-manager
```

## Status

**Phase 1: Foundation** - ✅ Domain and Application Layers Complete

### Completed
- ✅ Domain entities and value objects
- ✅ Application service and DTOs
- ✅ Repository interfaces
- ✅ Type definitions
- ✅ Validation logic

### TODO (Infrastructure Layer)
- ⏳ PostgreSQL repository implementation
- ⏳ Database migrations
- ⏳ API controllers (Next.js/NestJS)
- ⏳ Integration tests
- ⏳ E2E tests

## Contributing

See [PHASE1_IMPLEMENTATION_PLAN.md](../../../docs/PHASE1_IMPLEMENTATION_PLAN.md) for implementation details.

## License

MIT

## Credits

Extracted from Netflix Dispatch AI prompt management system.
