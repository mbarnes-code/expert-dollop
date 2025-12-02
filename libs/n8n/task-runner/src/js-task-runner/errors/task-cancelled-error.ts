/**
 * Error thrown when a task is cancelled.
 */
import { ApplicationError } from '@expert-dollop/n8n-errors';

/**
 * Error indicating that a task was cancelled before completion.
 */
export class TaskCancelledError extends ApplicationError {
  constructor(reason: string) {
    super(`Task cancelled: ${reason}`, { level: 'warning' });
  }
}
