/**
 * Core AI Agent Interface
 * 
 * This module defines the shared interfaces for AI agent implementations.
 * Extracted from Goose AI Agent (Phase 2 - Shared Abstractions)
 */

import { z } from 'zod';

/**
 * Message role in a conversation
 */
export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Tool = 'tool',
}

/**
 * Message content schema
 */
export const MessageContentSchema = z.object({
  type: z.enum(['text', 'image', 'tool_use', 'tool_result']),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  toolUseId: z.string().optional(),
  toolName: z.string().optional(),
  toolInput: z.record(z.any()).optional(),
  toolResult: z.any().optional(),
});

export type MessageContent = z.infer<typeof MessageContentSchema>;

/**
 * Conversation message schema
 */
export const MessageSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(MessageRole),
  content: z.union([z.string(), z.array(MessageContentSchema)]),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Tool parameter schema
 */
export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  required: z.boolean().default(false),
  default: z.any().optional(),
});

export type ToolParameter = z.infer<typeof ToolParameterSchema>;

/**
 * Tool definition schema
 */
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(ToolParameterSchema),
  returnType: z.string().optional(),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * LLM Provider configuration
 */
export const ProviderConfigSchema = z.object({
  name: z.string(),
  model: z.string(),
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/**
 * LLM Response schema
 */
export const LLMResponseSchema = z.object({
  content: z.string(),
  toolCalls: z.array(z.object({
    id: z.string(),
    name: z.string(),
    input: z.record(z.any()),
  })).optional(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

/**
 * Agent Provider Interface
 * 
 * This interface defines the contract for LLM provider implementations.
 */
export interface AgentProvider {
  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Check if the provider supports tools/function calling
   */
  supportsTools(): boolean;

  /**
   * Send messages to the LLM and get a response
   */
  complete(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;

  /**
   * Stream messages to the LLM and get streamed responses
   */
  stream?(
    messages: Message[],
    tools?: Tool[],
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse>;
}

/**
 * Conversation state schema
 */
export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Conversation Repository Interface
 * 
 * This interface defines the contract for conversation persistence.
 */
export interface ConversationRepository {
  /**
   * Save a conversation
   */
  save(conversation: Conversation): Promise<void>;

  /**
   * Find a conversation by ID
   */
  findById(id: string): Promise<Conversation | null>;

  /**
   * List all conversations
   */
  list(options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  }): Promise<Conversation[]>;

  /**
   * Delete a conversation
   */
  delete(id: string): Promise<void>;

  /**
   * Update a conversation
   */
  update(id: string, updates: Partial<Conversation>): Promise<void>;
}

/**
 * Agent execution context
 */
export const AgentContextSchema = z.object({
  conversationId: z.string(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  tools: z.array(ToolSchema).optional(),
  metadata: z.record(z.any()).optional(),
});

export type AgentContext = z.infer<typeof AgentContextSchema>;

/**
 * Agent Interface
 * 
 * This interface defines the contract for AI agent implementations.
 */
export interface Agent {
  /**
   * Execute a user message and get a response
   */
  execute(
    message: string,
    context: AgentContext
  ): Promise<Message>;

  /**
   * Stream execution of a user message
   */
  stream?(
    message: string,
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<Message>;
}
