/**
 * @expert-dollop/n8n-utils
 * 
 * Utility functions for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Core utilities
export { assert } from './assert';
export { createEventBus } from './event-bus';
export type { EventBus, CallbackFn } from './event-bus';
export { createEventQueue } from './event-queue';
export { retry } from './retry';

// Number utilities
export { smartDecimal } from './number/smartDecimal';

// String utilities
export { truncate, truncateBeforeLast } from './string/truncate';

// Sort utilities
export { sortByProperty } from './sort/sortByProperty';

// Search utilities
export { sublimeSearch, DEFAULT_KEYS } from './search/sublimeSearch';
export { reRankSearchResults } from './search/reRankSearchResults';

// File utilities
export { sanitizeFilename } from './files/sanitize';
