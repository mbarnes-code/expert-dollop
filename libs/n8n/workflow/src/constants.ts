/**
 * @fileoverview Workflow constants
 * @module @expert-dollop/n8n-workflow
 */

/**
 * Node types that can start a workflow execution
 */
export const STARTING_NODE_TYPES = [
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.start',
  '@n8n/n8n-nodes-langchain.manualChatTrigger',
];

/**
 * Manual chat trigger node type for LangChain
 */
export const MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.manualChatTrigger';

/**
 * Node types with renamable content (expressions in code)
 */
export const NODES_WITH_RENAMABLE_CONTENT = new Set([
  'n8n-nodes-base.code',
  'n8n-nodes-base.function',
  'n8n-nodes-base.functionItem',
]);

/**
 * Node types with renamable top-level HTML content
 */
export const NODES_WITH_RENAMEABLE_TOPLEVEL_HTML_CONTENT = new Set([
  'n8n-nodes-base.html',
]);

/**
 * Node types with renamable form HTML content
 */
export const NODES_WITH_RENAMABLE_FORM_HTML_CONTENT = new Set([
  'n8n-nodes-base.form',
  'n8n-nodes-base.formTrigger',
  '@n8n/n8n-nodes-langchain.formTrigger',
]);

/**
 * HTTP request methods
 */
export const HTTP_REQUEST_METHODS = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'] as const;

/**
 * Default timeout for workflow execution in milliseconds
 */
export const DEFAULT_EXECUTION_TIMEOUT_MS = 300_000; // 5 minutes

/**
 * Default retry count for failed operations
 */
export const DEFAULT_RETRY_COUNT = 3;

/**
 * Default wait time between retries in milliseconds
 */
export const DEFAULT_RETRY_WAIT_MS = 1000;

/**
 * Binary data mime types that are considered safe for preview
 */
export const SAFE_MIME_TYPES_FOR_PREVIEW = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'application/json',
]);

/**
 * Maximum size for inline binary data (10MB)
 */
export const MAX_INLINE_BINARY_SIZE = 10 * 1024 * 1024;
