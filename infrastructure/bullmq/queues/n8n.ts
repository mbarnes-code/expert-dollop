/**
 * N8N Queue Configurations
 * Placeholder for N8N workflow automation integration
 * 
 * When integrating N8N from features/n8n:
 * 1. Import this configuration
 * 2. Create workers for workflow, webhook, and execution processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { N8NWorkflowJobData, N8NWebhookJobData, N8NExecutionJobData } from '../types';

/**
 * N8N Workflow Queue
 * Handles workflow execution jobs
 */
export function createN8NWorkflowQueue() {
  return createQueue<N8NWorkflowJobData>(QueueName.N8N_WORKFLOW, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 100,
      },
      removeOnFail: {
        age: 259200000, // 3 days
        count: 500,
      },
    },
  });
}

/**
 * N8N Webhook Queue
 * Handles webhook processing jobs
 */
export function createN8NWebhookQueue() {
  return createQueue<N8NWebhookJobData>(QueueName.N8N_WEBHOOK, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 43200000, // 12 hours
        count: 200,
      },
      removeOnFail: {
        age: 86400000, // 24 hours
        count: 1000,
      },
    },
  });
}

/**
 * N8N Execution Queue
 * Handles workflow execution tracking and monitoring
 */
export function createN8NExecutionQueue() {
  return createQueue<N8NExecutionJobData>(QueueName.N8N_EXECUTION, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 150,
      },
      removeOnFail: {
        age: 172800000, // 2 days
        count: 500,
      },
    },
  });
}
