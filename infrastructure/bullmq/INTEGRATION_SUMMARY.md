# BullMQ Infrastructure - Integration Summary

## What Was Implemented

This document provides a quick overview of the BullMQ infrastructure setup for easy reference during integration.

## Directory Structure

```
infrastructure/bullmq/
├── config/
│   ├── connection.ts          # Redis connection manager
│   ├── queue-factory.ts       # Queue creation and management
│   └── worker-factory.ts      # Worker creation and management
├── queues/
│   ├── n8n.ts                # N8N queue configurations
│   ├── inspector.ts          # Inspector queue configurations
│   ├── dispatch.ts           # Dispatch queue configurations
│   ├── mcp.ts                # MCP server queue configurations
│   ├── common.ts             # Common queue configurations
│   └── index.ts              # Queue exports
├── types/
│   └── index.ts              # TypeScript type definitions
├── index.ts                  # Main entry point
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── README.md                 # Full documentation
├── MIGRATION.md              # Migration guide for firecrawl
├── examples.ts               # Usage examples
└── test.ts                   # Test file

infrastructure/dapr/components/
└── pubsub-bullmq.yaml        # DAPR pub/sub component for BullMQ events
```

## Quick Start

### For New Projects

```typescript
// Import the infrastructure
import {
  createQueue,
  createWorker,
  QueueName,
  type EmailJobData,
} from '@expert-dollop/bullmq-infrastructure';

// Create a queue
const queue = createQueue(QueueName.EMAIL);

// Add a job
await queue.add('send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Welcome!',
});

// Create a worker
const worker = createWorker(QueueName.EMAIL, async (job) => {
  console.log('Processing:', job.data);
  // Your processing logic here
  return { success: true };
});
```

### For Existing Projects (Firecrawl)

See `MIGRATION.md` for detailed migration steps. Quick version:

```typescript
// Replace local Redis connection
import { getBullMQRedisConnection } from '../../../../../infrastructure/bullmq';

// Old: const connection = new IORedis(process.env.REDIS_URL!);
// New:
const connection = getBullMQRedisConnection();
```

## Predefined Queues

All queues are defined in `QueueName` enum:

### Firecrawl (Already Exists)
- `FIRECRAWL_EXTRACT`
- `FIRECRAWL_LOGGING`
- `FIRECRAWL_INDEX`
- `FIRECRAWL_DEEP_RESEARCH`
- `FIRECRAWL_BILLING`
- `FIRECRAWL_PRECRAWL`
- `FIRECRAWL_GENERATE_LLMS`

### Placeholders for Integration
- **N8N**: `N8N_WORKFLOW`, `N8N_WEBHOOK`
- **Inspector**: `INSPECTOR_ANALYSIS`
- **Dispatch**: `DISPATCH_ROUTING`, `DISPATCH_NOTIFICATIONS`
- **MCP**: `MCP_VIRUSTOTAL`, `MCP_FIRECRAWL`
- **Common**: `EMAIL`, `NOTIFICATIONS`, `ANALYTICS`, `BACKGROUND_JOBS`

## Environment Variables

```bash
# Redis connection (defaults to localhost:6379/3)
REDIS_HOST=localhost
REDIS_PORT=6379
BULLMQ_REDIS_DB=3

# Or use Redis URL format
BULLMQ_REDIS_URL=redis://localhost:6379/3

# Optional authentication
REDIS_PASSWORD=your-password
```

## Key Features

1. **Shared Connection Pool**: All queues use a single Redis connection
2. **Type Safety**: Full TypeScript support with predefined job data types
3. **Standardized Config**: Consistent retry policies and job options
4. **DAPR Integration**: Queue events can publish to RabbitMQ
5. **Graceful Shutdown**: Built-in cleanup functions
6. **Monitoring**: Queue statistics and health checks

## Testing

```bash
cd infrastructure/bullmq
npm install
npm run build
# Note: test.ts requires running Redis instance
```

## Dependencies

- `bullmq@5.56.7` - Job queue library
- `ioredis@5.6.1` - Redis client
- TypeScript 5.9+

## Integration Checklist

When integrating a new Node.js project:

- [ ] Import BullMQ infrastructure in your project
- [ ] Use predefined queue name from `QueueName` enum (or create custom)
- [ ] Create queue using `createQueue()`
- [ ] Create worker using `createWorker()`
- [ ] Configure environment variables
- [ ] Add graceful shutdown handler
- [ ] Test queue functionality
- [ ] Add project to DAPR `pubsub-bullmq.yaml` scopes if needed
- [ ] Update this summary with new queue types if created

## Next Steps

1. **Firecrawl Migration**: Follow MIGRATION.md to migrate firecrawl-api
2. **N8N Integration**: When integrating N8N, use predefined N8N queues
3. **Other Projects**: As projects from features/ are integrated, use appropriate predefined queues

## Support Resources

- Full Documentation: `README.md`
- Migration Guide: `MIGRATION.md`
- Usage Examples: `examples.ts`
- Test: `test.ts`

## Notes

- Redis database 3 is reserved for BullMQ across the entire platform
- All queue names use hash tags (e.g., `{queueName}`) for Redis Cluster compatibility
- Default job retention: 25 hours for completed, 25 hours for failed
- Default retry: 3 attempts with exponential backoff
