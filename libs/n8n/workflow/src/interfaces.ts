/**
 * @fileoverview Core workflow interfaces and types
 * @module @expert-dollop/n8n-workflow
 * 
 * This module provides the foundational interfaces for workflow execution,
 * node management, and data handling in the n8n workflow automation system.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DateTime } from 'luxon';

// Re-export from our shared types
export type { IUser, IWorkflowMetadata } from '@expert-dollop/n8n-types';

/**
 * Execution modes for workflows
 */
export const WORKFLOW_EXECUTE_MODES = [
  'cli',
  'error',
  'integrated',
  'internal',
  'manual',
  'retry',
  'trigger',
  'webhook',
  'evaluation',
] as const;

export type WorkflowExecuteMode = (typeof WORKFLOW_EXECUTE_MODES)[number];

/**
 * Workflow activation modes
 */
export type WorkflowActivateMode =
  | 'init'
  | 'create'
  | 'update'
  | 'activate'
  | 'manual'
  | 'leadershipChange';

/**
 * Execution status types
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
 * Log levels for workflow execution
 */
export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'verbose'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Code languages supported for code nodes
 */
export const CODE_LANGUAGES = ['javaScript', 'python', 'pythonNative'] as const;
export type CodeNodeEditorLanguage = (typeof CODE_LANGUAGES)[number];

/**
 * Code execution modes
 */
export const CODE_EXECUTION_MODES = ['runOnceForAllItems', 'runOnceForEachItem'] as const;
export type CodeExecutionMode = (typeof CODE_EXECUTION_MODES)[number];

/**
 * Node connection types for AI and main flows
 */
export const NodeConnectionTypes = {
  AiAgent: 'ai_agent',
  AiChain: 'ai_chain',
  AiDocument: 'ai_document',
  AiEmbedding: 'ai_embedding',
  AiLanguageModel: 'ai_languageModel',
  AiMemory: 'ai_memory',
  AiOutputParser: 'ai_outputParser',
  AiRetriever: 'ai_retriever',
  AiReranker: 'ai_reranker',
  AiTextSplitter: 'ai_textSplitter',
  AiTool: 'ai_tool',
  AiVectorStore: 'ai_vectorStore',
  Main: 'main',
} as const;

export type NodeConnectionType = (typeof NodeConnectionTypes)[keyof typeof NodeConnectionTypes];
export type AINodeConnectionType = Exclude<NodeConnectionType, typeof NodeConnectionTypes.Main>;
export const nodeConnectionTypes: NodeConnectionType[] = Object.values(NodeConnectionTypes);

/**
 * Binary file types
 */
export type BinaryFileType = 'text' | 'json' | 'image' | 'audio' | 'video' | 'pdf' | 'html';

/**
 * Binary data interface
 */
export interface IBinaryData {
  [key: string]: string | number | undefined;
  data: string;
  mimeType: string;
  fileType?: BinaryFileType;
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: string;
  id?: string;
}

export interface IBinaryKeyData {
  [key: string]: IBinaryData;
}

/**
 * Generic value types
 */
export type GenericValue = string | object | number | boolean | undefined | null;

/**
 * Data object interface for JSON-like data
 */
