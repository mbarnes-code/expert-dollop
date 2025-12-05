/**
 * Response DTO for Elasticsearch cluster health check
 * 
 * @example
 * ```typescript
 * const healthResponse: HealthCheckResponseDto = {
 *   status: 'green',
 *   clusterName: 'production-cluster',
 *   numberOfNodes: 5,
 *   numberOfDataNodes: 3,
 *   activePrimaryShards: 150,
 *   activeShards: 450,
 *   relocatingShards: 0,
 *   initializingShards: 0,
 *   unassignedShards: 0,
 *   numberOfPendingTasks: 0,
 *   numberOfInFlightFetch: 0,
 *   taskMaxWaitingInQueueMillis: 0,
 *   activeShardsPercentAsNumber: 100.0
 * };
 * ```
 */
export interface HealthCheckResponseDto {
  /** Cluster health status */
  status: 'green' | 'yellow' | 'red';
  
  /** Cluster name */
  clusterName: string;
  
  /** Total number of nodes */
  numberOfNodes: number;
  
  /** Number of data nodes */
  numberOfDataNodes: number;
  
  /** Number of active primary shards */
  activePrimaryShards: number;
  
  /** Total number of active shards */
  activeShards: number;
  
  /** Number of shards being relocated */
  relocatingShards: number;
  
  /** Number of shards being initialized */
  initializingShards: number;
  
  /** Number of unassigned shards */
  unassignedShards: number;
  
  /** Number of pending tasks */
  numberOfPendingTasks: number;
  
  /** Number of in-flight fetch operations */
  numberOfInFlightFetch: number;
  
  /** Maximum time a task has been waiting in queue (ms) */
  taskMaxWaitingInQueueMillis: number;
  
  /** Percentage of active shards */
  activeShardsPercentAsNumber: number;
  
  /** Timed out flag */
  timedOut?: boolean;
}
