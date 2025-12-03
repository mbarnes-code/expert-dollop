/**
 * CyberChef, IT-Tools, and Commander Spellbook Queue Configurations
 * Placeholder for tool integrations
 * 
 * When integrating these tools from features/:
 * 1. Import this configuration
 * 2. Create workers for their respective operations
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { CyberChefOperationJobData, ITToolsConversionJobData, SpellbookComboSearchJobData } from '../types';

/**
 * CyberChef Operation Queue
 * Handles data transformation and analysis operations
 */
export function createCyberChefOperationQueue() {
  return createQueue<CyberChefOperationJobData>(QueueName.CYBERCHEF_OPERATION, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 43200000, // 12 hours
        count: 200,
      },
      removeOnFail: {
        age: 86400000, // 24 hours
        count: 1000,
      },
    },
  });
}

/**
 * IT-Tools Conversion Queue
 * Handles various IT tool conversions and operations
 */
export function createITToolsConversionQueue() {
  return createQueue<ITToolsConversionJobData>(QueueName.IT_TOOLS_CONVERSION, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 43200000, // 12 hours
        count: 300,
      },
      removeOnFail: {
        age: 86400000, // 24 hours
        count: 1500,
      },
    },
  });
}

/**
 * Commander Spellbook Combo Search Queue
 * Handles Magic: The Gathering combo searches
 */
export function createSpellbookComboSearchQueue() {
  return createQueue<SpellbookComboSearchJobData>(QueueName.SPELLBOOK_COMBO_SEARCH, {
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
        age: 172800000, // 2 days
        count: 500,
      },
    },
  });
}
