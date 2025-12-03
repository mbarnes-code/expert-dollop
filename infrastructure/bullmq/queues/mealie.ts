/**
 * Mealie Queue Configurations
 * Placeholder for Mealie integration
 * 
 * When integrating Mealie from features/mealie:
 * 1. Import this configuration
 * 2. Create workers for recipe import and image processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { MealieRecipeImportJobData, MealieImageProcessingJobData } from '../types';

/**
 * Mealie Recipe Import Queue
 * Handles recipe import from URLs, files, and OCR
 */
export function createMealieRecipeImportQueue() {
  return createQueue<MealieRecipeImportJobData>(QueueName.MEALIE_RECIPE_IMPORT, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 200,
      },
      removeOnFail: {
        age: 259200000, // 3 days
        count: 500,
      },
    },
  });
}

/**
 * Mealie Image Processing Queue
 * Handles recipe image optimization and thumbnails
 */
export function createMealieImageProcessingQueue() {
  return createQueue<MealieImageProcessingJobData>(QueueName.MEALIE_IMAGE_PROCESSING, {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400000, // 24 hours
        count: 300,
      },
      removeOnFail: {
        age: 172800000, // 2 days
        count: 1000,
      },
    },
  });
}
