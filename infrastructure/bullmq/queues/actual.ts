/**
 * Actual (Personal Finance) Queue Configurations
 * Placeholder for Actual integration
 * 
 * When integrating Actual from features/actual:
 * 1. Import this configuration
 * 2. Create workers for sync and backup processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { ActualSyncJobData, ActualBackupJobData } from '../types';

/**
 * Actual Sync Queue
 * Handles account synchronization jobs
 */
export function createActualSyncQueue() {
  return createQueue<ActualSyncJobData>(QueueName.ACTUAL_SYNC, {
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
 * Actual Backup Queue
 * Handles budget backup jobs
 */
export function createActualBackupQueue() {
  return createQueue<ActualBackupJobData>(QueueName.ACTUAL_BACKUP, {
    defaultJobOptions: {
      attempts: 5, // Critical - more retries
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: {
        age: 604800000, // 7 days (audit trail)
        count: 50,
      },
      removeOnFail: {
        age: 1209600000, // 14 days
        count: 200,
      },
      priority: 2, // High priority for backups
    },
  });
}
