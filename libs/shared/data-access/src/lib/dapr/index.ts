/**
 * DAPR Client for TypeScript/JavaScript Frontend Applications
 *
 * Provides a database-agnostic abstraction layer using DAPR for state
 * management and pub/sub messaging, enforcing DDD principles:
 * - Bounded Contexts: Each module owns its data
 * - No Direct DB Access: Uses DAPR State API
 * - Event-Driven: Uses DAPR Pub/Sub
 * - Database Agnostic: Can swap backends without code changes
 */

export * from './state';
export * from './pubsub';
export * from './client';
export * from './types';
