/**
 * AI UI Library
 * 
 * Shared UI components and hooks for AI applications.
 * Phase 4 of Goose AI Agent strangler fig integration.
 * 
 * @module @expert-dollop/ai/ui
 */

// Components
export { ChatMessage } from './components/ChatMessage';
export type { ChatMessageProps } from './components/ChatMessage';

export { ChatInput } from './components/ChatInput';
export type { ChatInputProps } from './components/ChatInput';

export { ConversationList } from './components/ConversationList';
export type { ConversationListProps } from './components/ConversationList';

// Hooks
export { 
  useConversations, 
  useConversation, 
  useStreamingAgent,
  useAgentEvents 
} from './hooks/useConversation';

// Re-export types from agent-interface for convenience
export type {
  Message,
  MessageRole,
  Conversation,
  Agent,
  AgentProvider,
  Recipe,
  Extension,
} from '@expert-dollop/ai/agent-interface';
