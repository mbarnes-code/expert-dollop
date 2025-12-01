/**
 * @expert-dollop/n8n-shared
 * 
 * Shared utilities and abstractions for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Re-export from sub-packages
export * from '@expert-dollop/n8n-constants';
export * from '@expert-dollop/n8n-di';
export * from '@expert-dollop/n8n-errors';
export * from '@expert-dollop/n8n-types';

// Abstract base classes
export {
  AbstractWorkflowExecutor,
  type IExecutionOptions,
} from './abstract-workflow-executor';

export {
  AbstractNodeExecutionContext,
} from './abstract-node-execution-context';

export {
  AbstractCredentialService,
  AbstractEncryptionService,
  type ICredentialProperty,
} from './abstract-credential-service';

export {
  AbstractRepository,
  type IFindCriteria,
  type IPaginationOptions,
  type IPaginatedResult,
  createPaginatedResult,
} from './abstract-repository';

// Utilities
export {
  isObjectEmpty,
  deepCopy,
  jsonParse,
  jsonStringify,
  sleep,
  sleepWithAbort,
  randomInt,
  randomString,
  base64DecodeUTF8,
  base64EncodeUTF8,
  removeCircularRefs,
  assert,
  isSafeObjectProperty,
  setSafeObjectProperty,
  fileTypeFromMimeType,
} from './utils';
