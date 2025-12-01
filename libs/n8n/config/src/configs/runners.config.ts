import { z } from 'zod';

import { Config, Env } from '../decorators';

const taskRunnerModeSchema = z.enum(['internal', 'external']);
export type TaskRunnerMode = z.infer<typeof taskRunnerModeSchema>;

/**
 * Task runners configuration for code execution
 */
@Config
export class TaskRunnersConfig {
  /** Whether to enable task runners */
  @Env('N8N_RUNNERS_ENABLED')
  enabled: boolean = false;

  /** Mode for task runners: 'internal' or 'external' */
  @Env('N8N_RUNNERS_MODE', taskRunnerModeSchema)
  mode: TaskRunnerMode = 'internal';

  /** Path prefix for task runner endpoints */
  @Env('N8N_RUNNERS_PATH')
  path: string = '/runners';

  /** Authentication token for task runners */
  @Env('N8N_RUNNERS_AUTH_TOKEN')
  authToken: string = '';

  /** Address to listen on for task runner connections */
  @Env('N8N_RUNNERS_LISTEN_ADDRESS')
  listenAddress: string = '127.0.0.1';

  /** Maximum payload size for task runners */
  @Env('N8N_RUNNERS_MAX_PAYLOAD')
  maxPayload: number = 1024 * 1024 * 1024;

  /** Port for task runner connections */
  @Env('N8N_RUNNERS_PORT')
  port: number = 5679;

  /** Max old space size for Node.js task runners */
  @Env('N8N_RUNNERS_MAX_OLD_SPACE_SIZE')
  maxOldSpaceSize: string = '';

  /** Maximum concurrent task executions */
  @Env('N8N_RUNNERS_MAX_CONCURRENCY')
  maxConcurrency: number = 10;

  /** Task execution timeout in seconds */
  @Env('N8N_RUNNERS_TASK_TIMEOUT')
  taskTimeout: number = 300;

  /** Task request timeout in seconds */
  @Env('N8N_RUNNERS_TASK_REQUEST_TIMEOUT')
  taskRequestTimeout: number = 60;

  /** Heartbeat interval in seconds */
  @Env('N8N_RUNNERS_HEARTBEAT_INTERVAL')
  heartbeatInterval: number = 30;

  /** Whether to enable insecure mode (no auth) */
  @Env('N8N_RUNNERS_INSECURE_MODE')
  insecureMode: boolean = false;

  /** Whether native Python runner is enabled */
  @Env('N8N_RUNNERS_NATIVE_PYTHON_ENABLED')
  isNativePythonRunnerEnabled: boolean = false;
}
