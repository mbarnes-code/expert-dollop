/**
 * @expert-dollop/n8n-nodes-base
 *
 * Core node abstractions and utilities for n8n workflow automation.
 * Provides abstract base classes, common utilities, and shared types for building nodes.
 */

// Abstract Node Classes
export * from './nodes/abstract-nodes';

// Common Utilities
export * from './utils/array-utils';
export * from './utils/object-utils';
export * from './utils/string-utils';
export * from './utils/workflow-utils';
export * from './utils/binary-utils';
export * from './utils/connection-pool-manager';

// Common Types and Interfaces
export * from './common/types';
export * from './common/descriptions';

// Credential Abstractions
export * from './credentials/abstract-credentials';

// HTTP Utilities
export * from './http';

// Execution Helpers
export * from './execution';
