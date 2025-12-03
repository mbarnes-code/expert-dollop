/**
 * BullMQ Main Entry Point
 * Exports all BullMQ functionality for use across Node.js projects
 */

// Connection management
export {
  getBullMQRedisConnection,
  closeBullMQRedisConnection,
  getBullMQConnectionStatus,
} from './config/connection';

// Queue management
export {
  createQueue,
  getQueue,
  closeQueue,
  closeAllQueues,
  getRegisteredQueues,
  pauseQueue,
  resumeQueue,
  QueueName,
} from './config/queue-factory';

// Worker management
export {
  createWorker,
  getWorker,
  closeWorker,
  closeAllWorkers,
  getRegisteredWorkers,
  pauseWorker,
  resumeWorker,
} from './config/worker-factory';

// Predefined queue configurations
export {
  createN8NWorkflowQueue,
  createN8NWebhookQueue,
  createInspectorAnalysisQueue,
  createDispatchRoutingQueue,
  createDispatchNotificationsQueue,
  createMCPVirusTotalQueue,
  createMCPFirecrawlQueue,
  createEmailQueue,
  createNotificationsQueue,
  createAnalyticsQueue,
  createBackgroundJobsQueue,
} from './queues';

// Types
export type {
  BaseJobData,
  JobResult,
  QueueStats,
  WorkerStats,
  PriorityJobOptions,
  QueueHealth,
  BullMQConfig,
  FirecrawlExtractJobData,
  FirecrawlDeepResearchJobData,
  N8NWorkflowJobData,
  N8NWebhookJobData,
  InspectorAnalysisJobData,
  DispatchRoutingJobData,
  DispatchNotificationJobData,
  MCPVirusTotalJobData,
  MCPFirecrawlJobData,
  BackgroundJobData,
  EmailJobData,
  NotificationJobData,
  AnalyticsJobData,
} from './types';

export { JobPriority } from './types';

// Re-export BullMQ core types for convenience
export type { Job, Queue, Worker, JobsOptions, WorkerOptions, Processor } from 'bullmq';
