/**
 * @expert-dollop/n8n-errors
 * 
 * Shared error classes for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Core error types
export {
  ApplicationError,
  type ErrorSeverity,
  type ErrorReportingOptions,
  type ISerializedError,
} from './application.error';

// Base error classes
export { UserError, OperationalError, UnexpectedError } from './base.errors';

// User-facing errors
export {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from './user.errors';

// Operational errors
export {
  WorkflowActivationError,
  WorkflowDeactivationError,
  WorkflowExecutionError,
  ExecutionCancelledError,
  NodeOperationError,
  DatabaseConnectionError,
  ConfigurationError,
} from './operational.errors';
