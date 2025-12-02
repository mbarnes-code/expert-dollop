/**
 * Error thrown when a function is not supported in the Code Node.
 */
import { ApplicationError } from '@expert-dollop/n8n-errors';

/**
 * Error indicating that a specific function is not available in the Code Node.
 */
export class UnsupportedFunctionError extends ApplicationError {
  constructor(functionName: string) {
    super(`The function "${functionName}" is not supported in the Code Node`, {
      level: 'info',
    });
  }
}
