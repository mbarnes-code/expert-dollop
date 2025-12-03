/**
 * Nemesis Queue Configurations
 * Placeholder for Nemesis integration
 * 
 * When integrating Nemesis from features/Nemesis:
 * 1. Import this configuration
 * 2. Create workers for file enrichment and data processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { NemesisFileEnrichmentJobData, NemesisDataProcessingJobData } from '../types';

/**
 * Nemesis File Enrichment Queue
 * Handles file metadata, hashing, YARA scanning, and string extraction
 */
export function createNemesisFileEnrichmentQueue() {
  return createQueue<NemesisFileEnrichmentJobData>(QueueName.NEMESIS_FILE_ENRICHMENT, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 172800000, // 2 days
        count: 200,
      },
      removeOnFail: {
        age: 604800000, // 7 days (security audit)
        count: 1000,
      },
    },
  });
}

/**
 * Nemesis Data Processing Queue
 * Handles credential, file, network, and process data processing
 */
export function createNemesisDataProcessingQueue() {
  return createQueue<NemesisDataProcessingJobData>(QueueName.NEMESIS_DATA_PROCESSING, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 259200000, // 3 days
        count: 300,
      },
      removeOnFail: {
        age: 604800000, // 7 days (security audit)
        count: 1500,
      },
      priority: 2, // High priority for security data
    },
  });
}
