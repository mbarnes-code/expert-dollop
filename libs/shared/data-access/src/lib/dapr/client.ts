/**
 * DAPR Client - Unified Client for State and Pub/Sub
 *
 * Provides a unified interface for all DAPR operations.
 */

import { DaprStateClient } from './state';
import { DaprPubSubClient, createCloudEvent } from './pubsub';
import {
  StateStore,
  Topic,
  StateOptions,
  StateItem,
  CloudEvent,
  DaprClientConfig,
  QueryFilter,
  QuerySort,
  QueryPage,
} from './types';

/**
 * Unified DAPR Client for state management and pub/sub.
 *
 * @example
 * ```typescript
 * const client = new DaprClient({ appId: 'tcg-service' });
 *
 * // State operations
 * await client.saveState(StateStore.TCG, 'card-123', { name: 'Black Lotus' });
 * const card = await client.getState(StateStore.TCG, 'card-123');
 *
 * // Pub/Sub operations
 * await client.publish(Topic.CARD_ADDED, { cardId: '123' });
 * ```
 */
export class DaprClient {
  private stateClients: Map<StateStore, DaprStateClient<unknown>> = new Map();
  private pubsubClient: DaprPubSubClient;
  private config: DaprClientConfig;

  constructor(config?: DaprClientConfig) {
    this.config = config || {};
    this.pubsubClient = new DaprPubSubClient(config);
  }

  /**
   * Get or create a state client for a bounded context.
   */
  private getStateClient<T>(store: StateStore): DaprStateClient<T> {
    if (!this.stateClients.has(store)) {
      this.stateClients.set(store, new DaprStateClient<T>(store, this.config));
    }
    return this.stateClients.get(store) as DaprStateClient<T>;
  }

  // ==================== State Operations ====================

  /**
   * Get state from a bounded context.
   */
  async getState<T>(store: StateStore, key: string): Promise<T | null> {
    const client = this.getStateClient<T>(store);
    return client.get(key);
  }

  /**
   * Get multiple states from a bounded context.
   */
  async getBulkState<T>(store: StateStore, keys: string[]): Promise<Map<string, T | null>> {
    const client = this.getStateClient<T>(store);
    return client.getBulk(keys);
  }

  /**
   * Save state to a bounded context.
   */
  async saveState<T>(
    store: StateStore,
    key: string,
    value: T,
    options?: {
      etag?: string;
      metadata?: Record<string, string>;
      options?: StateOptions;
    }
  ): Promise<void> {
    const client = this.getStateClient<T>(store);
    return client.save(key, value, options);
  }

  /**
   * Save multiple states to a bounded context.
   */
  async saveBulkState<T>(store: StateStore, items: StateItem<T>[]): Promise<void> {
    const client = this.getStateClient<T>(store);
    return client.saveBulk(items);
  }

  /**
   * Delete state from a bounded context.
   */
  async deleteState(store: StateStore, key: string, etag?: string): Promise<void> {
    const client = this.getStateClient(store);
    return client.delete(key, etag);
  }

  /**
   * Execute a state transaction in a bounded context.
   */
  async executeStateTransaction<T>(
    store: StateStore,
    operations: Array<{
      operation: 'upsert' | 'delete';
      request: { key: string; value?: T };
    }>
  ): Promise<void> {
    const client = this.getStateClient<T>(store);
    return client.transaction(operations);
  }

  /**
   * Query state in a bounded context.
   */
  async queryState<T>(
    store: StateStore,
    filter: QueryFilter,
    options?: {
      sort?: QuerySort[];
      page?: QueryPage;
    }
  ): Promise<T[]> {
    const client = this.getStateClient<T>(store);
    return client.query(filter, options);
  }

  // ==================== Pub/Sub Operations ====================

  /**
   * Publish an event to a topic.
   */
  async publish<T>(
    topic: Topic | string,
    data: T,
    metadata?: Record<string, string>
  ): Promise<void> {
    return this.pubsubClient.publish(topic, data, { metadata });
  }

  /**
   * Publish a CloudEvent to a topic.
   */
  async publishCloudEvent<T>(topic: Topic | string, event: CloudEvent<T>): Promise<void> {
    return this.pubsubClient.publishCloudEvent(topic, event);
  }

  /**
   * Publish multiple events to a topic.
   */
  async publishBulk<T>(
    topic: Topic | string,
    events: Array<{ entryId: string; event: T }>
  ): Promise<{ failedEntries?: Array<{ entryId: string; error: string }> }> {
    return this.pubsubClient.publishBulk(topic, events);
  }

  /**
   * Register a subscription route.
   */
  subscribe(
    topic: Topic | string,
    path: string,
    metadata?: Record<string, string>
  ) {
    return this.pubsubClient.subscribe(topic, path, { metadata });
  }

  /**
   * Get all registered subscriptions.
   */
  getSubscriptions() {
    return this.pubsubClient.getSubscriptions();
  }

  /**
   * Create a CloudEvent helper.
   */
  createCloudEvent<T>(id: string, source: string, type: string, data: T): CloudEvent<T> {
    return createCloudEvent(id, source, type, data);
  }
}
