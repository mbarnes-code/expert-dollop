import { OperationalError, UnexpectedError } from './base.errors';

/**
 * Workflow activation error - thrown when a workflow cannot be activated
 */
export class WorkflowActivationError extends OperationalError {
  readonly workflowId: string;

  constructor(
    workflowId: string,
    message: string = 'Failed to activate workflow',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, {
      ...options,
      context: { ...options?.context, workflowId },
    });
    this.workflowId = workflowId;
  }

  getUserMessage(): string {
    return 'Failed to activate the workflow. Please check the workflow configuration.';
  }
}

/**
 * Workflow deactivation error - thrown when a workflow cannot be deactivated
 */
export class WorkflowDeactivationError extends OperationalError {
  readonly workflowId: string;

  constructor(
    workflowId: string,
    message: string = 'Failed to deactivate workflow',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, {
      ...options,
      context: { ...options?.context, workflowId },
    });
    this.workflowId = workflowId;
  }
}

/**
 * Workflow execution error - thrown during workflow execution
 */
export class WorkflowExecutionError extends OperationalError {
  readonly workflowId: string;
  readonly executionId?: string;
  readonly nodeName?: string;

  constructor(
    workflowId: string,
    message: string,
    options?: {
      cause?: Error;
      executionId?: string;
      nodeName?: string;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, {
      cause: options?.cause,
      context: {
        ...options?.context,
        workflowId,
        executionId: options?.executionId,
        nodeName: options?.nodeName,
      },
    });
    this.workflowId = workflowId;
    this.executionId = options?.executionId;
    this.nodeName = options?.nodeName;
  }
}

/**
 * Execution cancelled error - thrown when an execution is cancelled
 */
export class ExecutionCancelledError extends OperationalError {
  readonly executionId: string;
  readonly reason: 'manual' | 'timeout' | 'shutdown';

  constructor(
    executionId: string,
    reason: 'manual' | 'timeout' | 'shutdown' = 'manual',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    const message = `Execution ${executionId} was cancelled: ${reason}`;
    super(message, {
      ...options,
      context: { ...options?.context, executionId, reason },
    });
    this.executionId = executionId;
    this.reason = reason;
  }

  getUserMessage(): string {
    switch (this.reason) {
      case 'timeout':
        return 'The workflow execution timed out.';
      case 'shutdown':
        return 'The workflow execution was stopped due to system shutdown.';
      default:
        return 'The workflow execution was cancelled.';
    }
  }
}

/**
 * Node operation error - thrown when a node operation fails
 */
export class NodeOperationError extends OperationalError {
  readonly nodeName: string;
  readonly nodeType: string;

  constructor(
    nodeName: string,
    nodeType: string,
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, {
      ...options,
      context: { ...options?.context, nodeName, nodeType },
    });
    this.nodeName = nodeName;
    this.nodeType = nodeType;
  }
}

/**
 * Database connection error - thrown when database connection fails
 */
export class DatabaseConnectionError extends UnexpectedError {
  constructor(
    message: string = 'Failed to connect to database',
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options);
  }
}

/**
 * Configuration error - thrown when there's a configuration problem
 */
export class ConfigurationError extends UnexpectedError {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message, options);
  }
}
