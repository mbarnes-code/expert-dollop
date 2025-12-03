/**
 * Execution Factory for creating test execution records
 * Used across cross-module integration tests
 */

import { generateNanoId } from '@expert-dollop/n8n-db';

export type ExecutionStatus = 'new' | 'running' | 'success' | 'error' | 'waiting' | 'canceled';

export interface IExecutionResponse {
  id?: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'internal';
  status: ExecutionStatus;
  startedAt?: Date;
  stoppedAt?: Date;
  finished?: boolean;
  data?: any;
  error?: string;
}

export class ExecutionFactory {
  /**
   * Create a basic test execution
   */
  static create(overrides?: Partial<IExecutionResponse>): IExecutionResponse {
    const id = overrides?.id || generateNanoId();
    return {
      id,
      workflowId: overrides?.workflowId || generateNanoId(),
      mode: overrides?.mode || 'manual',
      status: overrides?.status || 'new',
      startedAt: overrides?.startedAt || new Date(),
      stoppedAt: overrides?.stoppedAt,
      finished: overrides?.finished ?? false,
      data: overrides?.data || {},
      error: overrides?.error
    };
  }

  /**
   * Create a successful execution
   */
  static createSuccess(workflowId: string, overrides?: Partial<IExecutionResponse>): IExecutionResponse {
    return this.create({
      ...overrides,
      workflowId,
      status: 'success',
      finished: true,
      stoppedAt: new Date()
    });
  }

  /**
   * Create a failed execution
   */
  static createError(workflowId: string, error: string, overrides?: Partial<IExecutionResponse>): IExecutionResponse {
    return this.create({
      ...overrides,
      workflowId,
      status: 'error',
      finished: true,
      stoppedAt: new Date(),
      error
    });
  }

  /**
   * Create a running execution
   */
  static createRunning(workflowId: string, overrides?: Partial<IExecutionResponse>): IExecutionResponse {
    return this.create({
      ...overrides,
      workflowId,
      status: 'running',
      finished: false
    });
  }
}
