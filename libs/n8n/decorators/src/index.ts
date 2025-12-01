/**
 * @expert-dollop/n8n-decorators
 *
 * TypeScript decorators for n8n modules following DDD modular monolith patterns.
 * Provides decorators for controllers, shutdown hooks, modules, and utility decorators.
 */

// Core types
export type { Class, EventHandler, EventHandlerClass } from './types';

// Errors
export { NonMethodError } from './errors';

// Controller decorators
export * from './controller';

// Command decorators
export * from './command';

// Shutdown decorators
export * from './shutdown';

// Module decorators
export * from './module';

// Context establishment decorators
export * from './context-establishment';

// Execution lifecycle decorators
export * from './execution-lifecycle';

// Multi-main decorators
export * from './multi-main';

// PubSub decorators
export * from './pubsub';

// Utility decorators
export { Debounce } from './debounce';
export { Memoized } from './memoized';
export { Redactable, RedactableError } from './redactable';
export type { TimedOptions } from './timed';
export { Timed } from './timed';