export interface IDataObject {
  [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}

/**
 * Node connection interface
 */
export interface IConnection {
  node: string;
  type: NodeConnectionType;
  index: number;
}

/**
 * Node input connections (arrays of connections)
 */
export type NodeInputConnections = Array<IConnection[] | null>;

export interface INodeConnections {
  [key: string]: NodeInputConnections;
}

export interface IConnections {
  [key: string]: INodeConnections;
}

/**
 * Node credentials interfaces
 */
export interface INodeCredentialsDetails {
  id: string | null;
  name: string;
}

export interface INodeCredentials {
  [key: string]: INodeCredentialsDetails;
}

/**
 * Node parameters and values
 */
export type NodeParameterValue = string | number | boolean | undefined | null;

export interface INodeParameters {
  [key: string]: NodeParameterValueType;
}

export type NodeParameterValueType =
  | NodeParameterValue
  | INodeParameters
  | INodeParameterResourceLocator
  | ResourceMapperValue
  | FilterValue
  | AssignmentCollectionValue
  | NodeParameterValue[]
  | INodeParameters[]
  | INodeParameterResourceLocator[]
  | ResourceMapperValue[];

export type ResourceLocatorModes = 'id' | 'url' | 'list' | string;

export interface INodeParameterResourceLocator {
  __rl: true;
  mode: ResourceLocatorModes;
  value: Exclude<NodeParameterValue, boolean>;
  cachedResultName?: string;
  cachedResultUrl?: string;
  __regex?: string;
}

/**
 * Resource mapper types
 */
export type ResourceMapperValue = {
  mappingMode: string;
  value: { [key: string]: string | number | boolean | null } | null;
  matchingColumns: string[];
  schema: ResourceMapperField[];
  attemptToConvertTypes: boolean;
  convertFieldsToString: boolean;
};

export interface ResourceMapperField {
  id: string;
  displayName: string;
  defaultMatch: boolean;
  canBeUsedToMatch?: boolean;
  required: boolean;
  display: boolean;
  type?: FieldType;
  removed?: boolean;
  options?: INodePropertyOptions[];
  readOnly?: boolean;
  defaultValue?: string | number | boolean | null;
}

export interface ResourceMapperFields {
  fields: ResourceMapperField[];
  emptyFieldsNotice?: string;
}

/**
 * Filter types
 */
export type FilterTypeCombinator = 'and' | 'or';

export type FilterOperatorType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'dateTime'
  | 'any';

export interface FilterOperatorValue {
  type: FilterOperatorType;
  operation: string;
  rightType?: FilterOperatorType;
  singleValue?: boolean;
}

export type FilterConditionValue = {
  id: string;
  leftValue: NodeParameterValue | NodeParameterValue[];
  operator: FilterOperatorValue;
  rightValue: NodeParameterValue | NodeParameterValue[];
};

export type FilterOptionsValue = {
  caseSensitive: boolean;
  leftValue: string;
  typeValidation: 'strict' | 'loose';
  version: 1 | 2 | 3;
};

export type FilterValue = {
  options: FilterOptionsValue;
  conditions: FilterConditionValue[];
  combinator: FilterTypeCombinator;
};

/**
 * Assignment types
 */
export type AssignmentCollectionValue = {
  assignments: AssignmentValue[];
};

export type AssignmentValue = {
  id: string;
  name: string;
  value: NodeParameterValue;
  type?: string;
};

/**
 * Field types for validation
 */
export type FieldTypeMap = {
  boolean: boolean;
  number: number;
  string: string;
  'string-alphanumeric': string;
  dateTime: string;
  time: string;
  array: unknown[];
  object: object;
  options: any;
  url: string;
  jwt: string;
  'form-fields': FormFieldsParameter;
};

export type FieldType = keyof FieldTypeMap;

export type ValidationResult<T extends FieldType = FieldType> =
  | { valid: false; errorMessage: string }
  | { valid: true; newValue?: FieldTypeMap[T] };

export type FormFieldsParameter = Array<{
  fieldLabel: string;
  elementName?: string;
  fieldType?: string;
  requiredField?: boolean;
  fieldOptions?: { values: Array<{ option: string }> };
  multiselect?: boolean;
  multipleFiles?: boolean;
  acceptFileTypes?: string;
  formatDate?: string;
  html?: string;
  placeholder?: string;
  defaultValue?: string;
  fieldName?: string;
  fieldValue?: string;
}>;

/**
 * Node error handling types
 */
export type OnError = 'continueErrorOutput' | 'continueRegularOutput' | 'stopWorkflow';

/**
 * Core node interface
 */
export interface INode {
  id: string;
  name: string;
  typeVersion: number;
  type: string;
  position: [number, number];
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  onError?: OnError;
  continueOnFail?: boolean;
  parameters: INodeParameters;
  credentials?: INodeCredentials;
  webhookId?: string;
  extendsCredential?: string;
  rewireOutputLogTo?: NodeConnectionType;
  forceCustomOperation?: {
    resource: string;
    operation: string;
  };
}

export interface INodes {
  [key: string]: INode;
}

/**
 * Pinned data interface
 */
export interface IPinData {
  [nodeName: string]: INodeExecutionData[];
}

/**
 * Node execution data
 */
export interface IPairedItemData {
  item: number;
  input?: number;
  sourceOverwrite?: ISourceData;
}

export interface INodeExecutionData {
  [key: string]: any;
  json: IDataObject;
  binary?: IBinaryKeyData;
  error?: any;
  pairedItem?: IPairedItemData | IPairedItemData[] | number;
  metadata?: {
    subExecution: RelatedExecution;
  };
  evaluationData?: Record<string, GenericValue>;
  sendMessage?: string;
  /** @deprecated */
  index?: number;
}

export interface NodeExecutionWithMetadata extends INodeExecutionData {
  pairedItem: IPairedItemData | IPairedItemData[];
}

/**
 * Source data for node connections
 */
export interface ISourceData {
  previousNode: string;
  previousNodeOutput?: number;
  previousNodeRun?: number;
}

export interface StartNodeData {
  name: string;
  sourceData: ISourceData | null;
}

/**
 * Task data interfaces
 */
export interface ITaskDataConnections {
  [key: string]: Array<INodeExecutionData[] | null>;
}

export interface ITaskDataConnectionsSource {
  [key: string]: Array<ISourceData | null>;
}

export interface ITaskStartedData {
  startTime: number;
  executionIndex: number;
  source: Array<ISourceData | null>;
  hints?: NodeExecutionHint[];
}

export interface ITaskData extends ITaskStartedData {
  executionTime: number;
  executionStatus?: ExecutionStatus;
  data?: ITaskDataConnections;
  inputOverride?: ITaskDataConnections;
  error?: any;
  metadata?: ITaskMetadata;
}

export interface ITaskMetadata {
  subRun?: ITaskSubRunMetadata[];
  parentExecution?: RelatedExecution;
  subExecution?: RelatedExecution;
  subExecutionsCount?: number;
  preserveSourceOverwrite?: boolean;
  nodeWasResumed?: boolean;
  timeSaved?: {
    minutes: number;
  };
}

export interface ITaskSubRunMetadata {
  node: string;
  runIndex: number;
}

export interface RelatedExecution {
  executionId: string;
  workflowId: string;
  shouldResume?: boolean;
  executionContext?: any;
}

/**
 * Run data interfaces
 */
export interface IRunData {
  [key: string]: ITaskData[];
}

/**
 * Execution context
 */
export interface IExecutionContext {
  mode: string;
  [key: string]: any;
}

/**
 * Execute data for nodes
 */
export interface IExecuteData {
  data: ITaskDataConnections;
  metadata?: ITaskMetadata;
  node: INode;
  source: ITaskDataConnectionsSource | null;
  runIndex?: number;
}

export interface ISourceDataConnections {
  [key: string]: Array<ISourceData[] | null>;
}

/**
 * Node property interfaces
 */
export type NodePropertyTypes =
  | 'boolean'
  | 'button'
  | 'collection'
  | 'color'
  | 'dateTime'
  | 'fixedCollection'
  | 'hidden'
  | 'json'
  | 'callout'
  | 'notice'
  | 'multiOptions'
  | 'number'
  | 'options'
  | 'string'
  | 'credentialsSelect'
  | 'resourceLocator'
  | 'curlImport'
  | 'resourceMapper'
  | 'filter'
  | 'assignmentCollection'
  | 'credentials'
  | 'workflowSelector';

export interface INodePropertyOptions {
  name: string;
  value: string | number | boolean;
  action?: string;
  description?: string;
  routing?: any;
}

export interface INodePropertyCollection {
  displayName: string;
  name: string;
  values: INodeProperties[];
}

export interface IDisplayOptions {
  hide?: {
    [key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
  };
  show?: {
    '@version'?: Array<number | DisplayCondition>;
    '@tool'?: boolean[];
    [key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
  };
  hideOnCloud?: boolean;
}

export type DisplayCondition =
  | { _cnd: { eq: NodeParameterValue } }
  | { _cnd: { not: NodeParameterValue } }
  | { _cnd: { gte: number | string } }
  | { _cnd: { lte: number | string } }
  | { _cnd: { gt: number | string } }
  | { _cnd: { lt: number | string } }
  | { _cnd: { between: { from: number | string; to: number | string } } }
  | { _cnd: { startsWith: string } }
  | { _cnd: { endsWith: string } }
  | { _cnd: { includes: string } }
  | { _cnd: { regex: string } }
  | { _cnd: { exists: true } };

export interface INodeProperties {
  displayName: string;
  name: string;
  type: NodePropertyTypes;
  typeOptions?: any;
  default: NodeParameterValueType;
  description?: string;
  hint?: string;
  disabledOptions?: IDisplayOptions;
  displayOptions?: IDisplayOptions;
  options?: Array<INodePropertyOptions | INodeProperties | INodePropertyCollection>;
  placeholder?: string;
  isNodeSetting?: boolean;
  noDataExpression?: boolean;
  required?: boolean;
  routing?: any;
  credentialTypes?: Array<string>;
  extractValue?: any;
  modes?: any[];
  requiresDataPath?: 'single' | 'multiple';
  doNotInherit?: boolean;
  validateType?: FieldType;
  ignoreValidationDuringExecution?: boolean;
  allowArbitraryValues?: boolean;
}

/**
 * Node type interfaces
 */
export interface INodeTypeBaseDescription {
  displayName: string;
  name: string;
  icon?: string;
  iconColor?: string;
  iconUrl?: any;
  iconBasePath?: string;
  badgeIconUrl?: any;
  group: string[];
  description: string;
  documentationUrl?: string;
  subtitle?: string;
  defaultVersion?: number;
  codex?: any;
  parameterPane?: 'wide';
  hidden?: true;
  usableAsTool?: true | any;
}

export interface INodeTypeDescription extends INodeTypeBaseDescription {
  version: number | number[];
  defaults: any;
  eventTriggerDescription?: string;
  activationMessage?: string;
  inputs: Array<NodeConnectionType | any> | string;
  requiredInputs?: string | number[] | number;
  inputNames?: string[];
  outputs: Array<NodeConnectionType | any> | string;
  outputNames?: string[];
  properties: INodeProperties[];
  credentials?: any[];
  maxNodes?: number;
  polling?: true | undefined;
  supportsCORS?: true | undefined;
  requestDefaults?: any;
  requestOperations?: any;
  hooks?: any;
  webhooks?: any[];
  translation?: { [key: string]: object };
  mockManualExecution?: true;
  triggerPanel?: any;
  extendsCredential?: string;
  hints?: NodeHint[];
  communityNodePackageVersion?: string;
  waitingNodeTooltip?: string;
  __loadOptionsMethods?: string[];
}

export type NodeHint = {
  message: string;
  type?: 'info' | 'warning' | 'danger';
  location?: 'outputPane' | 'inputPane' | 'ndv';
  displayCondition?: string;
  whenToDisplay?: 'always' | 'beforeExecution' | 'afterExecution';
};

export type NodeExecutionHint = Omit<NodeHint, 'whenToDisplay' | 'displayCondition'>;

/**
 * Node type interface
 */
export interface INodeType {
  description: INodeTypeDescription;
  supplyData?: (itemIndex: number) => Promise<any>;
  execute?: (response?: any) => Promise<any>;
  poll?: () => Promise<INodeExecutionData[][] | null>;
  trigger?: () => Promise<any>;
  webhook?: () => Promise<any>;
  methods?: any;
  webhookMethods?: any;
  customOperations?: any;
}

export interface IVersionedNodeType {
  nodeVersions: {
    [key: number]: INodeType;
  };
  currentVersion: number;
  description: INodeTypeBaseDescription;
  getNodeType: (version?: number) => INodeType;
}

export interface INodeTypes {
  getByName(nodeType: string): INodeType | IVersionedNodeType;
  getByNameAndVersion(nodeType: string, version?: number): INodeType;
  getKnownTypes(): IDataObject;
}

/**
 * Credential interfaces
 */
export interface ICredentialDataDecryptedObject {
  [key: string]: any;
}

export interface ICredentialsEncrypted {
  id?: string;
  name: string;
  type: string;
  data?: string;
}

export interface ICredentialsDecrypted<T extends object = ICredentialDataDecryptedObject> {
  id: string;
  name: string;
  type: string;
  data?: T;
  homeProject?: any;
  sharedWithProjects?: any[];
  isGlobal?: boolean;
}

/**
 * Workflow settings
 */
export namespace WorkflowSettings {
  export type CallerPolicy = 'any' | 'none' | 'workflowsFromAList' | 'workflowsFromSameOwner';
  export type SaveDataExecution = 'DEFAULT' | 'all' | 'none';
}

export interface IWorkflowSettings {
  timezone?: 'DEFAULT' | string;
  errorWorkflow?: string;
  callerIds?: string;
  callerPolicy?: WorkflowSettings.CallerPolicy;
  saveDataErrorExecution?: WorkflowSettings.SaveDataExecution;
  saveDataSuccessExecution?: WorkflowSettings.SaveDataExecution;
  saveManualExecutions?: 'DEFAULT' | boolean;
  saveExecutionProgress?: 'DEFAULT' | boolean;
  executionTimeout?: number;
  executionOrder?: 'v0' | 'v1';
  timeSavedPerExecution?: number;
  timeSavedMode?: 'fixed' | 'dynamic';
  availableInMCP?: boolean;
}

export interface WorkflowFEMeta {
  onboardingId?: string;
  templateId?: string;
  instanceId?: string;
  templateCredsSetupCompleted?: boolean;
}

/**
 * Workflow base interface
 */
export interface IWorkflowBase {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  isArchived: boolean;
  createdAt: Date;
  startedAt?: Date;
  updatedAt: Date;
  nodes: INode[];
  connections: IConnections;
  settings?: IWorkflowSettings;
  staticData?: IDataObject;
  pinData?: IPinData;
  versionId?: string;
  activeVersionId: string | null;
  versionCounter?: number;
  meta?: WorkflowFEMeta;
}

/**
 * Observable object interface
 */
export interface IObservableObject {
  [key: string]: any;
  __dataChanged: boolean;
}

/**
 * Context types
 */
export type ContextType = 'flow' | 'node';

export type IContextObject = {
  [key: string]: any;
};

export interface IExecuteContextData {
  [key: string]: IContextObject;
}

/**
 * Connected node interface
 */
export interface IConnectedNode {
  name: string;
  indices: number[];
  depth: number;
}

/**
 * Run interfaces
 */
export interface IRun {
  data: IRunExecutionData;
  /** @deprecated Use status instead */
  finished?: boolean;
  mode: WorkflowExecuteMode;
  waitTill?: Date | null;
  startedAt: Date;
  stoppedAt?: Date;
  status: ExecutionStatus;
  jobId?: string;
}

export interface IRunExecutionData {
  startData?: {
    destinationNode?: string;
    startNodes?: StartNodeData[];
    runNodeFilter?: string[];
  };
  resultData: {
    runData: IRunData;
    pinData?: IPinData;
    lastNodeExecuted?: string;
    error?: any;
    metadata?: Record<string, string>;
  };
  executionData?: {
    contextData: IExecuteContextData;
    nodeExecutionStack: IExecuteData[];
    waitingExecution: IWaitingForExecution;
    waitingExecutionSource: IWaitingForExecutionSource;
  };
  staticData?: IDataObject;
  pushRef?: string;
}

export interface IWaitingForExecution {
  [key: string]: {
    [key: number]: ITaskDataConnections;
  };
}

export interface IWaitingForExecutionSource {
  [key: string]: {
    [key: number]: ITaskDataConnectionsSource;
  };
}

/**
 * Deferred promise interface
 */
export interface IDeferredPromise<T = void> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

/**
 * HTTP types
 */
export type IHttpRequestMethods = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';

export interface IHttpRequestOptions {
  url: string;
  baseURL?: string;
  headers?: IDataObject;
  method?: IHttpRequestMethods;
  body?: any;
  qs?: IDataObject;
  arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
  auth?: {
    username: string;
    password: string;
    sendImmediately?: boolean;
  };
  disableFollowRedirect?: boolean;
  encoding?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
  skipSslCertificateValidation?: boolean;
  returnFullResponse?: boolean;
  ignoreHttpStatusErrors?: boolean;
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
    protocol?: string;
  };
  timeout?: number;
  json?: boolean;
  abortSignal?: any;
}

/**
 * Webhook types
 */
export type WebhookType = 'default' | 'setup';
export type WebhookResponseData = 'allEntries' | 'firstEntryJson' | 'firstEntryBinary' | 'noData';
export type WebhookResponseMode =
  | 'onReceived'
  | 'lastNode'
  | 'responseNode'
  | 'formPage'
  | 'hostedChat'
  | 'streaming';

export interface IWebhookDescription {
  [key: string]: IHttpRequestMethods | WebhookResponseMode | boolean | string | undefined;
  httpMethod: IHttpRequestMethods | string;
  isFullPath?: boolean;
  name: WebhookType;
  path: string;
  responseBinaryPropertyName?: string;
  responseContentType?: string;
  responsePropertyName?: string;
  responseMode?: WebhookResponseMode | string;
  responseData?: WebhookResponseData | string;
  restartWebhook?: boolean;
  nodeType?: 'webhook' | 'form' | 'mcp';
  ndvHideUrl?: string | boolean;
  ndvHideMethod?: string | boolean;
}

export interface IWebhookData {
  httpMethod: IHttpRequestMethods;
  node: string;
  path: string;
  webhookDescription: IWebhookDescription;
  workflowId: string;
  workflowExecuteAdditionalData: any;
  webhookId?: string;
  isTest?: boolean;
  userId?: string;
  staticData?: any;
}

export interface IWebhookResponseData {
  workflowData?: INodeExecutionData[][];
  webhookResponse?: any;
  noWebhookResponse?: boolean;
}

/**
 * Logger interface
 */
export type LogMetadata = {
  [key: string]: unknown;
  scopes?: string[];
  file?: string;
  function?: string;
};

export type Logger = Record<
  Exclude<LogLevel, 'silent'>,
  (message: string, metadata?: LogMetadata) => void
>;

/**
 * Execution summary
 */
export interface ExecutionSummary {
  id: string;
  /** @deprecated Use status instead */
  finished?: boolean;
  mode: WorkflowExecuteMode;
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
  executionError?: any;
  nodeExecutionStatus?: {
    [key: string]: IExecutionSummaryNodeExecutionResult;
  };
  annotation?: {
    vote: 'up' | 'down';
    tags: Array<{ id: string; name: string }>;
  };
}

export interface IExecutionSummaryNodeExecutionResult {
  executionStatus: ExecutionStatus;
  errors?: Array<{
    name?: string;
    message?: string;
    description?: string;
  }>;
}

/**
 * Close function type
 */
export type CloseFunction = () => Promise<void>;

/**
 * Trigger response interface
 */
export interface ITriggerResponse {
  closeFunction?: CloseFunction;
  manualTriggerFunction?: () => Promise<void>;
  manualTriggerResponse?: Promise<INodeExecutionData[][]>;
}

/**
 * Execute workflow data
 */
export interface ExecuteWorkflowData {
  executionId: string;
  data: Array<INodeExecutionData[] | null>;
  waitTill?: Date | null;
}

export interface IExecuteWorkflowInfo {
  code?: IWorkflowBase;
  id?: string;
}

/**
 * AI event types
 */
export type AiEvent =
  | 'ai-messages-retrieved-from-memory'
  | 'ai-message-added-to-memory'
  | 'ai-output-parsed'
  | 'ai-documents-retrieved'
  | 'ai-document-reranked'
  | 'ai-document-embedded'
  | 'ai-query-embedded'
  | 'ai-document-processed'
  | 'ai-text-split'
  | 'ai-tool-called'
  | 'ai-vector-store-searched'
  | 'ai-llm-generated-output'
  | 'ai-llm-errored'
  | 'ai-vector-store-populated'
  | 'ai-vector-store-updated';

/**
 * Chunk types for streaming
 */
export type ChunkType = 'begin' | 'item' | 'end' | 'error';

export interface StructuredChunk {
  type: ChunkType;
  content?: string;
  metadata: {
    nodeId: string;
    nodeName: string;
    runIndex: number;
    itemIndex: number;
    timestamp: number;
  };
}
