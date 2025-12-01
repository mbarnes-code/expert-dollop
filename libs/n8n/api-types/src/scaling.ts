/**
 * Scaling types for worker status and job management.
 */

/** Execution status type */
export type ExecutionStatus =
  | 'canceled'
  | 'crashed'
  | 'error'
  | 'new'
  | 'running'
  | 'success'
  | 'unknown'
  | 'waiting';

/** Workflow execution mode */
export type WorkflowExecuteMode =
  | 'cli'
  | 'error'
  | 'integrated'
  | 'internal'
  | 'manual'
  | 'retry'
  | 'trigger'
  | 'webhook';

export interface RunningJobSummary {
  executionId: string;
  workflowId: string;
  workflowName: string;
  mode: WorkflowExecuteMode;
  startedAt: Date;
  retryOf?: string;
  status: ExecutionStatus;
}

export interface WorkerStatus {
  senderId: string;
  runningJobsSummary: RunningJobSummary[];
  freeMem: number;
  totalMem: number;
  uptime: number;
  loadAvg: number[];
  cpus: string;
  arch: string;
  platform: NodeJS.Platform;
  hostname: string;
  interfaces: Array<{
    family: 'IPv4' | 'IPv6';
    address: string;
    internal: boolean;
  }>;
  version: string;
}
