# Migration Guide: Firecrawl to Shared BullMQ Infrastructure

This guide helps migrate the existing Firecrawl BullMQ implementation to use the centralized BullMQ infrastructure.

## Current State

Firecrawl currently has its own BullMQ implementation in:
- `apps/ai/firecrawl-api/src/services/queue-service.ts`
- Uses Redis connection directly
- Defines its own queues: extractQueue, loggingQueue, indexQueue, etc.

## Migration Benefits

1. **Centralized Connection Management**: Single Redis connection pool shared across all Node.js projects
2. **Standardized Configuration**: Consistent queue settings and retry policies
3. **Type Safety**: Predefined TypeScript types for job data
4. **DAPR Integration**: Queue events can be published to RabbitMQ
5. **Better Monitoring**: Centralized queue management and monitoring

## Migration Steps

### Step 1: Update Imports (Minimal Change)

**Before:**
```typescript
// apps/ai/firecrawl-api/src/services/queue-service.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

let redisConnection: IORedis;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });
  }
  return redisConnection;
}
```

**After:**
```typescript
// apps/ai/firecrawl-api/src/services/queue-service.ts
import { getBullMQRedisConnection } from '../../../../../infrastructure/bullmq';

// Use shared connection
export function getRedisConnection() {
  return getBullMQRedisConnection();
}
```

### Step 2: Update Queue Creation (Minimal Change)

**Before:**
```typescript
import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

let extractQueue: Queue;

export function getExtractQueue() {
  if (!extractQueue) {
    extractQueue = new Queue(extractQueueName, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: {
          age: 90000,
        },
        removeOnFail: {
          age: 90000,
        },
      },
      telemetry: new BullMQOtel("firecrawl-bullmq"),
    });
  }
  return extractQueue;
}
```

**After (Option A - Keep existing code, just use shared connection):**
```typescript
import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";
import { getBullMQRedisConnection } from '../../../../../infrastructure/bullmq';

let extractQueue: Queue;

export function getExtractQueue() {
  if (!extractQueue) {
    extractQueue = new Queue(extractQueueName, {
      connection: getBullMQRedisConnection(), // <-- Only change needed
      defaultJobOptions: {
        removeOnComplete: {
          age: 90000,
        },
        removeOnFail: {
          age: 90000,
        },
      },
      telemetry: new BullMQOtel("firecrawl-bullmq"),
    });
  }
  return extractQueue;
}
```

**After (Option B - Use shared queue factory):**
```typescript
import { createQueue, QueueName } from '../../../../../infrastructure/bullmq';
import { BullMQOtel } from "bullmq-otel";

export function getExtractQueue() {
  return createQueue(QueueName.FIRECRAWL_EXTRACT, {
    defaultJobOptions: {
      removeOnComplete: {
        age: 90000,
      },
      removeOnFail: {
        age: 90000,
      },
    },
    telemetry: new BullMQOtel("firecrawl-bullmq"),
  });
}
```

### Step 3: Environment Variables

Update `.env` to use shared Redis configuration:

```bash
# Use shared BullMQ Redis configuration
BULLMQ_REDIS_URL=redis://localhost:6379/3

# Or use individual settings
REDIS_HOST=localhost
REDIS_PORT=6379
BULLMQ_REDIS_DB=3
```

### Step 4: Update Worker Creation (Optional)

**Before:**
```typescript
import { Worker } from "bullmq";

const worker = new Worker(
  queueName,
  async (job) => {
    // process job
  },
  {
    connection: getRedisConnection(),
    concurrency: 10,
  }
);
```

**After:**
```typescript
import { createWorker, QueueName } from '../../../../../infrastructure/bullmq';

const worker = createWorker(
  QueueName.FIRECRAWL_EXTRACT,
  async (job) => {
    // process job
  },
  {
    concurrency: 10,
  }
);
```

## Recommended Migration Approach

### Phase 1: Minimal Change (Immediate - Low Risk)

1. Replace `getRedisConnection()` to use `getBullMQRedisConnection()`
2. Keep all existing queue and worker code as-is
3. Update environment variables to use `BULLMQ_REDIS_URL`
4. Test thoroughly

**Benefits:**
- Minimal code changes
- Shared Redis connection pool
- Easy to rollback

### Phase 2: Gradual Adoption (Future - Optional)

1. Migrate one queue at a time to use `createQueue()`
2. Migrate workers to use `createWorker()`
3. Add DAPR pub/sub integration for queue events
4. Use predefined TypeScript types for job data

**Benefits:**
- Full integration with shared infrastructure
- Centralized queue management
- Better monitoring and observability

## Testing

1. **Unit Tests**: Update to mock shared infrastructure
2. **Integration Tests**: Verify queues work with shared Redis
3. **Performance Tests**: Ensure no performance regression

## Rollback Plan

If issues occur, simply revert the import changes:

```typescript
// Rollback: use local Redis connection again
import IORedis from "ioredis";

let redisConnection: IORedis;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });
  }
  return redisConnection;
}
```

## Support

For questions or issues:
1. Check [BullMQ Infrastructure README](./README.md)
2. Review [examples.ts](./examples.ts) for usage patterns
3. Run test: `npm run test` in `infrastructure/bullmq`

## Timeline Recommendation

- **Week 1**: Phase 1 migration (minimal change)
- **Week 2**: Testing and validation
- **Week 3+**: Optional Phase 2 (gradual adoption)

## Notes

- The shared infrastructure uses Redis database 3 (same as current setup)
- All existing queue names are preserved in `QueueName` enum
- BullMQ version: 5.56.7 (same as Firecrawl)
- IORedis version: 5.6.1 (same as Firecrawl)
