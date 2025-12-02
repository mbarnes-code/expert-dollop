/**
 * Abstract API client patterns for frontend applications.
 * Provides common patterns for building REST API clients following DDD principles.
 */

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * API request configuration
 */
export interface IApiRequestConfig {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body */
  body?: unknown;
  /** Request timeout in ms */
  timeout?: number;
  /** Whether to include credentials */
  withCredentials?: boolean;
  /** Signal for aborting the request */
  signal?: AbortSignal;
}

/**
 * API response interface
 */
export interface IApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Original request config */
  config: IApiRequestConfig;
}

/**
 * API error interface
 */
export interface IApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status?: number;
  /** Error code */
  code?: string;
  /** Error details */
  details?: unknown;
  /** Original error */
  originalError?: Error;
}

/**
 * API client options
 */
export interface IApiClientOptions {
  /** Base URL for all requests */
  baseUrl: string;
  /** Default request timeout in ms */
  timeout?: number;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Whether to include credentials by default */
  withCredentials?: boolean;
  /** Request interceptor */
  onRequest?: (config: IApiRequestConfig) => IApiRequestConfig | Promise<IApiRequestConfig>;
  /** Response interceptor */
  onResponse?: <T>(response: IApiResponse<T>) => IApiResponse<T> | Promise<IApiResponse<T>>;
  /** Error interceptor */
  onError?: (error: IApiError) => IApiError | Promise<IApiError>;
}

/**
 * Abstract API client class
 */
export abstract class AbstractApiClient {
  protected baseUrl: string;
  protected timeout: number;
  protected defaultHeaders: Record<string, string>;
  protected withCredentials: boolean;
  protected onRequest?: (config: IApiRequestConfig) => IApiRequestConfig | Promise<IApiRequestConfig>;
  protected onResponse?: <T>(response: IApiResponse<T>) => IApiResponse<T> | Promise<IApiResponse<T>>;
  protected onError?: (error: IApiError) => IApiError | Promise<IApiError>;

  constructor(options: IApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.timeout = options.timeout ?? 30000;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.withCredentials = options.withCredentials ?? false;
    this.onRequest = options.onRequest;
    this.onResponse = options.onResponse;
    this.onError = options.onError;
  }

  /**
   * Build full URL with query parameters
   * @param path Request path
   * @param params Query parameters
   */
  protected buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    
    return url.toString();
  }

  /**
   * Make an HTTP request
   * @param config Request configuration
   */
  protected async request<T>(config: IApiRequestConfig): Promise<IApiResponse<T>> {
    let requestConfig = {
      ...config,
      headers: { ...this.defaultHeaders, ...(config.headers ?? {}) },
      timeout: config.timeout ?? this.timeout,
      withCredentials: config.withCredentials ?? this.withCredentials,
    } as IApiRequestConfig;

    // Apply request interceptor
    if (this.onRequest) {
      requestConfig = await this.onRequest(requestConfig);
    }

    try {
      const response = await this.executeRequest<T>(requestConfig);
      
      // Apply response interceptor
      if (this.onResponse) {
        return await this.onResponse(response);
      }
      
      return response;
    } catch (error) {
      const apiError = this.normalizeError(error);
      
      // Apply error interceptor
      if (this.onError) {
        throw await this.onError(apiError);
      }
      
      throw apiError;
    }
  }

  /**
   * Execute the actual HTTP request
   * Override this method to use different HTTP libraries (fetch, axios, etc.)
   */
  protected abstract executeRequest<T>(config: IApiRequestConfig): Promise<IApiResponse<T>>;

  /**
   * Normalize error to IApiError format
   */
  protected normalizeError(error: unknown): IApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        originalError: error,
      };
    }
    return {
      message: String(error),
    };
  }

  /**
   * GET request
   * @param path Request path
   * @param params Query parameters
   */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const response = await this.request<T>({
      url: this.buildUrl(path, params),
      method: 'GET',
    });
    return response.data;
  }

  /**
   * POST request
   * @param path Request path
   * @param body Request body
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>({
      url: this.buildUrl(path),
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  /**
   * PUT request
   * @param path Request path
   * @param body Request body
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>({
      url: this.buildUrl(path),
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  /**
   * PATCH request
   * @param path Request path
   * @param body Request body
   */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.request<T>({
      url: this.buildUrl(path),
      method: 'PATCH',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  /**
   * DELETE request
   * @param path Request path
   */
  async delete<T>(path: string): Promise<T> {
    const response = await this.request<T>({
      url: this.buildUrl(path),
      method: 'DELETE',
    });
    return response.data;
  }
}

/**
 * Fetch-based API client implementation
 */
export class FetchApiClient extends AbstractApiClient {
  protected async executeRequest<T>(config: IApiRequestConfig): Promise<IApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? this.timeout);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        credentials: config.withCredentials ? 'include' : 'same-origin',
        signal: config.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: IApiError = {
          message: `HTTP error ${response.status}: ${response.statusText}`,
          status: response.status,
        };
        
        try {
          const errorData = await response.json();
          error.details = errorData;
          if (errorData.message) {
            error.message = errorData.message;
          }
          if (errorData.code) {
            error.code = errorData.code;
          }
        } catch {
          // Ignore JSON parsing errors
        }
        
        throw error;
      }

      const data = await response.json() as T;
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        data,
        status: response.status,
        headers,
        config,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw { message: 'Request timeout', code: 'TIMEOUT' } as IApiError;
      }
      
      throw error;
    }
  }
}

