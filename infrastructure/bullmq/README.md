# BullMQ Infrastructure

Centralized BullMQ queue management system for all Node.js projects in the expert-dollop monorepo.

## Overview

BullMQ is a fast, robust, and feature-rich queue system for Node.js, built on top of Redis. This infrastructure provides:

- **Shared connection management**: Single Redis connection pool for all queues
- **Standardized queue factory**: Consistent queue creation across projects
- **Worker factory**: Easy worker creation with monitoring
- **Type safety**: Full TypeScript support with predefined job data types
- **DAPR integration**: Queue events published to RabbitMQ pub/sub
- **Multi-project support**: Ready for firecrawl, n8n, inspector, dispatch, MCP servers, and more

## Architecture

### Redis Database Allocation

BullMQ uses **Redis database 3** (reserved for job queues per platform architecture):

| Database | Purpose |
|----------|---------|
| 0 | User sessions |
| 1 | Application cache |
| 2 | Rate limiting |
| **3** | **Job queues (BullMQ)** |
| 4 | Pub/sub channels |
| 5 | Security tokens |
| 6 | TCG state cache |
| 7 | AI model cache |
| 8 | Analytics data |

### Directory Structure

```
infrastructure/bullmq/
├── config/
│   ├── connection.ts        # Redis connection manager
│   ├── queue-factory.ts     # Queue creation and management
│   └── worker-factory.ts    # Worker creation and management
├── types/
│   └── index.ts            # TypeScript types for job data
├── queues/                 # Queue-specific configurations (future)
├── index.ts                # Main entry point
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Installation

The BullMQ infrastructure is already installed at the root level. To use it in your Node.js project:

1. **Import the infrastructure**:

```typescript
import {
  createQueue,
  createWorker,
  QueueName,
  type FirecrawlExtractJobData,
} from '../../infrastructure/bullmq';
```

2. **Configure environment variables** (if not using defaults):

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

## Usage

### Creating a Queue

```typescript
import { createQueue, QueueName } from '@expert-dollop/bullmq-infrastructure';

// Use predefined queue names
const extractQueue = createQueue(QueueName.FIRECRAWL_EXTRACT);

// Or create custom queue
const customQueue = createQueue('my-custom-queue');

// Add jobs to queue
await extractQueue.add('extract-job', {
  url: 'https://example.com',
  apiKey: 'key123',
});
```

### Creating a Worker

```typescript
import { createWorker, QueueName, type FirecrawlExtractJobData } from '@expert-dollop/bullmq-infrastructure';

const worker = createWorker<FirecrawlExtractJobData>(
  QueueName.FIRECRAWL_EXTRACT,
  async (job) => {
    console.log(`Processing job ${job.id}`, job.data);
    
    // Your processing logic here
    const result = await processExtraction(job.data.url);
    
    return { success: true, data: result };
  },
  {
    concurrency: 10, // Process 10 jobs concurrently
  }
);
```

### Graceful Shutdown

```typescript
import { closeAllQueues, closeAllWorkers, closeBullMQRedisConnection } from '@expert-dollop/bullmq-infrastructure';

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  
  await closeAllWorkers();
  await closeAllQueues();
  await closeBullMQRedisConnection();
  
  process.exit(0);
});
```

## Predefined Queues

The following queues are predefined and ready for use:

### Firecrawl Queues (Already Integrated)
- `FIRECRAWL_EXTRACT` - Web content extraction
- `FIRECRAWL_LOGGING` - Logging operations
- `FIRECRAWL_INDEX` - Document indexing
- `FIRECRAWL_DEEP_RESEARCH` - Deep research tasks
- `FIRECRAWL_BILLING` - Billing operations
- `FIRECRAWL_PRECRAWL` - Pre-crawl preparation
- `FIRECRAWL_GENERATE_LLMS` - LLM content generation

### N8N Queues (Placeholder for Integration)
- `N8N_WORKFLOW` - Workflow execution
- `N8N_WEBHOOK` - Webhook processing

### Inspector Queues (Placeholder for Integration)
- `INSPECTOR_ANALYSIS` - Code/site analysis

### Dispatch Queues (Placeholder for Integration)
- `DISPATCH_ROUTING` - Incident routing
- `DISPATCH_NOTIFICATIONS` - Notification dispatch

### MCP Queues (Placeholder for Integration)
- `MCP_VIRUSTOTAL` - VirusTotal scans
- `MCP_FIRECRAWL` - Firecrawl MCP operations

### Generic Queues (Placeholder for Future Use)
- `EMAIL` - Email sending
- `NOTIFICATIONS` - Push notifications
- `ANALYTICS` - Analytics processing
- `BACKGROUND_JOBS` - Generic background tasks

## Job Data Types

All job data types are predefined with TypeScript interfaces:

```typescript
import type {
  FirecrawlExtractJobData,
  N8NWorkflowJobData,
  DispatchRoutingJobData,
  EmailJobData,
} from '@expert-dollop/bullmq-infrastructure';

