/**
 * @fileoverview Core interfaces for n8n-core
 * @module @expert-dollop/n8n-core
 */

import type { 
  IDataObject,
  IBinaryData,
  INode,
  INodeExecutionData,
  INodeType,
  IWorkflowBase,
  WorkflowExecuteMode,
  ExecutionStatus,
  IRunExecutionData,
  ITaskDataConnections,
} from '@expert-dollop/n8n-workflow';
import type { Readable } from 'stream';

/**
 * Binary data service interface
 */
export interface IBinaryDataService {
  /**
   * Initializes the binary data service
   */
  init(): Promise<void>;
  
  /**
   * Stores binary data and returns metadata
   */
  store(
    workflowId: string,
    executionId: string,
    data: Buffer | Readable,
    metadata: IBinaryDataMetadata,
  ): Promise<IBinaryData>;
  
  /**
   * Retrieves binary data by ID
   */
  get(binaryDataId: string): Promise<Buffer>;
  
  /**
   * Gets a readable stream for binary data
   */
  getStream(binaryDataId: string): Promise<Readable>;
  
  /**
   * Gets the file path for binary data (if applicable)
   */
  getPath(binaryDataId: string): string;
  
  /**
   * Deletes binary data by ID
   */
  delete(binaryDataId: string): Promise<void>;
  
  /**
   * Deletes all binary data for an execution
   */
  deleteExecution(executionId: string): Promise<void>;
}

/**
 * Metadata for binary data storage
 */
export interface IBinaryDataMetadata {
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

/**
 * Encryption service interface
 */
export interface IEncryptionService {
  /**
   * Encrypts data
   */
  encrypt(data: string): string;
  
  /**
   * Decrypts data
   */
  decrypt(data: string): string;
  
  /**
   * Generates a cryptographic hash
   */
  hash(data: string, algorithm?: string): string;
}

/**
 * Credentials service interface
 */
export interface ICredentialsService {
  /**
   * Gets credentials by type and ID
   */
  get(type: string, id: string): Promise<IDataObject | undefined>;
  
  /**
   * Decrypts credentials data
   */
  decrypt(data: string): IDataObject;
  
  /**
   * Encrypts credentials data
   */
  encrypt(data: IDataObject): string;
  
  /**
   * Validates credentials
   */
  validate(type: string, data: IDataObject): Promise<boolean>;
}

/**
 * Node loader interface
 */
export interface INodeLoader {
  /**
   * Loads all available nodes
   */
  loadAll(): Promise<Map<string, INodeType>>;
  
  /**
   * Gets a node type by name
   */
  getByName(name: string): INodeType | undefined;
  
  /**
   * Gets a node type by name and version
   */
  getByNameAndVersion(name: string, version?: number): INodeType | undefined;
  
  /**
   * Gets known node types
   */
  getKnownTypes(): IDataObject;
}

/**
 * Workflow executor interface
 */
export interface IWorkflowExecutor {
  /**
   * Executes a workflow
   */
  execute(
    workflow: IWorkflowBase,
    mode: WorkflowExecuteMode,
    options?: IExecutionOptions,
  ): Promise<IExecutionResult>;
  
  /**
   * Cancels a running execution
   */
  cancel(executionId: string): Promise<void>;
  
  /**
   * Gets the status of an execution
   */
  getStatus(executionId: string): ExecutionStatus | undefined;
}

/**
 * Options for workflow execution
 */
export interface IExecutionOptions {
  startNodes?: string[];
  destinationNode?: string;
  pinData?: { [nodeName: string]: INodeExecutionData[] };
  runData?: IRunExecutionData;
  timeout?: number;
}

/**
 * Result of a workflow execution
 */
export interface IExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  data: IRunExecutionData;
  startedAt: Date;
  stoppedAt?: Date;
  error?: Error;
}

/**
 * Instance settings interface
 */
export interface IInstanceSettings {
  /**
   * Gets the instance ID
   */
  getInstanceId(): string;
  
  /**
   * Gets the encryption key
   */
  getEncryptionKey(): string;
  
  /**
   * Gets the n8n folder path
   */
  getN8nFolder(): string;
  
  /**
   * Gets the custom extensions path
   */
  getCustomExtensionsPath(): string;
  
  /**
   * Gets whether this instance is a leader
   */
  isLeader(): boolean;
  
  /**
   * Gets whether this instance is a follower
   */
  isFollower(): boolean;
}

/**
 * Abstract execution context
 */
export interface IExecutionContext {
  workflowId: string;
  executionId: string;
  mode: WorkflowExecuteMode;
  startedAt: Date;
  
  /**
   * Logs a message
   */
  log(level: string, message: string, metadata?: IDataObject): void;
  
  /**
   * Gets the current execution status
   */
  getStatus(): ExecutionStatus;
  
  /**
   * Sets the execution status
   */
  setStatus(status: ExecutionStatus): void;
  
  /**
   * Checks if execution is cancelled
   */
  isCancelled(): boolean;
  
  /**
   * Gets the abort signal
   */
  getAbortSignal(): AbortSignal;
}

/**
 * Node execution context
 */
export interface INodeExecutionContext extends IExecutionContext {
  node: INode;
  runIndex: number;
  itemIndex: number;
  
  /**
   * Gets input data
   */
  getInputData(inputIndex?: number): INodeExecutionData[];
  
  /**
   * Gets a node parameter
   */
  getNodeParameter<T = unknown>(name: string, fallbackValue?: T): T;
  
  /**
   * Gets the workflow static data
   */
  getWorkflowStaticData(type: 'global' | 'node'): IDataObject;
  
  /**
   * Gets credentials
   */
  getCredentials<T = IDataObject>(type: string): Promise<T>;
  
  /**
   * Continues on fail
   */
  continueOnFail(): boolean;
}

/**
 * Data deduplication service interface
 */
export interface IDataDeduplicationService {
  /**
   * Checks if items have been processed and records new ones
   */
  checkProcessedAndRecord(
    items: Array<string | number>,
    scope: 'node' | 'workflow',
    options: IDeduplicationOptions,
  ): Promise<IDeduplicationResult>;
  
  /**
   * Removes processed items
   */
  removeProcessed(
    items: Array<string | number>,
    scope: 'node' | 'workflow',
  ): Promise<void>;
  
  /**
   * Clears all processed items
   */
  clearAll(scope: 'node' | 'workflow'): Promise<void>;
  
  /**
   * Gets the count of processed items
   */
  getCount(scope: 'node' | 'workflow'): Promise<number>;
}

/**
 * Deduplication options
 */
export interface IDeduplicationOptions {
  mode: 'entries' | 'latestIncrementalKey' | 'latestDate';
  maxEntries?: number;
}

/**
 * Deduplication result
 */
export interface IDeduplicationResult {
  new: Array<string | number>;
  processed: Array<string | number>;
}

/**
 * HTTP proxy configuration
 */
export interface IHttpProxyConfig {
  host: string;
  port: number;
  protocol?: 'http' | 'https';
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * HTTP request configuration
 */
export interface IHttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: IDataObject;
  body?: unknown;
  params?: IDataObject;
  timeout?: number;
  proxy?: IHttpProxyConfig;
  followRedirects?: boolean;
  maxRedirects?: number;
  validateStatus?: (status: number) => boolean;
}

/**
 * HTTP response
 */
export interface IHttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: IDataObject;
  data: T;
}
