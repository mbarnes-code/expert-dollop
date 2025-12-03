#!/usr/bin/env node
/**
 * Spellbook Background Worker
 * Processes BullMQ jobs for combo searches, card analysis, and deck optimization
 * 
 * Usage: tsx scripts/worker.ts
 * Or in package.json: "worker": "tsx scripts/worker.ts"
 */

import { initializeSpellbookWorkers } from '../src/lib/queue.service';
import { closeAllWorkers, closeBullMQRedisConnection } from '../../../../infrastructure/bullmq';

console.log('[Spellbook Worker] Starting background workers...');

// Initialize all workers
const workers = initializeSpellbookWorkers();

console.log('[Spellbook Worker] Workers initialized:', {
  comboSearch: 'active',
  cardAnalysis: 'active',
  deckOptimization: 'active',
});

// Graceful shutdown
const shutdown = async () => {
  console.log('[Spellbook Worker] Shutting down gracefully...');
  
  try {
    await closeAllWorkers();
    await closeBullMQRedisConnection();
    console.log('[Spellbook Worker] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[Spellbook Worker] Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('[Spellbook Worker] Uncaught exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Spellbook Worker] Unhandled rejection at:', promise, 'reason:', reason);
});

console.log('[Spellbook Worker] Press Ctrl+C to stop');
