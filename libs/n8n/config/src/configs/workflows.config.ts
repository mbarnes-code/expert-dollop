import { Config, Env } from '../decorators';

/**
 * Workflows configuration
 */
@Config
export class WorkflowsConfig {
  /** Default name for new workflows */
  @Env('WORKFLOWS_DEFAULT_NAME')
  defaultName: string = 'My workflow';

  /** Default caller policy for sub-workflows */
  @Env('N8N_CALLER_POLICY_DEFAULT_OPTION')
  callerPolicyDefaultOption: 'any' | 'none' | 'workflowsFromSameOwner' | 'workflowsFromAList' = 'workflowsFromSameOwner';

  /** Batch size for workflow activation */
  @Env('N8N_ACTIVATION_BATCH_SIZE')
  activationBatchSize: number = 1;

  /** Whether workflow indexing is enabled */
  @Env('N8N_WORKFLOW_INDEXING_ENABLED')
  indexingEnabled: boolean = false;

  /** Whether draft publish feature is enabled */
  @Env('N8N_WORKFLOW_DRAFT_PUBLISH_ENABLED')
  draftPublishEnabled: boolean = false;
}
