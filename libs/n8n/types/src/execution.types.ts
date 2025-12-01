/**
 * Execution related types
 */

import type { INodeExecutionData, IDataObject, IWorkflowSettings, IConnection, ExecutionStatus } from './workflow.types';

/**
 * Run execution data
 */
export interface IRunExecutionData {
  startData?: IStartData;
  resultData: IResultData;
  executionData?: IExecutionData;
  waitTill?: Date | null;
}

export interface IStartData {
  destinationNode?: string;
  runNodeFilter?: string[];
}

export interface IResultData {
  runData: IRunData;
  pinData?: { [nodeName: string]: INodeExecutionData[] };
  lastNodeExecuted?: string;
  error?: ExecutionError;
  metadata?: Record<string, unknown>;
}

export interface IRunData {
  [nodeName: string]: ITaskData[];
}

export interface ITaskData {
  startTime: number;
  executionTime: number;
  executionStatus?: ExecutionStatus;
  data?: ITaskDataConnections;
  inputOverride?: ITaskDataConnections;
  error?: ExecutionError;
  source: Array<ISourceData | null>;
  hints?: INodeExecutionHint[];
  metadata?: ITaskMetadata;
}

export interface ITaskDataConnections {
  [connectionType: string]: Array<INodeExecutionData[] | null>;
}

export interface ISourceData {
  previousNode: string;
  previousNodeOutput?: number;
  previousNodeRun?: number;
}

export interface INodeExecutionHint {
  message: string;
  type?: 'info' | 'warning' | 'danger';
  location?: 'outputPane' | 'inputPane' | 'ndv';
}

export interface ITaskMetadata {
  subExecution?: IRelatedExecution;
  parentExecution?: IRelatedExecution;
  subExecutionsCount?: number;
  preserveSourceOverwrite?: boolean;
  nodeWasResumed?: boolean;
}

export interface IRelatedExecution {
  executionId: string;
  workflowId: string;
  shouldResume?: boolean;
}

export interface IExecutionData {
  contextData: IExecuteContextData;
  nodeExecutionStack: IExecuteData[];
  metadata: Record<string, unknown>;
  waitingExecution: IWaitingForExecution;
  waitingExecutionSource: IWaitingForExecutionSource;
}

export interface IExecuteContextData {
  [key: string]: IContextObject;
}

export interface IContextObject {
  [key: string]: unknown;
}

export interface IExecuteData {
  data: ITaskDataConnections;
  metadata?: ITaskMetadata;
  node: { name: string; type: string };
  source: ITaskDataConnectionsSource | null;
  runIndex?: number;
}

export interface ITaskDataConnectionsSource {
  [connectionType: string]: Array<ISourceData | null>;
}

export interface IWaitingForExecution {
  [nodeName: string]: {
    [runIndex: number]: ITaskDataConnections;
  };
}

export interface IWaitingForExecutionSource {
  [nodeName: string]: {
    [runIndex: number]: ITaskDataConnectionsSource;
  };
}

/**
 * Execution error
 */
export interface ExecutionError extends Error {
  node?: { name: string; type: string };
  functionality?: string;
  lineNumber?: number;
  description?: string;
}

/**
 * Execution summary
 */
export interface IExecutionSummary {
  id: string;
  finished?: boolean;
  mode: string;
  retryOf?: string | null;
  retrySuccessId?: string | null;
  waitTill?: Date;
  createdAt: Date;
  startedAt: Date | null;
  stoppedAt?: Date;
  workflowId: string;
  workflowName?: string;
  status: ExecutionStatus;
  lastNodeExecuted?: string;
  executionError?: ExecutionError;
}

/**
 * Workflow execution data process
 */
export interface IWorkflowExecutionDataProcess {
  destinationNode?: { nodeName: string; mode: 'inclusive' | 'exclusive' };
  restartExecutionId?: string;
  executionMode: string;
  executionData?: IRunExecutionData;
  runData?: IRunData;
  pinData?: { [nodeName: string]: INodeExecutionData[] };
  retryOf?: string | null;
  pushRef?: string;
  startNodes?: Array<{ name: string; sourceData: ISourceData | null }>;
  workflowData: {
    id: string;
    name: string;
    nodes: Array<{ id: string; name: string; type: string }>;
    connections: Record<string, unknown>;
    settings?: IWorkflowSettings;
  };
  userId?: string;
  projectId?: string;
}
