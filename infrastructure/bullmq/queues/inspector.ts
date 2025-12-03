/**
 * Inspector Queue Configurations
 * Placeholder for Inspector (MCP Inspector) integration
 * 
 * When integrating Inspector from features/inspector:
 * 1. Import this configuration
 * 2. Create workers for analysis processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { InspectorAnalysisJobData } from '../types';

/**
 * Inspector Analysis Queue
 * Handles code/site analysis jobs
 */
export function createInspectorAnalysisQueue() {
  return createQueue<InspectorAnalysisJobData>(QueueName.INSPECTOR_ANALYSIS, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 50,
      },
      removeOnFail: {
        age: 172800, // 2 days
        count: 200,
      },
    },
  });
}
