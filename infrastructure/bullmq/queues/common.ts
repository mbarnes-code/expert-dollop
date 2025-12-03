/**
 * Generic/Common Queue Configurations
 * Placeholder for common infrastructure queues used across multiple projects
 * 
 * These queues are available for all Node.js applications:
 * - Email sending
 * - Push notifications
 * - Analytics processing
 * - Background jobs
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { EmailJobData, NotificationJobData, AnalyticsJobData, BackgroundJobData } from '../types';

/**
 * Email Queue
 * Handles email sending across all applications
 */
export function createEmailQueue() {
  return createQueue<EmailJobData>(QueueName.EMAIL, {
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 500,
      },
      removeOnFail: {
        age: 604800000, // 7 days (for debugging)
        count: 2000,
      },
    },
  });
}

/**
 * Notifications Queue
 * Handles push notifications and alerts
 */
export function createNotificationsQueue() {
  return createQueue<NotificationJobData>(QueueName.NOTIFICATIONS, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 43200000, // 12 hours
        count: 1000,
      },
      removeOnFail: {
        age: 172800000, // 2 days
        count: 5000,
      },
    },
  });
}

/**
 * Analytics Queue
 * Handles analytics data processing and aggregation
 */
export function createAnalyticsQueue() {
  return createQueue<AnalyticsJobData>(QueueName.ANALYTICS, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 5000,
      },
      removeOnFail: {
        age: 259200000, // 3 days
        count: 10000,
      },
      priority: 5, // Low priority - can be delayed
    },
  });
}

/**
 * Background Jobs Queue
 * Handles miscellaneous background tasks
 */
export function createBackgroundJobsQueue() {
  return createQueue<BackgroundJobData>(QueueName.BACKGROUND_JOBS, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 259200000, // 3 days
        count: 5000,
      },
    },
  });
}
