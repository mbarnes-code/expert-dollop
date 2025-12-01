/**
 * Abstract base classes for n8n nodes.
 * Provides common patterns for trigger nodes, action nodes, and webhook nodes.
 */

/**
 * Node description metadata interface.
 */
export interface INodeDescriptionMetadata {
  displayName: string;
  name: string;
  icon?: string;
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
  credentials?: Array<{
    name: string;
    required?: boolean;
    displayOptions?: Record<string, unknown>;
  }>;
  properties: unknown[];
}

/**
 * Execution context interface for node execution.
 */
export interface INodeExecutionContext {
  getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: unknown): unknown;
  getInputData(inputIndex?: number, inputName?: string): unknown[];
  getCredentials(type: string): Promise<Record<string, unknown>>;
  getWorkflowStaticData(type: string): Record<string, unknown>;
  helpers: INodeHelpers;
  logger: INodeLogger;
}

/**
 * Node helper functions interface.
 */
export interface INodeHelpers {
  request(options: unknown): Promise<unknown>;
  requestWithAuthentication(credentialType: string, options: unknown): Promise<unknown>;
  httpRequest(options: unknown): Promise<unknown>;
  httpRequestWithAuthentication(credentialType: string, options: unknown): Promise<unknown>;
  prepareBinaryData(binaryData: Buffer | string, filePath?: string, mimeType?: string): Promise<unknown>;
  getBinaryDataBuffer(itemIndex: number, propertyName: string): Promise<Buffer>;
  binaryToBuffer(body: Buffer | unknown): Promise<Buffer>;
  returnJsonArray(jsonData: unknown): unknown[];
}

/**
 * Node logger interface.
 */
export interface INodeLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Abstract base class for all n8n nodes.
 * Provides common functionality for node execution.
 */
export abstract class AbstractNode {
  /**
   * Node description metadata.
   */
  abstract readonly description: INodeDescriptionMetadata;

  /**
   * Execute the node logic.
   * @param context The execution context
   */
  abstract execute(context: INodeExecutionContext): Promise<unknown[][]>;

  /**
   * Get a node parameter with type safety.
   */
  protected getParameter<T>(
    context: INodeExecutionContext,
    name: string,
    itemIndex: number,
    fallback?: T,
  ): T {
    return context.getNodeParameter(name, itemIndex, fallback) as T;
  }

  /**
   * Get the input data for processing.
   */
  protected getInputItems(context: INodeExecutionContext): unknown[] {
    return context.getInputData();
  }

  /**
   * Wrap data in the expected output format.
   */
  protected wrapData(data: Record<string, unknown> | Array<Record<string, unknown>>): Array<{ json: Record<string, unknown> }> {
    if (!Array.isArray(data)) {
      return [{ json: data }];
    }
    return data.map((item) => ({ json: item }));
  }
}

/**
 * Abstract base class for trigger nodes.
 * Trigger nodes initiate workflow executions based on events.
 */
export abstract class AbstractTriggerNode extends AbstractNode {
  /**
   * Poll for new data at regular intervals.
   * @param context The execution context
   */
  abstract poll?(context: INodeExecutionContext): Promise<unknown[][] | null>;

  /**
   * Setup webhook for real-time triggers.
   * @param context The execution context
   */
  abstract webhookCreate?(context: INodeExecutionContext): Promise<boolean>;

  /**
   * Remove webhook when no longer needed.
   * @param context The execution context
   */
  abstract webhookDelete?(context: INodeExecutionContext): Promise<boolean>;

  /**
   * Handle incoming webhook data.
   * @param context The execution context
   */
  abstract webhook?(context: INodeExecutionContext): Promise<unknown>;
}

/**
 * Abstract base class for action nodes.
 * Action nodes perform operations on data.
 */
export abstract class AbstractActionNode extends AbstractNode {
  /**
   * Get the resource and operation for routing.
   */
  protected getResourceOperation(context: INodeExecutionContext): { resource: string; operation: string } {
    const resource = this.getParameter<string>(context, 'resource', 0, '');
    const operation = this.getParameter<string>(context, 'operation', 0, '');
    return { resource, operation };
  }
}

/**
 * Abstract base class for webhook nodes.
 * Webhook nodes handle incoming HTTP requests.
 */
