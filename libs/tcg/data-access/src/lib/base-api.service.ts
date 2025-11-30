/**
 * Abstract base class for API services following DDD patterns.
 * Provides common functionality for HTTP-based API interactions.
 */
export abstract class BaseApiService {
  protected readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Build headers for API requests
   */
  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
  }

  /**
   * Make a GET request to the API
   */
  protected async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = `${this.basePath}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(headers),
    });

    if (!response.ok) {
      throw new Error(`GET request to ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a POST request to the API
   */
  protected async post<T, R>(endpoint: string, data: T, headers?: Record<string, string>): Promise<R> {
    const url = `${this.basePath}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`POST request to ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<R>;
  }
}