// Firecrawl extraction job
const extractJob: FirecrawlExtractJobData = {
  url: 'https://example.com',
  apiKey: 'key123',
  metadata: { userId: '456' },
};

// Email job
const emailJob: EmailJobData = {
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Hello!',
  metadata: { campaign: 'onboarding' },
};
```

## Integration with DAPR

BullMQ events can be published to RabbitMQ via DAPR pub/sub:

```typescript
import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();

// Publish queue event
worker.on('completed', async (job) => {
  await daprClient.pubsub.publish('pubsub-bullmq', 'bullmq.job.completed', {
    jobId: job.id,
    queueName: job.queueName,
    result: job.returnvalue,
  });
});
```

## Monitoring

### Queue Statistics

```typescript
import { getQueue, QueueName } from '@expert-dollop/bullmq-infrastructure';

const queue = getQueue(QueueName.FIRECRAWL_EXTRACT);

if (queue) {
  const counts = await queue.getJobCounts();
  console.log('Queue stats:', counts);
  // { waiting: 10, active: 5, completed: 100, failed: 2 }
}
```

### Worker Health Check

```typescript
import { getWorker, QueueName } from '@expert-dollop/bullmq-infrastructure';

const worker = getWorker(QueueName.FIRECRAWL_EXTRACT);

if (worker) {
  const isRunning = await worker.isRunning();
  const isPaused = await worker.isPaused();
  console.log(`Worker running: ${isRunning}, paused: ${isPaused}`);
}
```

## Best Practices

1. **Use TypeScript types**: Always use predefined job data types for type safety
2. **Handle errors gracefully**: Implement proper error handling in workers
3. **Set appropriate concurrency**: Adjust worker concurrency based on resource availability
4. **Monitor queue depth**: Watch for queue backlog and scale workers accordingly
5. **Implement retries**: Use BullMQ's built-in retry mechanisms with exponential backoff
6. **Graceful shutdown**: Always close queues and workers before process exit

## Migration Guide

### From Local BullMQ to Shared Infrastructure

If you have existing BullMQ code in your project:

**Before:**
```typescript
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);
const queue = new Queue('my-queue', { connection });
```

**After:**
```typescript
import { createQueue } from '@expert-dollop/bullmq-infrastructure';

const queue = createQueue('my-queue');
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `BULLMQ_REDIS_DB` | `3` | Redis database number |
| `REDIS_PASSWORD` | - | Redis password (if required) |
| `BULLMQ_REDIS_URL` | - | Full Redis URL (overrides individual settings) |

## Contributing

When adding new queue types:

1. Add queue name to `QueueName` enum in `config/queue-factory.ts`
2. Add job data interface to `types/index.ts`
3. Update this README with queue description
4. Add queue to DAPR component scopes if needed

## License

Apache-2.0
