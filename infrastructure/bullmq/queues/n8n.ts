/**
 * N8N Queue Configurations
 * Placeholder for N8N workflow automation integration
 * 
 * When integrating N8N from features/n8n:
 * 1. Import this configuration
 * 2. Create workers for workflow and webhook processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { N8NWorkflowJobData, N8NWebhookJobData } from '../types';

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
        age: 86400, // 24 hours
        count: 100,
      },
      removeOnFail: {
        age: 259200, // 3 days
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
        age: 43200, // 12 hours
        count: 200,
      },
      removeOnFail: {
        age: 86400, // 24 hours
        count: 1000,
      },
    },
  });
}
