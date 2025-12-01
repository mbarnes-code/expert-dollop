/**
 * Common types and interfaces for n8n nodes.
 */

/**
 * Node property types.
 */
export type NodePropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'options'
  | 'multiOptions'
  | 'dateTime'
  | 'collection'
  | 'fixedCollection'
  | 'color'
  | 'hidden'
  | 'credentials'
  | 'resourceLocator'
  | 'resourceMapper'
  | 'filter'
  | 'assignmentCollection';

/**
 * Display options for node properties.
 */
export interface IDisplayOptions {
  show?: Record<string, string[] | boolean[] | number[]>;
  hide?: Record<string, string[] | boolean[] | number[]>;
}

/**
 * Node property option.
 */
export interface INodePropertyOption {
  name: string;
  value: string | number | boolean;
  description?: string;
  action?: string;
}

/**
 * Node property definition.
 */
export interface INodeProperty {
  displayName: string;
  name: string;
  type: NodePropertyType;
  default?: unknown;
  description?: string;
  placeholder?: string;
  hint?: string;
  displayOptions?: IDisplayOptions;
  options?: INodePropertyOption[];
  required?: boolean;
  noDataExpression?: boolean;
  extractValue?: unknown;
  routing?: unknown;
  typeOptions?: Record<string, unknown>;
}

/**
 * Node type description.
 */
export interface INodeTypeDescription {
  displayName: string;
  name: string;
  icon?: string;
  iconUrl?: string;
  group: string[];
  version: number | number[];
  subtitle?: string;
  description: string;
  defaults: {
    name: string;
    color?: string;
  };
  inputs: string[];
  outputs: string[];
  credentials?: INodeCredentialDescription[];
  properties: INodeProperty[];
  webhooks?: IWebhookDescription[];
  polling?: boolean;
  triggerPanel?: unknown;
  requestDefaults?: unknown;
  requestOperations?: unknown;
}

/**
 * Node credential description.
 */
export interface INodeCredentialDescription {
  name: string;
  required?: boolean;
  displayOptions?: IDisplayOptions;
}

/**
 * Webhook description.
 */
export interface IWebhookDescription {
  name: string;
  httpMethod: string | string[];
  responseMode?: string;
  responseData?: string;
  path: string;
  isFullPath?: boolean;
  restartWebhook?: boolean;
}

/**
 * HTTP request methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Generic HTTP request options.
 */
export interface IHttpRequestOptions {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  qs?: Record<string, string | number | boolean>;
  json?: boolean;
  encoding?: string | null;
  timeout?: number;
  followRedirect?: boolean;
  maxRedirects?: number;
  rejectUnauthorized?: boolean;
  proxy?: string;
}

/**
 * Pagination types for API nodes.
 */
export type PaginationType = 'offset' | 'cursor' | 'link';

/**
 * Pagination configuration.
 */
export interface IPaginationConfig {
  type: PaginationType;
  limitParameter?: string;
  offsetParameter?: string;
  cursorParameter?: string;
  cursorPath?: string;
  nextLinkPath?: string;
  resultPath?: string;
  maxResults?: number;
}

/**
 * Rate limiting configuration.
 */
export interface IRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

/**
 * Retry configuration.
 */
export interface IRetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes?: number[];
}

/**
 * OAuth2 configuration.
 */
export interface IOAuth2Config {
  clientId: string;
  clientSecret: string;
  accessTokenUrl: string;
  authUrl: string;
  scope?: string;
  authQueryParameters?: Record<string, string>;
  authentication?: 'body' | 'header';
  tokenType?: string;
}

/**
 * Basic authentication credentials.
 */
export interface IBasicAuthCredentials {
  username: string;
  password: string;
}

/**
 * API key authentication credentials.
 */
export interface IApiKeyCredentials {
  apiKey: string;
  headerName?: string;
  queryParamName?: string;
  placement?: 'header' | 'query';
}

/**
 * Common operation types for CRUD nodes.
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete' | 'list' | 'getAll' | 'get';

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

/**
 * Filter operator.
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEquals'
  | 'lessThanOrEquals'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'regex';

/**
 * Filter condition.
 */
export interface IFilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Batch operation options.
 */
export interface IBatchOptions {
  batchSize: number;
  delayBetweenBatches?: number;
  continueOnFail?: boolean;
}

/**
 * Error response from an API.
 */
export interface IApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard API response.
 */
export interface IApiResponse<T = unknown> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    hasMore?: boolean;
    cursor?: string;
  };
  errors?: IApiError[];
}

/**
 * Webhook event payload.
 */
export interface IWebhookEvent {
  headers: Record<string, string>;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  method: HttpMethod;
  path: string;
}

/**
 * Node execution mode.
 */
export type ExecutionMode = 'manual' | 'trigger' | 'retry' | 'integrated' | 'cli';

/**
 * Node execution status.
 */
export type ExecutionStatus = 'new' | 'running' | 'success' | 'error' | 'canceled' | 'waiting';
