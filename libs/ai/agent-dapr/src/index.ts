/**
 * AI Agent DAPR Library
 * 
 * DAPR implementations for AI agent repositories and services.
 * Phase 3 of Goose AI Agent strangler fig integration.
 * 
 * @module @expert-dollop/ai/agent-dapr
 */

// Repository implementations
export { DaprConversationRepository } from './conversation.repository';
export { DaprRecipeRepository } from './recipe.repository';

// Event publisher
export { AgentEventPublisher, AgentEventType } from './event-publisher';
export type { AgentEvent } from './event-publisher';

/**
 * Re-export for convenience
 */
export type {
  Conversation,
  ConversationRepository,
  Recipe,
  RecipeRepository,
} from '@expert-dollop/ai/agent-interface';
