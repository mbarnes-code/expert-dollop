/**
 * AI Agent Interface Library
 * 
 * Shared interfaces and types for AI agent implementations.
 * Phase 2 of Goose AI Agent strangler fig integration.
 * 
 * This library provides:
 * - Core agent interfaces (AgentProvider, Agent)
 * - Conversation types and repository interface
 * - Recipe schema and execution interfaces
 * - Extension (MCP) interfaces and manager
 * 
 * @module @expert-dollop/ai-agent-interface
 */

// Agent types
export * from './agent.types';

// Recipe types
export * from './recipe.types';

// Extension types
export * from './extension.types';

/**
 * Re-export commonly used types for convenience
 */
export type {
  Agent,
  AgentProvider,
  AgentContext,
  Message,
  MessageRole,
  MessageContent,
  Tool,
  ToolParameter,
  LLMResponse,
  ProviderConfig,
  Conversation,
  ConversationRepository,
} from './agent.types';

export type {
  Recipe,
  RecipeStep,
  RecipeParameter,
  RecipeExecutionResult,
  RecipeExecutionStatus,
  RecipeRepository,
  RecipeExecutor,
  RecipeValidator,
} from './recipe.types';

export type {
  Extension,
  ExtensionMetadata,
  ExtensionCapabilities,
  ExtensionInterface,
  ExtensionManager,
  ExtensionRepository,
  ExtensionStatus,
  PromptTemplate,
  Resource,
} from './extension.types';
