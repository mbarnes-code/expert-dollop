# Infrastructure Layer - Prompt Manager

This directory contains the infrastructure implementations for the Prompt Manager library, including database repositories, HTTP adapters, and data persistence logic.

## Structure

```
infrastructure/
├── database/               # Database schemas and migrations
│   ├── schema.sql         # Complete PostgreSQL schema
│   └── migrations/        # Version-controlled migrations
│       ├── 001_create_prompts_table.sql
│       └── down/
│           └── 001_drop_prompts_table.sql
├── repositories/          # Data access implementations
│   └── prompt.repository.ts
└── http/                  # HTTP/API adapters (examples)
    └── nextjs-api-route.example.ts
```

## Database Setup

### Prerequisites

- PostgreSQL 12+ installed
- Database created
- UUID extension enabled

### Running Migrations

```bash
# Connect to your PostgreSQL database
psql -U postgres -d expert_dollop

# Run the migration
\i libs/ai/prompt-manager/src/lib/infrastructure/database/migrations/001_create_prompts_table.sql

# Verify
\dt prompts
```

### Rollback Migration

```bash
# Connect to your PostgreSQL database
psql -U postgres -d expert_dollop

# Run the rollback
\i libs/ai/prompt-manager/src/lib/infrastructure/database/migrations/down/001_drop_prompts_table.sql
```

### Environment Variables

```bash
# Required for database connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=expert_dollop
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
```

## Repository Usage

### Basic Setup

```typescript
import { Pool } from 'pg';
import { PostgresPromptRepository } from '@expert-dollop/ai-prompt-manager';

// Create connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create repository instance
const repository = new PostgresPromptRepository(pool);
```

### Repository Methods

#### Find by ID

```typescript
const prompt = await repository.findById('uuid-here');
if (prompt) {
  console.log(prompt.name, prompt.content);
}
```

#### Find by Name

```typescript
const prompt = await repository.findByName('Incident Summary', 'project-123');
```

#### Find All (with Pagination)

```typescript
const result = await repository.findAll({
  page: 1,
  limit: 10,
  projectId: 'project-123',
  enabled: true,
  type: 'summarization',
});

console.log(`Found ${result.total} prompts`);
console.log(`Page ${result.page} of ${result.totalPages}`);
result.items.forEach(prompt => {
  console.log(`- ${prompt.name}`);
});
```

#### Save New Prompt

```typescript
import { PromptEntity, PromptType, PromptContent } from '@expert-dollop/ai-prompt-manager';

const prompt = PromptEntity.create({
  name: 'Incident Summary',
  content: 'Summarize the following incident...',
  type: PromptType.SUMMARIZATION,
  projectId: 'project-123',
  enabled: true,
});

const saved = await repository.save(prompt);
console.log(`Saved prompt with ID: ${saved.id}`);
```

#### Update Prompt

```typescript
// Load existing prompt
const prompt = await repository.findById('uuid-here');

if (prompt) {
  // Modify the prompt
  prompt.updateContent('New prompt content here...');
  prompt.enable();
  
  // Save changes
  const updated = await repository.update(prompt);
  console.log(`Updated to version ${updated.version}`);
}
```

#### Delete Prompt

```typescript
await repository.delete('uuid-here');
console.log('Prompt deleted');
```

#### Find Enabled Prompt for Project

```typescript
const prompt = await repository.findEnabledByProject('project-123');
if (prompt) {
  console.log(`Active prompt: ${prompt.name}`);
}
```

## Transaction Safety

All write operations (save, update, delete) are wrapped in database transactions:

```typescript
try {
  await repository.save(prompt);
  // If this succeeds, changes are committed
} catch (error) {
  // If this fails, changes are rolled back automatically
  console.error('Save failed:', error);
}
```

## Connection Pooling

The repository uses PostgreSQL connection pooling for efficient database access:

- Maximum 20 connections by default
- Connections are automatically released after use
- Idle connections are closed after 30 seconds
- Connection timeout is 2 seconds

