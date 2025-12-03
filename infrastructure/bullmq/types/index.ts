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

export interface N8NExecutionJobData extends BaseJobData {
  executionId: string;
  workflowId: string;
  mode: 'manual' | 'webhook' | 'trigger';
  data?: Record<string, any>;
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
 * Actual (personal finance) job data types (placeholders)
 */
export interface ActualSyncJobData extends BaseJobData {
  accountId: string;
  syncType: 'full' | 'incremental';
  options?: Record<string, any>;
}

export interface ActualBackupJobData extends BaseJobData {
  budgetId: string;
  backupType: 'local' | 'cloud';
  destination?: string;
}

/**
 * Ghostwriter job data types (placeholders)
 */
export interface GhostwriterCollabJobData extends BaseJobData {
  documentId: string;
  userId: string;
  operation: 'edit' | 'comment' | 'review';
  data?: Record<string, any>;
}

export interface GhostwriterExportJobData extends BaseJobData {
  documentId: string;
  format: 'pdf' | 'docx' | 'html' | 'markdown';
  options?: Record<string, any>;
}

/**
 * Mealie job data types (placeholders)
 */
export interface MealieRecipeImportJobData extends BaseJobData {
  sourceUrl?: string;
  sourceFile?: string;
  userId: string;
  importType: 'url' | 'file' | 'ocr';
}

export interface MealieImageProcessingJobData extends BaseJobData {
  recipeId: string;
  imageUrl: string;
  operations: Array<'resize' | 'optimize' | 'thumbnail'>;
}

/**
 * MTG Scripting Toolkit job data types (placeholders)
 */
export interface MTGCardAnalysisJobData extends BaseJobData {
  cardIds: string[];
  analysisType: 'pricing' | 'legality' | 'synergy' | 'meta';
  options?: Record<string, any>;
}

export interface MTGDeckOptimizationJobData extends BaseJobData {
  deckId: string;
  format: 'standard' | 'modern' | 'commander' | 'legacy';
  constraints?: Record<string, any>;
}

/**
 * CyberChef job data types (placeholders)
 */
export interface CyberChefOperationJobData extends BaseJobData {
  input: string | Buffer;
  recipe: Array<{
    op: string;
    args: any[];
  }>;
  outputFormat?: 'string' | 'byteArray' | 'number';
}

/**
 * IT-Tools job data types (placeholders)
 */
export interface ITToolsConversionJobData extends BaseJobData {
  input: string;
  toolType: 'base64' | 'hash' | 'jwt' | 'xml' | 'json' | 'yaml';
  operation: string;
  options?: Record<string, any>;
}

/**
 * Commander Spellbook job data types (placeholders)
 */
export interface SpellbookComboSearchJobData extends BaseJobData {
  cardNames?: string[];
  colorIdentity?: string[];
  commanderFormat?: boolean;
  minCards?: number;
  maxCards?: number;
}

/**
 * Nemesis job data types (placeholders)
 */
export interface NemesisFileEnrichmentJobData extends BaseJobData {
  fileId: string;
  filePath: string;
  enrichmentTypes: Array<'metadata' | 'hash' | 'yara' | 'strings'>;
}

export interface NemesisDataProcessingJobData extends BaseJobData {
  dataType: 'credential' | 'file' | 'network' | 'process';
  payload: Record<string, any>;
  processingSteps: string[];
}

/**
 * FileScopeMCP job data types (placeholders)
 */
export interface FileScopeIndexingJobData extends BaseJobData {
  repositoryPath: string;
  filePatterns?: string[];
  excludePatterns?: string[];
  deep?: boolean;
}

export interface FileScopeDependencyAnalysisJobData extends BaseJobData {
  filePath: string;
  analysisType: 'imports' | 'exports' | 'dependencies' | 'references';
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
