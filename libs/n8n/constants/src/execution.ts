/**
 * Execution status values for workflows
 */
export type ExecutionStatus =
  | 'canceled'
  | 'crashed'
  | 'error'
  | 'new'
  | 'running'
  | 'success'
  | 'unknown'
  | 'waiting';

/**
 * Log level constants
 */
export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Code execution modes for Code nodes
 */
export const CODE_EXECUTION_MODES = ['runOnceForAllItems', 'runOnceForEachItem'] as const;
export type CodeExecutionMode = (typeof CODE_EXECUTION_MODES)[number];

/**
 * Code languages supported by Code nodes
 */
export const CODE_LANGUAGES = ['javaScript', 'python'] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];