### Cleanup

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  console.log('Database pool closed');
});
```

## Type Mapping

The repository automatically maps between domain entities and database persistence models:

| Domain Property | Database Column | Type |
|----------------|-----------------|------|
| `id` | `id` | UUID |
| `name` | `name` | VARCHAR(255) |
| `description` | `description` | TEXT (nullable) |
| `content.value` | `content` | TEXT |
| `type.value` | `type` | VARCHAR(50) |
| `projectId` | `project_id` | VARCHAR(255) (nullable) |
| `organizationId` | `organization_id` | VARCHAR(255) (nullable) |
| `enabled` | `enabled` | BOOLEAN |
| `version` | `version` | INTEGER |
| `createdAt` | `created_at` | TIMESTAMP WITH TIME ZONE |
| `updatedAt` | `updated_at` | TIMESTAMP WITH TIME ZONE |

## Database Schema Features

### Constraints

- **Name length:** 1-255 characters
- **Content length:** 1-10,000 characters
- **Valid types:** question-answering, summarization, entity-extraction, text-generation, translation, classification, custom
- **Version:** Must be positive integer
- **Unique enabled:** Only one enabled prompt per project

### Indexes

Optimized for common queries:
- `idx_prompts_name` - Fast lookup by name
- `idx_prompts_project_id` - Filter by project
- `idx_prompts_organization_id` - Filter by organization
- `idx_prompts_type` - Filter by type
- `idx_prompts_enabled` - Filter by enabled status
- `idx_prompts_created_at` - Sort by creation date
- `idx_prompts_project_enabled` - Composite index for enabled prompts by project
- `idx_prompts_project_enabled_unique` - Unique constraint for one enabled prompt per project

### Triggers

- **Auto-update timestamp:** `updated_at` is automatically set on every UPDATE

## HTTP API Example

See `nextjs-api-route.example.ts` for a complete Next.js API route implementation demonstrating:

- GET /api/prompts (list with pagination)
- POST /api/prompts (create)
- PUT /api/prompts/[id] (update)
- DELETE /api/prompts/[id] (delete)

## Error Handling

The repository throws descriptive errors for common scenarios:

```typescript
try {
  await repository.save(prompt);
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else if (error.message.includes('already exists')) {
    // Handle duplicate
  } else {
    // Handle other errors
  }
}
```

## Performance Considerations

### Query Optimization

- Use pagination for large result sets
- Filter by indexed columns when possible
- Limit result sets with `limit` parameter

### Connection Management

- Reuse the same `Pool` instance across your application
- Don't create a new pool for each request
- Use connection pooling limits to prevent exhaustion

### Transaction Overhead

- Transactions have overhead - batch operations when possible
- Keep transactions short-lived
- Don't hold transactions open during external API calls

## Testing

### Integration Tests

```typescript
import { Pool } from 'pg';
import { PostgresPromptRepository } from '@expert-dollop/ai-prompt-manager';

describe('PostgresPromptRepository', () => {
  let pool: Pool;
  let repository: PostgresPromptRepository;
  
  beforeAll(async () => {
    pool = new Pool({
      host: 'localhost',
      database: 'test_db',
      // ... test configuration
    });
    repository = new PostgresPromptRepository(pool);
  });
  
  afterAll(async () => {
    await pool.end();
  });
  
  it('should save and retrieve a prompt', async () => {
    const prompt = PromptEntity.create({
      name: 'Test Prompt',
      content: 'Test content',
      type: PromptType.CUSTOM,
    });
    
    const saved = await repository.save(prompt);
    const retrieved = await repository.findById(saved.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test Prompt');
  });
});
```

## Migration Strategy

For migrating from Netflix Dispatch:

1. **Parallel Run:** Run both old (Python) and new (TypeScript) systems
2. **Data Validation:** Compare results between systems
3. **Gradual Migration:** Route percentage of traffic to new system
4. **Monitor:** Track performance and errors
5. **Complete Migration:** Switch fully to new system when validated

## Support

For issues or questions:
- Check the main README in `/libs/ai/prompt-manager/README.md`
- Review the example API implementation
- Check the PHASE1_STATUS.md for implementation status

## Next Steps

- [ ] Add unit tests for repository
- [ ] Add integration tests with testcontainers
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Add authentication/authorization middleware
- [ ] Add rate limiting
- [ ] Add monitoring and metrics
