/**
 * Ghostwriter Queue Configurations
 * Placeholder for Ghostwriter integration
 * 
 * When integrating Ghostwriter from features/Ghostwriter:
 * 1. Import this configuration
 * 2. Create workers for collaboration and export processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { GhostwriterCollabJobData, GhostwriterExportJobData } from '../types';

/**
 * Ghostwriter Collaboration Queue
 * Handles real-time collaboration operations
 */
export function createGhostwriterCollabQueue() {
  return createQueue<GhostwriterCollabJobData>(QueueName.GHOSTWRITER_COLLAB, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 43200000, // 12 hours
        count: 500,
      },
      removeOnFail: {
        age: 86400000, // 24 hours
        count: 1000,
      },
      priority: 2, // High priority for real-time operations
    },
  });
}

/**
 * Ghostwriter Export Queue
 * Handles document export jobs
 */
export function createGhostwriterExportQueue() {
  return createQueue<GhostwriterExportJobData>(QueueName.GHOSTWRITER_EXPORT, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
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
