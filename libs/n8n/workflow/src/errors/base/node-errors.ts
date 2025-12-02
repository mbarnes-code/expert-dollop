/**
 * @fileoverview Node-related errors
 * @module @expert-dollop/n8n-workflow/errors
 */

import { WorkflowError, type WorkflowErrorOptions } from './abstract/workflow-error';
import type { INode, INodeExecutionData } from '../interfaces';

/**
 * Base node error class
 */
export abstract class NodeError extends WorkflowError {
  readonly level = 'error' as const;
  readonly nodeName?: string;
  readonly nodeType?: string;
  readonly nodeId?: string;
  
  constructor(
    message: string, 
    options?: WorkflowErrorOptions & { 
      node?: INode;
      nodeName?: string;
      nodeType?: string;
      nodeId?: string;
    }
  ) {
    super(message, options);
    this.nodeName = options?.node?.name ?? options?.nodeName;
    this.nodeType = options?.node?.type ?? options?.nodeType;
    this.nodeId = options?.node?.id ?? options?.nodeId;
  }
}

/**
 * Node operation error
 * Thrown when a node operation fails during execution
 */
export class NodeOperationError extends NodeError {
  readonly itemIndex?: number;
  readonly runIndex?: number;
  
  constructor(
    node: INode | undefined,
    message: string | Error,
    options?: WorkflowErrorOptions & {
      itemIndex?: number;
      runIndex?: number;
    }
  ) {
    const errorMessage = message instanceof Error ? message.message : message;
    super(errorMessage, { 
      ...options, 
      node,
      cause: message instanceof Error ? message : options?.cause,
    });
    this.itemIndex = options?.itemIndex;
    this.runIndex = options?.runIndex;
  }
}

/**
 * Node API error
 * Thrown when a node fails to communicate with an external API
 */
export class NodeApiError extends NodeError {
  readonly httpCode?: number;
  readonly description?: string;
  readonly responseBody?: unknown;
  
  constructor(
    node: INode | undefined,
    error: Error | object,
    options?: WorkflowErrorOptions & {
      httpCode?: number;
      responseBody?: unknown;
    }
  ) {
    const message = error instanceof Error ? error.message : 'API Error';
    super(message, { 
      ...options, 
      node,
      cause: error instanceof Error ? error : undefined,
    });
    this.httpCode = options?.httpCode;
    this.responseBody = options?.responseBody;
  }
}

/**
 * Node SSL error
 * Thrown when there's an SSL/TLS error communicating with a service
 */
export class NodeSSLError extends NodeError {
  constructor(node: INode | undefined, options?: WorkflowErrorOptions) {
    super('SSL Certificate Error', { ...options, node });
  }
}
