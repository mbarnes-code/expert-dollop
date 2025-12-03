/**
 * BullMQ Integration Examples
 * 
 * This file provides examples of how to integrate BullMQ infrastructure
 * in your Node.js projects within the expert-dollop monorepo.
 */

// ==============================================================================
// Example 1: Basic Queue Usage
// ==============================================================================

import {
  createQueue,
  createWorker,
  QueueName,
  type EmailJobData,
} from '@expert-dollop/bullmq-infrastructure';

// Create a queue
const emailQueue = createQueue<EmailJobData>(QueueName.EMAIL);

// Add a job to the queue
async function sendEmail(to: string, subject: string, body: string) {
  await emailQueue.add('send-email', {
    to,
    subject,
    body,
    timestamp: Date.now(),
  });
}

// Create a worker to process jobs
const emailWorker = createWorker<EmailJobData>(
  QueueName.EMAIL,
  async (job) => {
    console.log(`Processing email job ${job.id}`);
    const { to, subject, body } = job.data;
    
    // Your email sending logic here
    // await sendEmailService(to, subject, body);
    
    return { success: true, emailId: 'email-123' };
  },
  {
    concurrency: 5, // Process 5 emails concurrently
  }
);

// ==============================================================================
// Example 2: Using Predefined Queue Functions
// ==============================================================================

import {
  createN8NWorkflowQueue,
  createDispatchRoutingQueue,
  createMCPVirusTotalQueue,
} from '@expert-dollop/bullmq-infrastructure';

// For N8N integration
const n8nQueue = createN8NWorkflowQueue();
await n8nQueue.add('execute-workflow', {
  workflowId: 'workflow-123',
  executionData: { input: 'data' },
});

// For Dispatch integration
const dispatchQueue = createDispatchRoutingQueue();
await dispatchQueue.add('route-incident', {
  incidentId: 'incident-456',
  priority: 1,
  location: { lat: 40.7128, lng: -74.0060 },
});

// For MCP VirusTotal integration
const virusTotalQueue = createMCPVirusTotalQueue();
await virusTotalQueue.add('scan-file', {
  hash: 'abc123',
  scanType: 'file',
});

// ==============================================================================
// Example 3: Custom Queue with Custom Configuration
// ==============================================================================

import { createQueue, createWorker } from '@expert-dollop/bullmq-infrastructure';

interface CustomJobData {
  id: string;
  action: string;
  data: any;
}

const customQueue = createQueue<CustomJobData>('my-custom-queue', {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 100,
    },
    removeOnFail: {
      age: 259200, // 3 days
      count: 500,
    },
  },
});

const customWorker = createWorker<CustomJobData>(
  'my-custom-queue',
  async (job) => {
    const { action, data } = job.data;
    
    switch (action) {
      case 'process':
        // Process logic
        break;
      case 'transform':
        // Transform logic
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return { success: true };
  },
  {
    concurrency: 10,
  }
);

// ==============================================================================
// Example 4: Graceful Shutdown
// ==============================================================================

import {
  closeAllQueues,
  closeAllWorkers,
  closeBullMQRedisConnection,
} from '@expert-dollop/bullmq-infrastructure';

async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  
  // Close all workers first (stop processing)
  await closeAllWorkers();
  
  // Then close all queues
  await closeAllQueues();
  
  // Finally close the Redis connection
  await closeBullMQRedisConnection();
  
  console.log('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ==============================================================================
// Example 5: Queue Monitoring and Management
// ==============================================================================

import { getQueue, pauseQueue, resumeQueue } from '@expert-dollop/bullmq-infrastructure';

async function monitorQueue(queueName: string) {
  const queue = getQueue(queueName);
  
  if (!queue) {
    console.error(`Queue ${queueName} not found`);
    return;
  }
  
  // Get queue statistics
  const counts = await queue.getJobCounts();
  console.log('Queue statistics:', counts);
  
  // Get failed jobs
  const failedJobs = await queue.getFailed();
  console.log(`Failed jobs: ${failedJobs.length}`);
  
  // Retry all failed jobs
  for (const job of failedJobs) {
    await job.retry();
  }
}

async function pauseQueueTemporarily(queueName: string, durationMs: number) {
  await pauseQueue(queueName);
  console.log(`Queue ${queueName} paused`);
  
  setTimeout(async () => {
    await resumeQueue(queueName);
    console.log(`Queue ${queueName} resumed`);
  }, durationMs);
}

// ==============================================================================
// Example 6: Integration with DAPR Pub/Sub
// ==============================================================================

import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();

// Create a worker that publishes events to DAPR
const daprIntegratedWorker = createWorker(
  QueueName.FIRECRAWL_EXTRACT,
  async (job) => {
    // Process the job
    const result = await processExtraction(job.data);
    
    // Publish completion event to DAPR pub/sub
    await daprClient.pubsub.publish('pubsub-bullmq', 'bullmq.job.completed', {
      jobId: job.id,
      queueName: job.queueName,
      result,
    });
    
    return result;
  }
);

// Handle worker errors and publish to DAPR
daprIntegratedWorker.on('failed', async (job, error) => {
  await daprClient.pubsub.publish('pubsub-bullmq', 'bullmq.job.failed', {
    jobId: job?.id,
    queueName: job?.queueName,
    error: error.message,
  });
});

// ==============================================================================
// Example 7: Job Priority
// ==============================================================================

import { JobPriority } from '@expert-dollop/bullmq-infrastructure';

// Add high-priority job
await emailQueue.add(
  'urgent-email',
  {
    to: 'admin@example.com',
    subject: 'URGENT',
    body: 'Critical alert',
  },
  {
    priority: JobPriority.CRITICAL,
  }
);

// Add low-priority job
await emailQueue.add(
  'newsletter',
  {
    to: 'users@example.com',
    subject: 'Newsletter',
    body: 'Monthly newsletter',
  },
  {
    priority: JobPriority.LOW,
  }
);

// ==============================================================================
// Example 8: Scheduled Jobs (Delayed Processing)
// ==============================================================================

// Schedule a job to run in 1 hour
await emailQueue.add(
  'scheduled-email',
  {
    to: 'user@example.com',
    subject: 'Reminder',
    body: 'Your scheduled reminder',
  },
  {
    delay: 60 * 60 * 1000, // 1 hour in milliseconds
  }
);

// Schedule a job to run at specific time
const targetTime = new Date('2024-12-03T15:00:00Z');
const delayMs = targetTime.getTime() - Date.now();

await emailQueue.add(
  'timed-email',
  {
    to: 'user@example.com',
    subject: 'Scheduled Message',
    body: 'This email was scheduled',
  },
  {
    delay: delayMs,
  }
);
