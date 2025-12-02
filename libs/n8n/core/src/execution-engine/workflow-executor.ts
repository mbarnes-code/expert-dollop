/**
 * @fileoverview Workflow executor abstraction
 * @module @expert-dollop/n8n-core/execution-engine
 */

import type {
  IDataObject,
  INode,
  INodeExecutionData,
  IWorkflowBase,
  WorkflowExecuteMode,
  ExecutionStatus,
  IRunExecutionData,
  ITaskData,
  ITaskDataConnections,
} from '@expert-dollop/n8n-workflow';
import type {
  IWorkflowExecutor,
  IExecutionOptions,
  IExecutionResult,
  IExecutionContext,
} from '../interfaces';
import { nanoid } from 'nanoid';

/**
 * Abstract workflow executor providing a base implementation
 * for workflow execution
 */
export abstract class AbstractWorkflowExecutor implements IWorkflowExecutor {
  protected readonly executions = new Map<string, IActiveExecution>();
  
  /**
   * Executes a workflow
   */
  async execute(
    workflow: IWorkflowBase,
    mode: WorkflowExecuteMode,
    options?: IExecutionOptions,
  ): Promise<IExecutionResult> {
    const executionId = this.generateExecutionId();
    const startedAt = new Date();
    
    // Create execution context
    const context = this.createExecutionContext(executionId, workflow, mode);
    
    // Store active execution
    const activeExecution: IActiveExecution = {
      id: executionId,
      workflow,
      mode,
      status: 'running',
      startedAt,
      context,
      abortController: new AbortController(),
    };
    this.executions.set(executionId, activeExecution);
    
    try {
      // Execute the workflow
      const data = await this.executeWorkflow(context, workflow, options);
      
      // Update execution status
      activeExecution.status = 'success';
      activeExecution.stoppedAt = new Date();
      
      return {
        executionId,
        status: 'success',
        data,
        startedAt,
        stoppedAt: activeExecution.stoppedAt,
      };
    } catch (error) {
      // Update execution status
      activeExecution.status = 'error';
      activeExecution.stoppedAt = new Date();
      
      return {
        executionId,
        status: 'error',
        data: this.createEmptyRunData(),
        startedAt,
        stoppedAt: activeExecution.stoppedAt,
        error: error as Error,
      };
    } finally {
      // Cleanup execution
      this.executions.delete(executionId);
    }
  }
  
  /**
   * Cancels a running execution
   */
  async cancel(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.abortController.abort();
      execution.status = 'canceled';
      execution.stoppedAt = new Date();
    }
  }
  
  /**
   * Gets the status of an execution
   */
  getStatus(executionId: string): ExecutionStatus | undefined {
    return this.executions.get(executionId)?.status;
  }
  
  /**
   * Executes the workflow - to be implemented by subclasses
   */
  protected abstract executeWorkflow(
    context: IExecutionContext,
    workflow: IWorkflowBase,
    options?: IExecutionOptions,
  ): Promise<IRunExecutionData>;
  
  /**
   * Creates an execution context
   */
  protected abstract createExecutionContext(
    executionId: string,
    workflow: IWorkflowBase,
    mode: WorkflowExecuteMode,
  ): IExecutionContext;
  
  /**
   * Generates a unique execution ID
   */
  protected generateExecutionId(): string {
    return `exec_${nanoid(16)}`;
  }
  
  /**
   * Creates empty run data
   */
  protected createEmptyRunData(): IRunExecutionData {
    return {
      resultData: {
        runData: {},
      },
    };
  }
}

/**
 * Active execution tracking
 */
interface IActiveExecution {
  id: string;
  workflow: IWorkflowBase;
  mode: WorkflowExecuteMode;
  status: ExecutionStatus;
  startedAt: Date;
  stoppedAt?: Date;
  context: IExecutionContext;
  abortController: AbortController;
}

/**
 * Simple workflow executor for testing
 */
export class SimpleWorkflowExecutor extends AbstractWorkflowExecutor {
  protected async executeWorkflow(
    context: IExecutionContext,
    workflow: IWorkflowBase,
    options?: IExecutionOptions,
  ): Promise<IRunExecutionData> {
    // Simple execution - just mark nodes as executed
    const runData: IRunExecutionData = {
      resultData: {
        runData: {},
      },
    };
    
    for (const node of workflow.nodes) {
      if (node.disabled) continue;
      
      const taskData: ITaskData = {
        startTime: Date.now(),
        executionIndex: 0,
        executionTime: 0,
        executionStatus: 'success',
        source: [],
        data: {
          main: [[{ json: {} }]],
        },
      };
      
      runData.resultData.runData[node.name] = [taskData];
    }
    
    return runData;
  }
  
  protected createExecutionContext(
    executionId: string,
    workflow: IWorkflowBase,
    mode: WorkflowExecuteMode,
  ): IExecutionContext {
    const abortController = new AbortController();
    let status: ExecutionStatus = 'running';
    
    return {
      workflowId: workflow.id,
      executionId,
      mode,
      startedAt: new Date(),
      
      log(level: string, message: string, metadata?: IDataObject): void {
        console[level as 'log' | 'info' | 'warn' | 'error']?.(message, metadata);
      },
      
      getStatus(): ExecutionStatus {
        return status;
      },
      
      setStatus(newStatus: ExecutionStatus): void {
        status = newStatus;
      },
      
      isCancelled(): boolean {
        return abortController.signal.aborted;
      },
      
      getAbortSignal(): AbortSignal {
        return abortController.signal;
      },
    };
  }
}
