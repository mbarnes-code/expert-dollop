/**
 * Type definitions for the task runner.
 * These types define the data structures used for communication
 * between the task runner and the n8n task broker.
 */

/**
 * Definition of an input data chunk for partial data processing.
 */
export interface InputDataChunkDefinition {
  /** Starting index of the chunk in the input array */
  startIndex: number;
  /** Number of items in the chunk */
  count: number;
}

/**
 * Parameters for requesting input data.
 */
export interface InputDataRequestParams {
  /** Whether to include the input data in the response */
  include: boolean;
  /** Optionally request only a specific chunk of data instead of all input data */
  chunk?: InputDataChunkDefinition;
}

/**
 * Specifies what data should be included for a task data request.
 */
export interface TaskDataRequestParams {
  /** Node names whose data is needed, or 'all' for all nodes */
  dataOfNodes: string[] | 'all';
  /** Whether previous node data should be included */
  prevNode: boolean;
  /** Whether input data for the node should be included */
  input: InputDataRequestParams;
  /** Whether env provider's state should be included */
  env: boolean;
}

/**
 * Response containing requested task data.
 * This is a simplified interface - the actual implementation would
 * reference n8n-workflow types.
 */
export interface DataRequestResponse {
  /** Workflow configuration (without nodeTypes) */
  workflow: WorkflowParameters;
  /** Input data connections */
  inputData: ITaskDataConnections;
  /** Source of input connection data */
  connectionInputSource: ITaskDataConnectionsSource | null;
  /** Node being executed */
  node: INode;
  /** Runtime execution data */
  runExecutionData: IRunExecutionData;
  /** Current run index */
  runIndex: number;
  /** Current item index */
  itemIndex: number;
  /** Name of the active node */
  activeNodeName: string;
  /** Parameters of sibling nodes */
  siblingParameters: INodeParameters;
  /** Workflow execution mode */
  mode: WorkflowExecuteMode;
  /** Environment provider state */
  envProviderState: EnvProviderState;
  /** Default return run index */
  defaultReturnRunIndex: number;
  /** Self data of the node */
  selfData: IDataObject;
  /** Name of the context node */
  contextNodeName: string;
  /** Additional execution data */
  additionalData: PartialAdditionalData;
}

/**
 * Result data returned from task execution.
 */
export interface TaskResultData {
  /** Raw user output, i.e. not yet validated or normalized */
  result: unknown;
  /** Custom data set during execution */
  customData?: Record<string, string>;
  /** Static data changes */
  staticData?: IDataObject;
}

/**
 * Partial additional data for task execution.
 */
export interface PartialAdditionalData {
  executionId?: string;
  restartExecutionId?: string;
  restApiUrl: string;
  instanceBaseUrl: string;
  formWaitingBaseUrl: string;
  webhookBaseUrl: string;
  webhookWaitingBaseUrl: string;
  webhookTestBaseUrl: string;
  currentNodeParameters?: INodeParameters;
  executionTimeoutTimestamp?: number;
  userId?: string;
  variables: IDataObject;
}

/**
 * RPC methods that are exposed directly to the Code Node.
 * These are safe operations that can be called from user code.
 */
export const EXPOSED_RPC_METHODS = [
  // assertBinaryData(itemIndex: number, propertyName: string): Promise<IBinaryData>
  'helpers.assertBinaryData',

  // getBinaryDataBuffer(itemIndex: number, propertyName: string): Promise<Buffer>
  'helpers.getBinaryDataBuffer',

  // prepareBinaryData(binaryData: Buffer, fileName?: string, mimeType?: string): Promise<IBinaryData>
  'helpers.prepareBinaryData',

  // setBinaryDataBuffer(metadata: IBinaryData, buffer: Buffer): Promise<IBinaryData>
  'helpers.setBinaryDataBuffer',

  // binaryToString(body: Buffer, encoding?: string): string
  'helpers.binaryToString',

  // httpRequest(opts: IHttpRequestOptions): Promise<IN8nHttpFullResponse | IN8nHttpResponse>
  'helpers.httpRequest',

  // (deprecated) request(uriOrObject: string | IRequestOptions, options?: IRequestOptions): Promise<any>;
  'helpers.request',
] as const;

/**
 * Helper functions that exist but are not exposed to the Code Node.
 * These are either unsupported or unsafe for user code.
 */
export const UNSUPPORTED_HELPER_FUNCTIONS = [
  // These rely on checking the credentials from the current node type (Code Node)
  // and hence they can't even work (Code Node doesn't have credentials)
  'helpers.httpRequestWithAuthentication',
  'helpers.requestWithAuthenticationPaginated',

  // This has been removed
  'helpers.copyBinaryFile',

  // We can't support streams over RPC without implementing it ourselves
  'helpers.createReadStream',
  'helpers.getBinaryStream',

  // Makes no sense to support this, as it returns either a stream or a buffer
  // and we can't support streams over RPC
  'helpers.binaryToBuffer',

  // These are pretty low-level, so we shouldn't expose them
  // (require binary data id, which we don't expose)
  'helpers.getBinaryMetadata',
  'helpers.getStoragePath',
  'helpers.getBinaryPath',

  // We shouldn't allow arbitrary FS writes
  'helpers.writeContentToFile',

  // Not something we need to expose. Can be done in the node itself
  // copyInputItems(items: INodeExecutionData[], properties: string[]): IDataObject[]
  'helpers.copyInputItems',

  // Code Node does these automatically already
  'helpers.returnJsonArray',
  'helpers.normalizeItems',

  // The client is instantiated and lives on the n8n instance, so we can't
  // expose it over RPC without implementing object marshalling
  'helpers.getSSHClient',

  // Doesn't make sense to expose
  'helpers.createDeferredPromise',
  'helpers.constructExecutionMetaData',
] as const;

/** List of all RPC methods that task runner supports */
export const AVAILABLE_RPC_METHODS = [...EXPOSED_RPC_METHODS, 'logNodeOutput'] as const;

/** Node types needed for the runner to execute a task. */
export interface NeededNodeType {
  name: string;
  version: number;
}

// Placeholder types - these would normally come from n8n-workflow
// In the migrated package, these should be imported from @expert-dollop/n8n-types
export type WorkflowExecuteMode = string;
export type CodeExecutionMode = 'runOnceForAllItems' | 'runOnceForEachItem';
export interface IDataObject {
  [key: string]: unknown;
}
export interface INode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: INodeParameters;
  [key: string]: unknown;
}
export interface INodeParameters {
  [key: string]: unknown;
}
export interface IRunExecutionData {
  resultData: {
    metadata?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface ITaskDataConnections {
  main?: Array<INodeExecutionData[] | null>;
  [key: string]: unknown;
}
export interface ITaskDataConnectionsSource {
  [key: string]: unknown;
}
export interface INodeExecutionData {
  json: IDataObject;
  binary?: Record<string, unknown>;
  pairedItem?: unknown;
  [key: string]: unknown;
}
export interface EnvProviderState {
  env: Record<string, string>;
  isEnvAccessBlocked: boolean;
  isProcessAvailable: boolean;
}
export interface WorkflowParameters {
  id?: string;
  name?: string;
  nodes: INode[];
  connections: Record<string, unknown>;
  [key: string]: unknown;
}
export interface IExecuteData {
  data: ITaskDataConnections;
  node: INode;
  source: ITaskDataConnectionsSource | null;
}
export interface INodeTypeDescription {
  name: string;
  version?: number | number[];
  [key: string]: unknown;
}
export interface INodeTypeBaseDescription {
  name: string;
  [key: string]: unknown;
}
