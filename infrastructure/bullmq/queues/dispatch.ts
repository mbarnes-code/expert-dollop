/**
 * Dispatch Queue Configurations
 * Placeholder for Dispatch integration
 * 
 * When integrating Dispatch from features/dispatch:
 * 1. Import this configuration
 * 2. Create workers for routing and notification processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { DispatchRoutingJobData, DispatchNotificationJobData } from '../types';

/**
 * Dispatch Routing Queue
 * Handles incident routing and assignment
 */
export function createDispatchRoutingQueue() {
  return createQueue<DispatchRoutingJobData>(QueueName.DISPATCH_ROUTING, {
    defaultJobOptions: {
      attempts: 5, // Critical routing - more retries
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 259200000, // 3 days (audit trail)
        count: 1000,
      },
      removeOnFail: {
        age: 604800000, // 7 days (investigation)
        count: 5000,
      },
      priority: 1, // High priority queue
    },
  });
}

/**
 * Dispatch Notifications Queue
 * Handles sending notifications to responders
 */
export function createDispatchNotificationsQueue() {
  return createQueue<DispatchNotificationJobData>(QueueName.DISPATCH_NOTIFICATIONS, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 500,
      },
      removeOnFail: {
        age: 172800000, // 2 days
        count: 2000,
      },
      priority: 2, // High priority
    },
  });
}