export abstract class AbstractWebhookNode extends AbstractTriggerNode {
  /**
   * The HTTP method(s) this webhook accepts.
   */
  abstract readonly webhookMethods: string[];

  /**
   * Process the incoming webhook request.
   * @param context The execution context
   * @param requestData The incoming request data
   */
  abstract processWebhook(
    context: INodeExecutionContext,
    requestData: unknown,
  ): Promise<unknown>;
}

/**
 * Abstract base class for HTTP request nodes.
 * Provides common HTTP request functionality.
 */
export abstract class AbstractHttpRequestNode extends AbstractActionNode {
  /**
   * Make an HTTP request with proper error handling.
   */
  protected async makeHttpRequest(
    context: INodeExecutionContext,
    options: HttpRequestOptions,
  ): Promise<unknown> {
    return context.helpers.httpRequest(options);
  }

  /**
   * Make an authenticated HTTP request.
   */
  protected async makeAuthenticatedRequest(
    context: INodeExecutionContext,
    credentialType: string,
    options: HttpRequestOptions,
  ): Promise<unknown> {
    return context.helpers.httpRequestWithAuthentication(credentialType, options);
  }
}

/**
 * HTTP request options interface.
 */
export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  qs?: Record<string, unknown>;
  json?: boolean;
  resolveWithFullResponse?: boolean;
  encoding?: string | null;
  timeout?: number;
  followRedirect?: boolean;
  maxRedirects?: number;
}

/**
 * Abstract base class for database nodes.
 * Provides common database operation patterns.
 */
export abstract class AbstractDatabaseNode extends AbstractActionNode {
  /**
   * Execute a database query.
   * @param context The execution context
   * @param query The query to execute
   * @param parameters Query parameters
   */
  protected abstract executeQuery(
    context: INodeExecutionContext,
    query: string,
    parameters?: unknown[],
  ): Promise<unknown[]>;

  /**
   * Get a database connection.
   */
  protected abstract getConnection(context: INodeExecutionContext): Promise<unknown>;

  /**
   * Release a database connection back to the pool.
   */
  protected abstract releaseConnection(connection: unknown): Promise<void>;
}

/**
 * Abstract base class for OAuth nodes.
 * Provides OAuth flow handling.
 */
export abstract class AbstractOAuthNode extends AbstractActionNode {
  /**
   * Get the OAuth URL for authorization.
   */
  abstract getOAuthUrl(context: INodeExecutionContext): Promise<string>;

  /**
   * Exchange authorization code for tokens.
   */
  abstract exchangeCodeForTokens(
    context: INodeExecutionContext,
    code: string,
  ): Promise<OAuthTokens>;

  /**
   * Refresh OAuth tokens.
   */
  abstract refreshTokens(
    context: INodeExecutionContext,
    refreshToken: string,
  ): Promise<OAuthTokens>;
}

/**
 * OAuth tokens interface.
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

/**
 * Abstract base class for file operation nodes.
 * Provides common file operation patterns.
 */
export abstract class AbstractFileNode extends AbstractActionNode {
  /**
   * Read a file from the source.
   */
  protected abstract readFile(
    context: INodeExecutionContext,
    path: string,
  ): Promise<Buffer>;

  /**
   * Write a file to the destination.
   */
  protected abstract writeFile(
    context: INodeExecutionContext,
    path: string,
    data: Buffer | string,
  ): Promise<void>;

  /**
   * List files in a directory.
   */
  protected abstract listFiles(
    context: INodeExecutionContext,
    path: string,
  ): Promise<FileInfo[]>;
}

/**
 * File information interface.
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedAt: Date;
  createdAt?: Date;
  mimeType?: string;
}

/**
 * Abstract base class for code execution nodes (like Code, Function nodes).
 */
export abstract class AbstractCodeNode extends AbstractActionNode {
  /**
   * Execute user-provided code.
   * @param context The execution context
   * @param code The code to execute
   * @param sandbox The sandbox environment
   */
  protected abstract executeCode(
    context: INodeExecutionContext,
    code: string,
    sandbox: Record<string, unknown>,
  ): Promise<unknown>;

  /**
   * Validate the code before execution.
   * @param code The code to validate
   */
  protected abstract validateCode(code: string): ValidationResult;
}

/**
 * Code validation result interface.
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    message: string;
    line?: number;
    column?: number;
  }>;
}
