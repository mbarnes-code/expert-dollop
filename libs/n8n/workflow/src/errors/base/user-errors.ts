/**
 * @fileoverview User-facing errors that should be shown to end users
 * @module @expert-dollop/n8n-workflow/errors
 */

import { WorkflowError, type WorkflowErrorOptions } from './abstract/workflow-error';

/**
 * User error that should be displayed to end users
 * These are typically user-fixable issues like invalid input or configuration
 */
export class UserError extends WorkflowError {
  readonly level = 'error' as const;
  
  constructor(message: string, options?: WorkflowErrorOptions) {
    super(message, options);
  }
}

/**
 * Workflow activation error
 * Thrown when a workflow fails to activate (e.g., trigger issues)
 */
export class WorkflowActivationError extends UserError {
  readonly node?: string;
  
  constructor(
    message: string, 
    options?: WorkflowErrorOptions & { node?: string }
  ) {
    super(message, options);
    this.node = options?.node;
  }
}

/**
 * Workflow deactivation error
 */
export class WorkflowDeactivationError extends UserError {
  readonly node?: string;
  
  constructor(
    message: string, 
    options?: WorkflowErrorOptions & { node?: string }
  ) {
    super(message, options);
    this.node = options?.node;
  }
}

/**
 * Workflow operation error
 * General error for workflow operations (save, load, etc.)
 */
export class WorkflowOperationError extends UserError {
  readonly workflowId?: string;
  
  constructor(
    message: string, 
    options?: WorkflowErrorOptions & { workflowId?: string }
  ) {
    super(message, options);
    this.workflowId = options?.workflowId;
  }
}

/**
 * Workflow configuration error
 * Thrown when workflow configuration is invalid
 */
export class WorkflowConfigurationError extends UserError {
  readonly property?: string;
  
  constructor(
    message: string, 
    options?: WorkflowErrorOptions & { property?: string }
  ) {
    super(message, options);
    this.property = options?.property;
  }
}
