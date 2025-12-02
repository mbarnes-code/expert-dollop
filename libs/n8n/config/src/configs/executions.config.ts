import { Config, Env, Nested } from '../decorators';

@Config
class ExecutionConcurrencyConfig {
  /** Limit on production workflow executions. -1 for unlimited. */
  @Env('N8N_CONCURRENCY_PRODUCTION_LIMIT')
  productionLimit: number = -1;

  /** Limit on evaluation workflow executions. -1 for unlimited. */
  @Env('N8N_CONCURRENCY_EVALUATION_LIMIT')
  evaluationLimit: number = -1;
}

@Config
class ExecutionQueueRecoveryConfig {
  /** Interval in seconds for queue recovery check */
  @Env('N8N_EXECUTION_QUEUE_RECOVERY_INTERVAL')
  interval: number = 180;

  /** Batch size for queue recovery */
  @Env('N8N_EXECUTION_QUEUE_RECOVERY_BATCH_SIZE')
  batchSize: number = 100;
}

@Config
class ExecutionPruneIntervalsConfig {
  /** Hard delete interval in minutes */
  hardDelete: number = 15;

  /** Soft delete interval in minutes */
  softDelete: number = 60;
}

/**
 * Executions configuration
 */
@Config
export class ExecutionsConfig {
  /** Execution mode: 'regular' or 'queue' */
  @Env('EXECUTIONS_MODE')
  mode: 'regular' | 'queue' = 'regular';

  /** Execution timeout in seconds. -1 for no timeout. */
  @Env('EXECUTIONS_TIMEOUT')
  timeout: number = -1;

  /** Maximum execution timeout in seconds */
  @Env('EXECUTIONS_TIMEOUT_MAX')
  maxTimeout: number = 3600;

  /** Whether to prune execution data */
  @Env('EXECUTIONS_DATA_PRUNE')
  pruneData: boolean = true;

  /** Maximum age in hours for pruned execution data */
  @Env('EXECUTIONS_DATA_MAX_AGE')
  pruneDataMaxAge: number = 336;

  /** Maximum count of executions to keep */
  @Env('EXECUTIONS_DATA_PRUNE_MAX_COUNT')
  pruneDataMaxCount: number = 10_000;

  /** Buffer for hard delete in hours */
  @Env('EXECUTIONS_DATA_HARD_DELETE_BUFFER')
  pruneDataHardDeleteBuffer: number = 1;

  @Nested
  pruneDataIntervals: ExecutionPruneIntervalsConfig;

  @Nested
  concurrency: ExecutionConcurrencyConfig;

  @Nested
  queueRecovery: ExecutionQueueRecoveryConfig;

  /** Save data on error: 'all', 'none', or 'default' */
  @Env('EXECUTIONS_DATA_SAVE_ON_ERROR')
  saveDataOnError: 'all' | 'none' | 'default' = 'all';

  /** Save data on success: 'all', 'none', or 'default' */
  @Env('EXECUTIONS_DATA_SAVE_ON_SUCCESS')
  saveDataOnSuccess: 'all' | 'none' | 'default' = 'all';

  /** Save execution progress */
  @Env('EXECUTIONS_DATA_SAVE_ON_PROGRESS')
  saveExecutionProgress: boolean = false;

  /** Save manual execution data */
  @Env('EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS')
  saveDataManualExecutions: boolean = true;
}
