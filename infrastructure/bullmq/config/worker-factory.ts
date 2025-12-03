/**
 * BullMQ Worker Factory
 * Creates and manages BullMQ workers with standardized configuration
 */

import { Worker, WorkerOptions, Job, Processor } from 'bullmq';
import { getBullMQRedisConnection } from './connection';
import { QueueName } from './queue-factory';

// Default worker options
const DEFAULT_WORKER_OPTIONS: Partial<WorkerOptions> = {
  concurrency: 5,
  autorun: true,
  removeOnComplete: {
    age: 90000, // 25 hours
    count: 1000,
  },
  removeOnFail: {
    age: 90000, // 25 hours
    count: 5000,
  },
};

// Worker registry to track active workers
const workerRegistry = new Map<string, Worker>();

/**
 * Create a BullMQ worker
 * @param queueName Name of the queue to process
 * @param processor Job processor function
 * @param options Optional worker configuration
 * @returns Worker instance
 */
export function createWorker<T = any, R = any>(
  queueName: QueueName | string,
  processor: Processor<T, R>,
  options?: Partial<WorkerOptions>
): Worker<T, R> {
  const registryKey = queueName;

  // Check if worker already exists
  if (workerRegistry.has(registryKey)) {
    console.warn(`[BullMQ] Worker for queue ${queueName} already exists`);
    return workerRegistry.get(registryKey) as Worker<T, R>;
  }

  // Create worker
  const worker = new Worker<T, R>(
    queueName,
    processor,
    {
      ...DEFAULT_WORKER_OPTIONS,
      connection: getBullMQRedisConnection(),
      ...options,
    }
  );

  // Event handlers
  worker.on('completed', (job: Job) => {
    console.log(`[BullMQ Worker] Job ${job.id} completed in queue ${queueName}`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[BullMQ Worker] Job ${job?.id} failed in queue ${queueName}:`, err.message);
  });

  worker.on('error', (err: Error) => {
    console.error(`[BullMQ Worker] Worker error in queue ${queueName}:`, err.message);
  });

  // Register worker
  workerRegistry.set(registryKey, worker);

  console.log(`[BullMQ] Worker created for queue: ${queueName}`);

  return worker;
}

/**
 * Get an existing worker
 * @param queueName Name of the queue
 * @returns Worker instance or undefined if not found
 */
export function getWorker<T = any, R = any>(queueName: QueueName | string): Worker<T, R> | undefined {
  return workerRegistry.get(queueName) as Worker<T, R> | undefined;
}

/**
 * Close a specific worker
 * @param queueName Name of the queue
 */
export async function closeWorker(queueName: QueueName | string): Promise<void> {
  const worker = workerRegistry.get(queueName);
  if (worker) {
    await worker.close();
    workerRegistry.delete(queueName);
    console.log(`[BullMQ] Worker closed for queue: ${queueName}`);
  }
}

/**
 * Close all workers (for graceful shutdown)
 */
export async function closeAllWorkers(): Promise<void> {
  const closePromises = Array.from(workerRegistry.entries()).map(async ([name, worker]) => {
    await worker.close();
    console.log(`[BullMQ] Worker closed for queue: ${name}`);
  });

  await Promise.all(closePromises);
  workerRegistry.clear();
  console.log('[BullMQ] All workers closed');
}

/**
 * Get all registered worker queue names
 */
export function getRegisteredWorkers(): string[] {
  return Array.from(workerRegistry.keys());
}

/**
 * Pause a worker
 * @param queueName Name of the queue
 */
export async function pauseWorker(queueName: QueueName | string): Promise<void> {
  const worker = workerRegistry.get(queueName);
  if (worker) {
    await worker.pause();
    console.log(`[BullMQ] Worker paused for queue: ${queueName}`);
  }
}

/**
 * Resume a paused worker
 * @param queueName Name of the queue
 */
export async function resumeWorker(queueName: QueueName | string): Promise<void> {
  const worker = workerRegistry.get(queueName);
  if (worker) {
    await worker.resume();
    console.log(`[BullMQ] Worker resumed for queue: ${queueName}`);
  }
}
