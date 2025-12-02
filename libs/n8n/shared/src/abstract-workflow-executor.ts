import type {
  IWorkflowBase,
  INode,
  INodeExecutionData,
  IDataObject,
  IRunExecutionData,
  ITaskData,
  ExecutionStatus,
  WorkflowExecuteMode,
} from '@expert-dollop/n8n-types';

/**
 * Abstract base class for workflow execution services.
 * Provides common functionality for workflow execution across different modules.
 * 
 * Following DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractWorkflowExecutor {
  protected readonly workflowId: string;
  protected executionId?: string;
  protected status: ExecutionStatus = 'new';

  constructor(workflowId: string) {
    this.workflowId = workflowId;
  }

  /**
   * Get the current execution status
   */
  getStatus(): ExecutionStatus {
    return this.status;
  }

  /**
   * Get the execution ID
   */
  getExecutionId(): string | undefined {
    return this.executionId;
  }

  /**
   * Initialize the execution
   */
  protected abstract initialize(workflow: IWorkflowBase): Promise<void>;

  /**
   * Execute a single node
   */
  protected abstract executeNode(
    node: INode,
    inputData: INodeExecutionData[],
    runIndex: number,
  ): Promise<ITaskData>;

  /**
   * Finalize the execution
   */
  protected abstract finalize(runData: IRunExecutionData): Promise<void>;

  /**
   * Cancel the execution
   */
  abstract cancel(reason?: string): Promise<void>;

  /**
   * Start workflow execution
   */
  abstract execute(workflow: IWorkflowBase, options?: IExecutionOptions): Promise<IRunExecutionData>;

  /**
   * Update execution status
   */
  protected updateStatus(status: ExecutionStatus): void {
    this.status = status;
  }

  /**
   * Generate a new execution ID
   */
  protected generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Execution options interface
 */
export interface IExecutionOptions {
  mode?: WorkflowExecuteMode;
  startNodes?: string[];
  destinationNode?: string;
  runData?: { [nodeName: string]: ITaskData[] };
  pinData?: { [nodeName: string]: INodeExecutionData[] };
}
