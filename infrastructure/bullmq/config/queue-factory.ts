/**
 * BullMQ Queue Factory
 * Creates and manages BullMQ queues with standardized configuration
 * Integrates with DAPR service mesh and RabbitMQ pub/sub
 */

import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { getBullMQRedisConnection } from './connection';

// Standard queue names - can be extended by applications
export enum QueueName {
  // Core queues
  DEFAULT = 'default',
  
  // Firecrawl queues (existing)
  FIRECRAWL_EXTRACT = '{extractQueue}',
  FIRECRAWL_LOGGING = '{loggingQueue}',
  FIRECRAWL_INDEX = '{indexQueue}',
  FIRECRAWL_DEEP_RESEARCH = '{deepResearchQueue}',
  FIRECRAWL_BILLING = '{billingQueue}',
  FIRECRAWL_PRECRAWL = '{precrawlQueue}',
  FIRECRAWL_GENERATE_LLMS = '{generateLlmsTxtQueue}',
  
  // N8N queues (placeholder for integration)
  N8N_WORKFLOW = '{n8nWorkflowQueue}',
  N8N_WEBHOOK = '{n8nWebhookQueue}',
  N8N_EXECUTION = '{n8nExecutionQueue}',
  
  // Inspector queues (placeholder for integration)
  INSPECTOR_ANALYSIS = '{inspectorAnalysisQueue}',
  
  // Dispatch queues (placeholder for integration)
  DISPATCH_ROUTING = '{dispatchRoutingQueue}',
  DISPATCH_NOTIFICATIONS = '{dispatchNotificationsQueue}',
  
  // Actual (personal finance) queues (placeholder for integration)
  ACTUAL_SYNC = '{actualSyncQueue}',
  ACTUAL_BACKUP = '{actualBackupQueue}',
  
  // Ghostwriter queues (placeholder for integration)
  GHOSTWRITER_COLLAB = '{ghostwriterCollabQueue}',
  GHOSTWRITER_EXPORT = '{ghostwriterExportQueue}',
  
  // Mealie queues (placeholder for integration)
  MEALIE_RECIPE_IMPORT = '{mealieRecipeImportQueue}',
  MEALIE_IMAGE_PROCESSING = '{mealieImageProcessingQueue}',
  
  // MTG Scripting Toolkit queues (placeholder for integration)
  MTG_CARD_ANALYSIS = '{mtgCardAnalysisQueue}',
  MTG_DECK_OPTIMIZATION = '{mtgDeckOptimizationQueue}',
  
  // CyberChef queues (placeholder for integration)
  CYBERCHEF_OPERATION = '{cyberchefOperationQueue}',
  
  // IT-Tools queues (placeholder for integration)
  IT_TOOLS_CONVERSION = '{itToolsConversionQueue}',
  
  // Commander Spellbook queues (placeholder for integration)
  SPELLBOOK_COMBO_SEARCH = '{spellbookComboSearchQueue}',
  
  // Nemesis queues (placeholder for integration)
  NEMESIS_FILE_ENRICHMENT = '{nemesisFileEnrichmentQueue}',
  NEMESIS_DATA_PROCESSING = '{nemesisDataProcessingQueue}',
  
  // FileScopeMCP queues (placeholder for integration)
  FILESCOPE_INDEXING = '{filescopeIndexingQueue}',
  FILESCOPE_DEPENDENCY_ANALYSIS = '{filescopeDependencyAnalysisQueue}',
  
  // Generic application queues (placeholder for future use)
  EMAIL = '{emailQueue}',
  NOTIFICATIONS = '{notificationsQueue}',
  ANALYTICS = '{analyticsQueue}',
  BACKGROUND_JOBS = '{backgroundJobsQueue}',
}

// Default job options for all queues
const DEFAULT_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: {
    age: 90000000, // 25 hours (90000000ms = 25 * 60 * 60 * 1000)
    count: 1000,
  },
  removeOnFail: {
    age: 90000000, // 25 hours
    count: 5000,
  },
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

// Default queue options
const DEFAULT_QUEUE_OPTIONS: Partial<QueueOptions> = {
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
};

// Queue registry to prevent duplicate queue instances
const queueRegistry = new Map<string, Queue>();

/**
 * Create or get a BullMQ queue
 * @param queueName Name of the queue (use QueueName enum or custom string)
 * @param options Optional queue configuration
 * @returns Queue instance
 */
export function createQueue<T = any>(
  queueName: QueueName | string,
  options?: Partial<QueueOptions>
): Queue<T> {
  const registryKey = queueName;

  // Return existing queue if already created
  if (queueRegistry.has(registryKey)) {
    return queueRegistry.get(registryKey) as Queue<T>;
  }

  // Create new queue
  const queue = new Queue<T>(queueName, {
    ...DEFAULT_QUEUE_OPTIONS,
    connection: getBullMQRedisConnection(),
    ...options,
  });

  // Register queue
  queueRegistry.set(registryKey, queue);

  console.log(`[BullMQ] Queue created: ${queueName}`);

  return queue;
}

/**
 * Get an existing queue
 * @param queueName Name of the queue
 * @returns Queue instance or undefined if not found
 */
export function getQueue<T = any>(queueName: QueueName | string): Queue<T> | undefined {
  return queueRegistry.get(queueName) as Queue<T> | undefined;
}

/**
 * Close a specific queue
 * @param queueName Name of the queue to close
 */
export async function closeQueue(queueName: QueueName | string): Promise<void> {
  const queue = queueRegistry.get(queueName);
  if (queue) {
    await queue.close();
    queueRegistry.delete(queueName);
    console.log(`[BullMQ] Queue closed: ${queueName}`);
  }
}

/**
 * Close all queues (for graceful shutdown)
 */
export async function closeAllQueues(): Promise<void> {
  const closePromises = Array.from(queueRegistry.entries()).map(async ([name, queue]) => {
    await queue.close();
    console.log(`[BullMQ] Queue closed: ${name}`);
  });

  await Promise.all(closePromises);
  queueRegistry.clear();
  console.log('[BullMQ] All queues closed');
}

/**
 * Get all registered queue names
 */
export function getRegisteredQueues(): string[] {
  return Array.from(queueRegistry.keys());
}

/**
 * Pause a queue
 * @param queueName Name of the queue to pause
 */
export async function pauseQueue(queueName: QueueName | string): Promise<void> {
  const queue = queueRegistry.get(queueName);
  if (queue) {
    await queue.pause();
    console.log(`[BullMQ] Queue paused: ${queueName}`);
  }
}

/**
 * Resume a paused queue
 * @param queueName Name of the queue to resume
 */
export async function resumeQueue(queueName: QueueName | string): Promise<void> {
  const queue = queueRegistry.get(queueName);
  if (queue) {
    await queue.resume();
    console.log(`[BullMQ] Queue resumed: ${queueName}`);
  }
}
