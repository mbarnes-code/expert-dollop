/**
 * @fileoverview Core constants
 * @module @expert-dollop/n8n-core
 */

/**
 * Binary data modes
 */
export const BINARY_DATA_MODES = ['default', 'filesystem', 's3'] as const;
export type BinaryDataMode = (typeof BINARY_DATA_MODES)[number];

/**
 * Maximum file upload size (16MB)
 */
export const MAX_UPLOAD_SIZE = 16 * 1024 * 1024;

/**
 * File extensions considered safe for storage
 */
export const SAFE_FILE_EXTENSIONS = [
  '.txt', '.json', '.xml', '.csv', '.pdf',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.mp3', '.mp4', '.wav', '.webm',
  '.zip', '.tar', '.gz',
] as const;

/**
 * Content types for binary data
 */
export const BINARY_CONTENT_TYPES = {
  json: 'application/json',
  xml: 'application/xml',
  pdf: 'application/pdf',
  text: 'text/plain',
  html: 'text/html',
  csv: 'text/csv',
} as const;

/**
 * Default encoding for text operations
 */
export const DEFAULT_TEXT_ENCODING = 'utf-8';

/**
 * Maximum number of concurrent executions per workflow
 */
export const MAX_CONCURRENT_EXECUTIONS = 100;

/**
 * Default execution timeout in milliseconds (5 minutes)
 */
export const DEFAULT_EXECUTION_TIMEOUT = 300_000;

/**
 * Maximum items to process in a single batch
 */
export const MAX_BATCH_SIZE = 1000;

/**
 * Node execution timeout (5 minutes)
 */
export const NODE_EXECUTION_TIMEOUT = 300_000;

/**
 * HTTP request timeout (5 minutes)
 */
export const HTTP_REQUEST_TIMEOUT = 300_000;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
} as const;
