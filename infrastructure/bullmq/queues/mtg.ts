/**
 * MTG Scripting Toolkit Queue Configurations
 * Placeholder for MTG Scripting Toolkit integration
 * 
 * When integrating from features/mtg-scripting-toolkit:
 * 1. Import this configuration
 * 2. Create workers for card analysis and deck optimization
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { MTGCardAnalysisJobData, MTGDeckOptimizationJobData } from '../types';

/**
 * MTG Card Analysis Queue
 * Handles card pricing, legality, synergy, and meta analysis
 */
export function createMTGCardAnalysisQueue() {
  return createQueue<MTGCardAnalysisJobData>(QueueName.MTG_CARD_ANALYSIS, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
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
 * MTG Deck Optimization Queue
 * Handles deck optimization and suggestions
 */
export function createMTGDeckOptimizationQueue() {
  return createQueue<MTGDeckOptimizationJobData>(QueueName.MTG_DECK_OPTIMIZATION, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 50,
      },
      removeOnFail: {
        age: 259200000, // 3 days
        count: 200,
      },
    },
  });
}
