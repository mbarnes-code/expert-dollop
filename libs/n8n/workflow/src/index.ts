/**
 * @fileoverview n8n Workflow Library
 * @module @expert-dollop/n8n-workflow
 * 
 * This library provides the core workflow interfaces, types, and utilities
 * for the n8n workflow automation system.
 * 
 * @example
 * ```typescript
 * import { 
 *   AbstractWorkflow,
 *   INode,
 *   IConnections,
 *   NodeConnectionTypes,
 * } from '@expert-dollop/n8n-workflow';
 * 
 * class MyWorkflow extends AbstractWorkflow {
 *   // Custom workflow implementation
 * }
 * ```
 */

// Core interfaces and types
export * from './interfaces';

// Common utilities
export * from './common';

// Error classes
export * from './errors';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Deferred promise
export { createDeferredPromise, Deferred } from './deferred-promise';

// Workflow class
export { AbstractWorkflow, type WorkflowParameters } from './workflow';
