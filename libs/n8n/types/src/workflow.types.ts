/**
 * Workflow-related type definitions
 * These are shared across all n8n modules
 */

/**
 * Workflow execution mode
 */
export type WorkflowExecuteMode =
  | 'cli'
  | 'error'
  | 'integrated'
  | 'internal'
  | 'manual'
  | 'retry'
  | 'trigger'
  | 'webhook'
  | 'evaluation';

/**
 * Workflow activation mode
 */
export type WorkflowActivateMode =
  | 'init'
  | 'create'
  | 'update'
  | 'activate'
  | 'manual'
  | 'leadershipChange';

/**
 * Execution status
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
 * Node connection type
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

/**
 * HTTP request methods
 */
export type HttpRequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';

/**
 * Base workflow interface
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
}

/**
 * Node interface
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
  onError?: 'continueErrorOutput' | 'continueRegularOutput' | 'stopWorkflow';
  continueOnFail?: boolean;
  parameters: INodeParameters;
  credentials?: INodeCredentials;
  webhookId?: string;
}

/**
 * Node parameters
 */
export interface INodeParameters {
  [key: string]: NodeParameterValueType;
}

/**
 * Node parameter value types
 */
export type NodeParameterValue = string | number | boolean | undefined | null;
export type NodeParameterValueType =
  | NodeParameterValue
  | INodeParameters
  | INodeParameterResourceLocator
  | NodeParameterValue[]
  | INodeParameters[]
  | INodeParameterResourceLocator[];

/**
 * Resource locator for node parameters
 */
export interface INodeParameterResourceLocator {
  __rl: true;
  mode: string;
  value: Exclude<NodeParameterValue, boolean>;
  cachedResultName?: string;
  cachedResultUrl?: string;
}

/**
 * Node credentials
 */
export interface INodeCredentials {
  [key: string]: INodeCredentialsDetails;
}

export interface INodeCredentialsDetails {
  id: string | null;
  name: string;
}

/**
 * Connections interface
 */
export interface IConnections {
  [key: string]: INodeConnections;
}

export interface INodeConnections {
  [key: string]: Array<IConnection[] | null>;
}

export interface IConnection {
  node: string;
  type: NodeConnectionType;
  index: number;
}

/**
 * Workflow settings
 */
export interface IWorkflowSettings {
  timezone?: 'DEFAULT' | string;
  errorWorkflow?: string;
  callerIds?: string;
  callerPolicy?: 'any' | 'none' | 'workflowsFromAList' | 'workflowsFromSameOwner';
  saveDataErrorExecution?: 'DEFAULT' | 'all' | 'none';
  saveDataSuccessExecution?: 'DEFAULT' | 'all' | 'none';
  saveManualExecutions?: 'DEFAULT' | boolean;
  saveExecutionProgress?: 'DEFAULT' | boolean;
  executionTimeout?: number;
  executionOrder?: 'v0' | 'v1';
}

/**
 * Pin data - cached execution data for nodes
 * 
 * Pin data allows users to "pin" (cache) the output of specific nodes
 * to avoid re-executing them during development and testing.
 * When a node has pin data, its cached output is used instead of
 * executing the node again.
 */
export interface IPinData {
  [nodeName: string]: INodeExecutionData[];
}

/**
 * Node execution data
 */
export interface INodeExecutionData {
  json: IDataObject;
  binary?: IBinaryKeyData;
  error?: Error;
  pairedItem?: IPairedItemData | IPairedItemData[] | number;
}

/**
 * Data object interface
 */
export type GenericValue = string | object | number | boolean | undefined | null;
export interface IDataObject {
  [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}

/**
 * Binary data
 */
export interface IBinaryKeyData {
  [key: string]: IBinaryData;
}

export interface IBinaryData {
  data: string;
  mimeType: string;
  fileType?: 'text' | 'json' | 'image' | 'audio' | 'video' | 'pdf' | 'html';
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: string;
  id?: string;
}

/**
 * Paired item data
 */
export interface IPairedItemData {
  item: number;
  input?: number;
}
