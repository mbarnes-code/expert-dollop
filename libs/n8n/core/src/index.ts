/**
 * @fileoverview n8n Core Library
 * @module @expert-dollop/n8n-core
 * 
 * This library provides the core functionality for workflow execution,
 * binary data management, encryption, and node loading in the n8n system.
 * 
 * @example
 * ```typescript
 * import { 
 *   AbstractWorkflowExecutor,
 *   AbstractBinaryDataService,
 *   AbstractEncryptionService,
 * } from '@expert-dollop/n8n-core';
 * ```
 */

// Constants
export * from './constants';

// Interfaces
export * from './interfaces';

// Binary data services
export * from './binary-data';

// Encryption services
export * from './encryption';

// Credentials services
export * from './credentials';

// Instance settings
export * from './instance-settings';

// Nodes loader
export * from './nodes-loader';

// Execution engine
export * from './execution-engine';

// Errors
export * from './errors';

// Utilities
export * from './utils';

// HTTP proxy utilities
export { 
  getProxyFromEnv, 
  shouldBypassProxy, 
  createProxyConfig,
} from './http-proxy';

// HTML sandbox utilities
export {
  ALLOWED_TAGS,
  ALLOWED_ATTRIBUTES,
  sanitizeHtml,
  escapeHtml,
  unescapeHtml,
  stripHtmlTags,
  isSafeUrl,
} from './html-sandbox';
