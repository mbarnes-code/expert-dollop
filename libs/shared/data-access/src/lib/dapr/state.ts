/**
 * DAPR State Client for TypeScript/JavaScript
 *
 * Provides state management abstraction using DAPR State API.
 */

import {
  StateStore,
  StateOptions,
  StateItem,
  DaprClientConfig,
  QueryFilter,
  QuerySort,
  QueryPage,
} from './types';

/**
 * Get DAPR base URL from environment or config.
 */
function getDaprBaseUrl(config?: DaprClientConfig): string {
  const host = config?.daprHost || process.env.DAPR_HOST || 'localhost';
  const port = config?.daprPort || parseInt(process.env.DAPR_HTTP_PORT || '3500', 10);
  return `http://${host}:${port}/v1.0`;
}

/**
 * DAPR State Client for database-agnostic state management.
 *
 * @example
 * ```typescript
 * const client = new DaprStateClient(StateStore.TCG);
 * await client.save('card-123', { name: 'Black Lotus' });
 * const card = await client.get('card-123');
 * ```
 */
export class DaprStateClient<T = unknown> {
  private baseUrl: string;

  constructor(
    private store: StateStore,
    config?: DaprClientConfig
  ) {
    this.baseUrl = getDaprBaseUrl(config);
  }

  /**
   * Get state by key from the bounded context.
   */
  async get(key: string): Promise<T | null> {
    const url = `${this.baseUrl}/state/${this.store}/${key}`;
    const response = await fetch(url);

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get state: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get multiple states by keys.
   */
  async getBulk(keys: string[]): Promise<Map<string, T | null>> {
    const url = `${this.baseUrl}/state/${this.store}/bulk`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get bulk state: ${response.statusText}`);
    }

    const results = await response.json();
    const map = new Map<string, T | null>();

    for (const item of results) {
      map.set(item.key, item.data ?? null);
    }

    return map;
  }

  /**
   * Save state to the bounded context.
   */
  async save(
    key: string,
    value: T,
    options?: {
      etag?: string;
      metadata?: Record<string, string>;
      options?: StateOptions;
    }
  ): Promise<void> {
    const url = `${this.baseUrl}/state/${this.store}`;

    const item: Record<string, unknown> = {
      key,
      value,
    };

    if (options?.etag) {
      item.etag = options.etag;
    }
    if (options?.metadata) {
      item.metadata = options.metadata;
    }
    if (options?.options) {
      item.options = options.options;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([item]),
    });

    if (!response.ok) {
      throw new Error(`Failed to save state: ${response.statusText}`);
    }
  }

  /**
   * Save multiple states at once.
   */
  async saveBulk(items: StateItem<T>[]): Promise<void> {
    const url = `${this.baseUrl}/state/${this.store}`;

    const payload = items.map((item) => ({
      key: item.key,
      value: item.value,
      ...(item.etag && { etag: item.etag }),
      ...(item.metadata && { metadata: item.metadata }),
      ...(item.options && { options: item.options }),
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save bulk state: ${response.statusText}`);
    }
  }

  /**
   * Delete state by key.
   */
  async delete(key: string, etag?: string): Promise<void> {
    const url = `${this.baseUrl}/state/${this.store}/${key}`;

    const headers: Record<string, string> = {};
    if (etag) {
      headers['If-Match'] = etag;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete state: ${response.statusText}`);
    }
  }

  /**
   * Execute a state transaction (atomic operations).
   */
  async transaction(
    operations: Array<{
      operation: 'upsert' | 'delete';
      request: { key: string; value?: T };
    }>
  ): Promise<void> {
    const url = `${this.baseUrl}/state/${this.store}/transaction`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute transaction: ${response.statusText}`);
    }
  }

  /**
   * Query state using DAPR query API.
   */
  async query(
    filter: QueryFilter,
    options?: {
      sort?: QuerySort[];
      page?: QueryPage;
    }
  ): Promise<T[]> {
    const url = `${this.baseUrl}/state/${this.store}/query`;

    const payload: Record<string, unknown> = { filter };
    if (options?.sort) {
      payload.sort = options.sort;
    }
    if (options?.page) {
      payload.page = options.page;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to query state: ${response.statusText}`);
    }

    const result = await response.json();
    return result.results?.map((item: { data: T }) => item.data) ?? [];
  }
}
