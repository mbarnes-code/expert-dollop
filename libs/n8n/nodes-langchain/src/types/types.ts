import type { z } from 'zod';

/**
 * OpenAI-compatible credential with API key and base URL
 */
export interface OpenAICompatibleCredential {
  apiKey: string;
  url: string;
}

/**
 * Generic Zod object type for schema validation
 */
export type ZodObjectAny = z.ZodObject<
  Record<string, z.ZodTypeAny>,
  z.UnknownKeysParam,
  z.ZodTypeAny,
  Record<string, unknown>,
  Record<string, unknown>
>;

/**
 * LLM provider types
 */
export type LLMProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'cohere'
  | 'azure'
  | 'aws'
  | 'ollama'
  | 'huggingface'
  | 'mistral'
  | 'groq';

/**
 * Embedding provider types
 */
export type EmbeddingProvider =
  | 'openai'
  | 'cohere'
  | 'google'
  | 'azure'
  | 'aws'
  | 'ollama'
  | 'huggingface'
  | 'mistral';

/**
 * Vector store provider types
 */
export type VectorStoreProvider =
  | 'pinecone'
  | 'qdrant'
  | 'weaviate'
  | 'milvus'
  | 'redis'
  | 'postgres'
  | 'supabase'
  | 'mongodb'
  | 'memory';

/**
 * Memory provider types
 */
export type MemoryProvider =
  | 'buffer'
  | 'redis'
  | 'postgres'
  | 'mongodb'
  | 'motorhead'
  | 'zep'
  | 'xata';

/**
 * Text splitter types
 */
export type TextSplitterType =
  | 'character'
  | 'recursive'
  | 'token';

/**
 * Document loader types
 */
export type DocumentLoaderType =
  | 'default'
  | 'binary'
  | 'github'
  | 'json';

/**
 * Output parser types
 */
export type OutputParserType =
  | 'structured'
  | 'itemList'
  | 'autofixing';

/**
 * Agent types
 */
export type AgentType =
  | 'conversational'
  | 'openai-functions'
  | 'react';

/**
 * Chain types
 */
export type ChainType =
  | 'llm'
  | 'summarization'
  | 'retrievalQA'
  | 'sentiment'
  | 'informationExtractor'
  | 'textClassifier';

/**
 * Tool types available in LangChain nodes
 */
export type ToolType =
  | 'calculator'
  | 'code'
  | 'httpRequest'
  | 'searxng'
  | 'serpapi'
  | 'think'
  | 'vectorStore'
  | 'wikipedia'
  | 'wolframalpha'
  | 'workflow';

/**
 * LLM model configuration
 */
export interface LLMModelConfig {
  provider: LLMProvider;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Embedding model configuration
 */
export interface EmbeddingModelConfig {
  provider: EmbeddingProvider;
  modelName: string;
  dimensions?: number;
}

/**
 * Vector store configuration
 */
export interface VectorStoreConfig {
  provider: VectorStoreProvider;
  collectionName: string;
  indexName?: string;
  namespace?: string;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  provider: MemoryProvider;
  sessionId: string;
  windowSize?: number;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'human' | 'ai' | 'system' | 'function';
  content: string;
  name?: string;
  additionalKwargs?: Record<string, unknown>;
}

/**
 * Document structure for document loaders
 */
export interface Document {
  pageContent: string;
  metadata: Record<string, unknown>;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  output: string;
  success: boolean;
  error?: string;
}

/**
 * Agent execution step
 */
export interface AgentExecutionStep {
  action: {
    tool: string;
    toolInput: Record<string, unknown>;
    log: string;
  };
  observation: string;
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  output: string;
  intermediateSteps: AgentExecutionStep[];
}

/**
 * Chain execution options
 */
export interface ChainExecutionOptions {
  input: string | Record<string, unknown>;
  callbacks?: unknown[];
  metadata?: Record<string, unknown>;
}

/**
 * LangChain node execution context
 */
export interface LangChainExecutionContext {
  sessionId?: string;
  runId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Tracing configuration for LLM calls
 */
export interface TracingConfig {
  enabled: boolean;
  projectName?: string;
  tags?: string[];
}
