/**
 * DAPR Types
 */

/**
 * Available state stores mapped to PostgreSQL schemas (bounded contexts).
 */
export enum StateStore {
  MAIN = 'statestore-main',
  TCG = 'statestore-tcg',
  NEMESIS = 'statestore-nemesis',
  DISPATCH = 'statestore-dispatch',
  HEXSTRIKE = 'statestore-hexstrike',
  MEALIE = 'statestore-mealie',
  GHOSTWRITER = 'statestore-ghostwriter',
  NEMSIS = 'statestore-nemsis',
}

/**
 * Standard pub/sub topics for cross-module communication.
 */
export enum Topic {
  // User/Auth Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',

  // Security Events
  SECURITY_ALERT = 'security.alert',
  SECURITY_AUDIT = 'security.audit',
  SECURITY_COMPLIANCE = 'security.compliance',

  // TCG Events
  CARD_ADDED = 'tcg.card.added',
  CARD_UPDATED = 'tcg.card.updated',
  DECK_CREATED = 'tcg.deck.created',
  DECK_UPDATED = 'tcg.deck.updated',
  COLLECTION_UPDATED = 'tcg.collection.updated',
  TOURNAMENT_CREATED = 'tcg.tournament.created',
  TOURNAMENT_STARTED = 'tcg.tournament.started',
  TOURNAMENT_ENDED = 'tcg.tournament.ended',

  // Productivity Events
  TASK_CREATED = 'productivity.task.created',
  TASK_UPDATED = 'productivity.task.updated',
  TASK_COMPLETED = 'productivity.task.completed',
  PROJECT_CREATED = 'productivity.project.created',
  DOCUMENT_CREATED = 'productivity.document.created',

  // AI Events
  MODEL_TRAINED = 'ai.model.trained',
  INFERENCE_COMPLETED = 'ai.inference.completed',
  CHAT_MESSAGE = 'ai.chat.message',

  // System Events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_ERROR = 'system.error',
}

/**
 * State options for consistency and concurrency control.
 */
export interface StateOptions {
  consistency?: 'strong' | 'eventual';
  concurrency?: 'first-write' | 'last-write';
}

/**
 * State item for bulk operations.
 */
export interface StateItem<T = unknown> {
  key: string;
  value: T;
  etag?: string;
  metadata?: Record<string, string>;
  options?: StateOptions;
}

/**
 * CloudEvent specification compliant event envelope.
 */
export interface CloudEvent<T = unknown> {
  id: string;
  source: string;
  type: string;
  data: T;
  specversion?: string;
  datacontenttype?: string;
  time?: string;
  subject?: string;
}

/**
 * DAPR client configuration.
 */
export interface DaprClientConfig {
  daprHost?: string;
  daprPort?: number;
  appId?: string;
}

/**
 * Subscription route configuration.
 */
export interface SubscriptionRoute {
  path: string;
  topic: string;
  pubsubName: string;
  metadata?: Record<string, string>;
}

/**
 * Query filter for state queries.
 */
export interface QueryFilter {
  [key: string]: unknown;
}

/**
 * Sort configuration for state queries.
 */
export interface QuerySort {
  key: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Pagination configuration for state queries.
 */
export interface QueryPage {
  limit?: number;
  token?: string;
}

/**
 * Query result for state queries.
 */
export interface QueryResult<T = unknown> {
  results: T[];
  token?: string;
}
