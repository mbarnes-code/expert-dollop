/**
 * @fileoverview Expression-related errors
 * @module @expert-dollop/n8n-workflow/errors
 */

import { WorkflowError, type WorkflowErrorOptions } from './abstract/workflow-error';

/**
 * Expression error
 * Thrown when an expression fails to evaluate
 */
export class ExpressionError extends WorkflowError {
  readonly level = 'error' as const;
  readonly context?: {
    nodeName?: string;
    nodeType?: string;
    itemIndex?: number;
    runIndex?: number;
    parameter?: string;
    expression?: string;
  };
  
  constructor(
    message: string,
    options?: WorkflowErrorOptions & {
      context?: {
        nodeName?: string;
        nodeType?: string;
        itemIndex?: number;
        runIndex?: number;
        parameter?: string;
        expression?: string;
      };
    }
  ) {
    super(message, options);
    this.context = options?.context;
  }
}

/**
 * Expression extension error
 * Thrown when an expression extension method fails
 */
export class ExpressionExtensionError extends ExpressionError {
  readonly extensionName?: string;
  readonly methodName?: string;
  
  constructor(
    message: string,
    options?: WorkflowErrorOptions & {
      extensionName?: string;
      methodName?: string;
      context?: {
        nodeName?: string;
        nodeType?: string;
        itemIndex?: number;
        runIndex?: number;
        parameter?: string;
        expression?: string;
      };
    }
  ) {
    super(message, options);
    this.extensionName = options?.extensionName;
    this.methodName = options?.methodName;
  }
}
