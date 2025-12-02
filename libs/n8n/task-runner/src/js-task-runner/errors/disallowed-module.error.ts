/**
 * Error thrown when a module is not allowed in the sandbox.
 */
import { ApplicationError } from '@expert-dollop/n8n-errors';

/**
 * Error indicating that a module is not in the allowed list.
 */
export class DisallowedModuleError extends ApplicationError {
  constructor(moduleName: string) {
    super(`Module '${moduleName}' is disallowed`);
  }
}
