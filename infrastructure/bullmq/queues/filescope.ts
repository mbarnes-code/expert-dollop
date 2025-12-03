/**
 * FileScopeMCP Queue Configurations
 * Placeholder for FileScopeMCP integration
 * 
 * When integrating FileScopeMCP from features/FileScopeMCP:
 * 1. Import this configuration
 * 2. Create workers for file indexing and dependency analysis
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { FileScopeIndexingJobData, FileScopeDependencyAnalysisJobData } from '../types';

/**
 * FileScope Indexing Queue
 * Handles repository file hierarchy indexing
 */
export function createFileScopeIndexingQueue() {
  return createQueue<FileScopeIndexingJobData>(QueueName.FILESCOPE_INDEXING, {
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
 * FileScope Dependency Analysis Queue
 * Handles file dependency tracking and analysis
 */
export function createFileScopeDependencyAnalysisQueue() {
  return createQueue<FileScopeDependencyAnalysisJobData>(QueueName.FILESCOPE_DEPENDENCY_ANALYSIS, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 150,
      },
      removeOnFail: {
        age: 172800000, // 2 days
        count: 500,
      },
    },
  });
}
