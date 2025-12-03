/**
 * BullMQ Types and Interfaces
 * Shared TypeScript types for BullMQ integration across the platform
 */

import { JobsOptions, Job, Queue, Worker } from 'bullmq';

/**
 * Standard job data interface for all queues
 */
export interface BaseJobData {
  id?: string;
  timestamp?: number;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * Job result interface
 */
export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
  timestamp: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

/**
 * Worker statistics
 */
export interface WorkerStats {
  processed: number;
  failed: number;
  active: number;
  concurrency: number;
  isRunning: boolean;
  isPaused: boolean;
}

/**
 * Job priority levels
 */
export enum JobPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5,
}

/**
 * Job options with priority
 */
export interface PriorityJobOptions extends JobsOptions {
  priority?: JobPriority;
}

/**
 * Queue health status
 */
export interface QueueHealth {
  name: string;
  isHealthy: boolean;
  stats: QueueStats;
  lastJobTimestamp?: number;
  errors?: string[];
}

/**
 * BullMQ service configuration
 */
export interface BullMQConfig {
  redis: {
    host: string;
    port: number;
    db: number;
    password?: string;
  };
  defaultJobOptions?: JobsOptions;
  defaultWorkerOptions?: {
    concurrency?: number;
    autorun?: boolean;
  };
}

/**
 * Firecrawl job data types (migrated from firecrawl-api)
 */
export interface FirecrawlExtractJobData extends BaseJobData {
  url: string;
  apiKey: string;
  options?: Record<string, any>;
}

export interface FirecrawlDeepResearchJobData extends BaseJobData {
  query: string;
  options?: Record<string, any>;
}

/**
 * N8N job data types (placeholders)
 */
export interface N8NWorkflowJobData extends BaseJobData {
  workflowId: string;
  executionData?: Record<string, any>;
}

export interface N8NWebhookJobData extends BaseJobData {
  webhookId: string;
  payload: Record<string, any>;
}

/**
 * Inspector job data types (placeholders)
 */
export interface InspectorAnalysisJobData extends BaseJobData {
  targetUrl: string;
  analysisType: 'security' | 'performance' | 'accessibility';
  options?: Record<string, any>;
}

/**
 * Dispatch job data types (placeholders)
 */
export interface DispatchRoutingJobData extends BaseJobData {
  incidentId: string;
  priority: JobPriority;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface DispatchNotificationJobData extends BaseJobData {
  recipientId: string;
  message: string;
  channel: 'email' | 'sms' | 'push';
}

/**
 * MCP job data types (placeholders)
 */
export interface MCPVirusTotalJobData extends BaseJobData {
  hash?: string;
  url?: string;
  ip?: string;
  domain?: string;
  scanType: 'file' | 'url' | 'ip' | 'domain';
}

export interface MCPFirecrawlJobData extends BaseJobData {
  url: string;
  action: 'scrape' | 'crawl' | 'extract';
  options?: Record<string, any>;
}

/**
 * Generic background job data
 */
export interface BackgroundJobData extends BaseJobData {
  type: string;
  payload: Record<string, any>;
}

/**
 * Email job data
 */
export interface EmailJobData extends BaseJobData {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

/**
 * Notification job data
 */
export interface NotificationJobData extends BaseJobData {
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string;
}

/**
 * Analytics job data
 */
export interface AnalyticsJobData extends BaseJobData {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
}
