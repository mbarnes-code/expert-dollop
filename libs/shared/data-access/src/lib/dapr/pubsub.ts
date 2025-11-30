/**
 * DAPR Pub/Sub Client for TypeScript/JavaScript
 *
 * Provides event-driven communication using DAPR Pub/Sub API.
 */

import {
  Topic,
  CloudEvent,
  DaprClientConfig,
  SubscriptionRoute,
} from './types';

const PUBSUB_NAME = 'pubsub';

/**
 * Get DAPR base URL from environment or config.
 */
function getDaprBaseUrl(config?: DaprClientConfig): string {
  const host = config?.daprHost || process.env.DAPR_HOST || 'localhost';
  const port = config?.daprPort || parseInt(process.env.DAPR_HTTP_PORT || '3500', 10);
  return `http://${host}:${port}/v1.0`;
}

/**
 * Create a CloudEvent envelope.
 */
export function createCloudEvent<T>(
  id: string,
  source: string,
  type: string,
  data: T
): CloudEvent<T> {
  return {
    id,
    source,
    type,
    data,
    specversion: '1.0',
    datacontenttype: 'application/json',
    time: new Date().toISOString(),
  };
}

/**
 * DAPR Pub/Sub Client for event-driven communication.
 *
 * @example
 * ```typescript
 * const client = new DaprPubSubClient({ appId: 'tcg-app' });
 * await client.publish(Topic.CARD_ADDED, { cardId: '123', name: 'Black Lotus' });
 * ```
 */
export class DaprPubSubClient {
  private baseUrl: string;
  private appId: string;
  private subscriptions: SubscriptionRoute[] = [];

  constructor(config?: DaprClientConfig) {
    this.baseUrl = getDaprBaseUrl(config);
    this.appId = config?.appId || process.env.APP_ID || 'unknown';
  }

  /**
   * Publish an event to a topic.
   */
  async publish<T>(
    topic: Topic | string,
    data: T,
    options?: {
      metadata?: Record<string, string>;
      pubsubName?: string;
    }
  ): Promise<void> {
    const topicName = typeof topic === 'string' ? topic : topic;
    const pubsub = options?.pubsubName || PUBSUB_NAME;

    const url = `${this.baseUrl}/publish/${pubsub}/${topicName}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options?.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        headers[`metadata.${key}`] = value;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish event: ${response.statusText}`);
    }
  }

  /**
   * Publish a CloudEvent to a topic.
   */
  async publishCloudEvent<T>(
    topic: Topic | string,
    event: CloudEvent<T>,
    pubsubName?: string
  ): Promise<void> {
    const topicName = typeof topic === 'string' ? topic : topic;
    const pubsub = pubsubName || PUBSUB_NAME;

    const url = `${this.baseUrl}/publish/${pubsub}/${topicName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cloudevents+json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish CloudEvent: ${response.statusText}`);
    }
  }

  /**
   * Publish multiple events to a topic in bulk.
   */
  async publishBulk<T>(
    topic: Topic | string,
    events: Array<{ entryId: string; event: T }>,
    pubsubName?: string
  ): Promise<{ failedEntries?: Array<{ entryId: string; error: string }> }> {
    const topicName = typeof topic === 'string' ? topic : topic;
    const pubsub = pubsubName || PUBSUB_NAME;

    const url = `${this.baseUrl}/publish/bulk/${pubsub}/${topicName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish bulk events: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  /**
   * Register a subscription route.
   */
  subscribe(
    topic: Topic | string,
    path: string,
    options?: {
      pubsubName?: string;
      metadata?: Record<string, string>;
    }
  ): SubscriptionRoute {
    const topicName = typeof topic === 'string' ? topic : topic;

    const route: SubscriptionRoute = {
      path,
      topic: topicName,
      pubsubName: options?.pubsubName || PUBSUB_NAME,
      metadata: options?.metadata,
    };

    this.subscriptions.push(route);
    return route;
  }

  /**
   * Get all registered subscriptions in DAPR format.
   */
  getSubscriptions(): Array<{
    pubsubname: string;
    topic: string;
    route: string;
    metadata?: Record<string, string>;
  }> {
    return this.subscriptions.map((sub) => ({
      pubsubname: sub.pubsubName,
      topic: sub.topic,
      route: sub.path,
      metadata: sub.metadata,
    }));
  }
}
