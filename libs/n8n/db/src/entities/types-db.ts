import { z } from 'zod';
import type { Scope } from '@expert-dollop/n8n-permissions';

/**
 * Usage count mixin for entities
 */
export type UsageCount = {
  usageCount: number;
};

/**
 * Base tag interface
 */
export interface ITagBase {
  id: string;
  name: string;
}

/**
 * Base credentials interface
 */
export interface ICredentialsBase {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Execution status values
 */
export type ExecutionStatus =
  | 'canceled'
  | 'crashed'
  | 'error'
  | 'new'
  | 'running'
  | 'success'
  | 'unknown'
  | 'waiting';

/**
 * Workflow execute mode values
 */
export type WorkflowExecuteMode =
  | 'cli'
  | 'error'
  | 'integrated'
  | 'internal'
  | 'manual'
  | 'retry'
  | 'trigger'
  | 'webhook';

/**
 * Base execution interface
 */
export interface IExecutionBase {
  id: string;
  mode: WorkflowExecuteMode;
  createdAt: Date;
  startedAt: Date;
  stoppedAt?: Date;
  workflowId: string;
  /** @deprecated Use `status` instead */
  finished: boolean;
  retryOf?: string;
  retrySuccessId?: string;
  status: ExecutionStatus;
  waitTill?: Date | null;
}

/**
 * Personalization survey answers
 */
export interface IPersonalizationSurveyAnswers {
  email: string | null;
  codingSkill: string | null;
  companyIndustry: string[];
  companySize: string | null;
  otherCompanyIndustry: string | null;
  otherWorkArea: string | null;
  workArea: string[] | string | null;
}

/**
 * Slim project representation
 */
export interface SlimProject {
  id: string;
  type: string;
  name: string;
  icon?: string | null;
}

/**
 * Slim user representation
 */
export interface SlimUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Scopes field mixin
 */
export type ScopesField = { scopes: Scope[] };

/**
 * Statistics name enumeration
 */
export const enum StatisticsNames {
  productionSuccess = 'production_success',
  productionError = 'production_error',
  manualSuccess = 'manual_success',
  manualError = 'manual_error',
  dataLoaded = 'data_loaded',
}

/**
 * Authentication provider types
 */
const ALL_AUTH_PROVIDERS = z.enum(['ldap', 'email', 'saml', 'oidc']);
export type AuthProviderType = z.infer<typeof ALL_AUTH_PROVIDERS>;

/**
 * Check if a value is a valid auth provider type
 */
export function isAuthProviderType(value: string): value is AuthProviderType {
  return ALL_AUTH_PROVIDERS.safeParse(value).success;
}

/**
 * Test run final result
 */
export type TestRunFinalResult = 'success' | 'error' | 'warning';

/**
 * Test run error codes
 */
export type TestRunErrorCode =
  | 'TEST_CASES_NOT_FOUND'
  | 'INTERRUPTED'
  | 'UNKNOWN_ERROR'
  | 'EVALUATION_TRIGGER_NOT_FOUND'
  | 'EVALUATION_TRIGGER_NOT_CONFIGURED'
  | 'EVALUATION_TRIGGER_DISABLED'
  | 'SET_OUTPUTS_NODE_NOT_CONFIGURED'
  | 'SET_METRICS_NODE_NOT_FOUND'
  | 'SET_METRICS_NODE_NOT_CONFIGURED'
  | 'CANT_FETCH_TEST_CASES';

/**
 * Test case execution error codes
 */
export type TestCaseExecutionErrorCode =
  | 'NO_METRICS_COLLECTED'
  | 'MOCKED_NODE_NOT_FOUND'
  | 'FAILED_TO_EXECUTE_WORKFLOW'
  | 'INVALID_METRICS'
  | 'UNKNOWN_ERROR';

/**
 * Aggregated test run metrics
 */
export type AggregatedTestRunMetrics = Record<string, number | boolean>;

/**
 * Mocked node item for test execution
 */
export type MockedNodeItem = {
  name?: string;
  id: string;
};

/**
 * Running mode for test execution
 */
export type RunningMode = 'dry' | 'live';

/**
 * Sync status
 */
export type SyncStatus = 'success' | 'error';

/**
 * Resource type
 */
export type ResourceType = 'folder' | 'workflow';

/**
 * List query options (for repository operations)
 */
export namespace ListQuery {
  export type Options = {
    filter?: Record<string, unknown>;
    select?: Record<string, true>;
    skip?: number;
    take?: number;
    sortBy?: string;
  };
}

/**
 * Execution query filter interface
 */
export interface IGetExecutionsQueryFilter {
  id?: string;
  finished?: boolean;
  mode?: string;
  retryOf?: string;
  retrySuccessId?: string;
  status?: ExecutionStatus[];
  workflowId?: string;
  waitTill?: boolean;
  metadata?: Array<{ key: string; value: string; exactMatch?: boolean }>;
  startedAfter?: string;
  startedBefore?: string;
}

/**
 * Authentication information
 */
export type AuthenticationInformation = {
  usedMfa: boolean;
};

/**
 * Annotation vote type
 */
export type AnnotationVote = 'up' | 'down';

/**
 * Execution summaries namespace
 */
export namespace ExecutionSummaries {
  export type Query = RangeQuery | CountQuery;

  export type RangeQuery = { kind: 'range' } & FilterFields &
    AccessFields &
    RangeFields &
    OrderFields;

  export type CountQuery = { kind: 'count' } & FilterFields & AccessFields;

  type FilterFields = Partial<{
    id: string;
    finished: boolean;
    mode: string;
    retryOf: string;
    retrySuccessId: string;
    status: ExecutionStatus[];
    workflowId: string;
    waitTill: boolean;
    metadata: Array<{ key: string; value: string; exactMatch?: boolean }>;
    startedAfter: string;
    startedBefore: string;
    annotationTags: string[];
    vote: AnnotationVote;
    projectId: string;
  }>;

  type AccessFields = {
    accessibleWorkflowIds?: string[];
  };

  type RangeFields = {
    range: {
      limit: number;
      firstId?: string;
      lastId?: string;
    };
  };

  type OrderFields = {
    order?: {
      top?: ExecutionStatus;
      startedAt?: 'DESC';
    };
  };
}
