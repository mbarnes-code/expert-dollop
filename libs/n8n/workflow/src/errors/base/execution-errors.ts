/**
 * @fileoverview Execution-related errors
 * @module @expert-dollop/n8n-workflow/errors
 */

import { WorkflowError, type WorkflowErrorOptions } from './abstract/workflow-error';

/**
 * Execution cancelled error
 * Thrown when an execution is manually cancelled
 */
export class ExecutionCancelledError extends WorkflowError {
  readonly level = 'warning' as const;
  readonly executionId?: string;
  
  constructor(
    options?: WorkflowErrorOptions & { executionId?: string }
  ) {
    super('Execution was cancelled', options);
    this.executionId = options?.executionId;
  }
}

/**
 * Trigger close error
 * Thrown when a trigger needs to close
 */
export class TriggerCloseError extends WorkflowError {
  readonly level = 'warning' as const;
  
  constructor(message: string, options?: WorkflowErrorOptions) {
    super(message, options);
  }
}

/**
 * Webhook taken error
 * Thrown when trying to register a webhook that already exists
 */
export class WebhookTakenError extends WorkflowError {
  readonly level = 'error' as const;
  readonly webhookPath?: string;
  
  constructor(
    webhookPath: string,
    options?: WorkflowErrorOptions
  ) {
    super(`Webhook path "${webhookPath}" is already in use`, options);
    this.webhookPath = webhookPath;
  }
}

/**
 * Subworkflow operation error
 * Thrown when a subworkflow operation fails
 */
export class SubworkflowOperationError extends WorkflowError {
  readonly level = 'error' as const;
  readonly subworkflowId?: string;
  
  constructor(
    message: string,
    options?: WorkflowErrorOptions & { subworkflowId?: string }
  ) {
    super(message, options);
    this.subworkflowId = options?.subworkflowId;
  }
}

/**
 * CLI subworkflow operation error
 * Thrown when a CLI-initiated subworkflow operation fails
 */
export class CliSubworkflowOperationError extends SubworkflowOperationError {
  constructor(
    message: string,
    options?: WorkflowErrorOptions & { subworkflowId?: string }
  ) {
    super(message, options);
  }
}

/**
 * Database connection timeout error
 */
export class DbConnectionTimeoutError extends WorkflowError {
  readonly level = 'error' as const;
  
  constructor(options?: WorkflowErrorOptions) {
    super('Database connection timed out', options);
  }
}