/**
 * REST resource client for CRUD operations
 */
export class RestResourceClient<T extends { id: TId }, TId = string> {
  constructor(
    private apiClient: AbstractApiClient,
    protected readonly resourcePath: string,
  ) {}

  /**
   * Get the API client for direct access in subclasses
   */
  protected getApiClient(): AbstractApiClient {
    return this.apiClient;
  }

  /**
   * Get all resources
   * @param params Query parameters
   */
  async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<T[]> {
    return this.apiClient.get<T[]>(this.resourcePath, params);
  }

  /**
   * Get a resource by ID
   * @param id Resource ID
   */
  async getById(id: TId): Promise<T> {
    return this.apiClient.get<T>(`${this.resourcePath}/${id}`);
  }

  /**
   * Create a new resource
   * @param data Resource data
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    return this.apiClient.post<T>(this.resourcePath, data);
  }

  /**
   * Update a resource
   * @param id Resource ID
   * @param data Updated data
   */
  async update(id: TId, data: Partial<T>): Promise<T> {
    return this.apiClient.put<T>(`${this.resourcePath}/${id}`, data);
  }

  /**
   * Partially update a resource
   * @param id Resource ID
   * @param data Partial data
   */
  async patch(id: TId, data: Partial<T>): Promise<T> {
    return this.apiClient.patch<T>(`${this.resourcePath}/${id}`, data);
  }

  /**
   * Delete a resource
   * @param id Resource ID
   */
  async delete(id: TId): Promise<void> {
    await this.apiClient.delete(`${this.resourcePath}/${id}`);
  }
}

/**
 * Paginated response interface
 */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Pagination parameters
 */
export interface IPaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated resource client
 */
export class PaginatedResourceClient<T extends { id: TId }, TId = string> extends RestResourceClient<T, TId> {
  constructor(
    apiClient: AbstractApiClient,
    resourcePath: string,
  ) {
    super(apiClient, resourcePath);
  }

  /**
   * Get paginated resources
   * This method expects the API to return a paginated response structure
   * @param params Pagination parameters
   */
  async getPaginated(params: IPaginationParams = {}): Promise<IPaginatedResponse<T>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    };
    
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.sortOrder = params.sortOrder ?? 'asc';
    }
    
    // Use the protected getApiClient method for paginated responses
    // The API is expected to return IPaginatedResponse format
    return this.getApiClient().get<IPaginatedResponse<T>>(
      this.resourcePath,
      queryParams
    );
  }
}

/**
 * API request queue for rate limiting
 */
export class ApiRequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private readonly delayMs: number;
  private readonly maxConcurrent: number;
  private activeCount = 0;

  constructor(options: { delayMs?: number; maxConcurrent?: number } = {}) {
    this.delayMs = options.delayMs ?? 100;
    this.maxConcurrent = options.maxConcurrent ?? 5;
  }

  /**
   * Add a request to the queue
   * @param request Request function
   */
  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.activeCount++;
        request().finally(() => {
          this.activeCount--;
          this.processQueue();
        });
        
        if (this.delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }
}

/**
 * Create a retry wrapper for API calls
 * @param maxRetries Maximum number of retries
 * @param delayMs Base delay between retries
 */
export function createRetryWrapper(maxRetries = 3, delayMs = 1000) {
  return async function withRetry<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: unknown) => boolean = () => true,
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries && shouldRetry(error)) {
          const delay = delayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  };
}
