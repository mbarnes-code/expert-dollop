import type {
  LLMModelConfig,
  EmbeddingModelConfig,
  VectorStoreConfig,
  MemoryConfig,
  Document,
  ChatMessage,
  AgentExecutionResult,
  ChainExecutionOptions,
  LangChainExecutionContext,
} from '../types';

/**
 * Abstract base class for LLM (Language Model) nodes
 * Provides common functionality for all LLM provider implementations
 */
export abstract class AbstractLLMNode {
  protected config: LLMModelConfig;

  constructor(config: LLMModelConfig) {
    this.config = config;
  }

  /**
   * Gets the model name for this LLM
   */
  abstract getModelName(): string;

  /**
   * Gets the provider name for this LLM
   */
  abstract getProviderName(): string;

  /**
   * Invokes the LLM with the given prompt
   * @param prompt - The prompt to send to the LLM
   * @param context - Optional execution context
   * @returns The LLM response
   */
  abstract invoke(
    prompt: string,
    context?: LangChainExecutionContext
  ): Promise<string>;

  /**
   * Invokes the LLM with chat messages
   * @param messages - Array of chat messages
   * @param context - Optional execution context
   * @returns The LLM response
   */
  abstract invokeChat(
    messages: ChatMessage[],
    context?: LangChainExecutionContext
  ): Promise<ChatMessage>;

  /**
   * Streams the LLM response
   * @param prompt - The prompt to send to the LLM
   * @param context - Optional execution context
   * @yields Streamed response chunks
   */
  abstract stream(
    prompt: string,
    context?: LangChainExecutionContext
  ): AsyncGenerator<string>;

  /**
   * Gets the token count for the given text
   * @param text - Text to count tokens for
   * @returns Token count
   */
  abstract getTokenCount(text: string): Promise<number>;
}

/**
 * Abstract base class for Embedding nodes
 * Provides common functionality for all embedding provider implementations
 */
export abstract class AbstractEmbeddingNode {
  protected config: EmbeddingModelConfig;

  constructor(config: EmbeddingModelConfig) {
    this.config = config;
  }

  /**
   * Gets the model name for this embedding provider
   */
  abstract getModelName(): string;

  /**
   * Gets the provider name for this embedding
   */
  abstract getProviderName(): string;

  /**
   * Embeds a single text string
   * @param text - Text to embed
   * @returns Embedding vector
   */
  abstract embedText(text: string): Promise<number[]>;

  /**
   * Embeds multiple text strings
   * @param texts - Array of texts to embed
   * @returns Array of embedding vectors
   */
  abstract embedTexts(texts: string[]): Promise<number[][]>;

  /**
   * Embeds a query (may use different model/settings than document embedding)
   * @param query - Query text to embed
   * @returns Embedding vector
   */
  abstract embedQuery(query: string): Promise<number[]>;

  /**
   * Gets the embedding dimensions
   * @returns Number of dimensions in the embedding vectors
   */
  abstract getDimensions(): number;
}

/**
 * Abstract base class for Vector Store nodes
 * Provides common functionality for all vector store provider implementations
 */
export abstract class AbstractVectorStoreNode {
  protected config: VectorStoreConfig;

  constructor(config: VectorStoreConfig) {
    this.config = config;
  }

  /**
   * Gets the provider name for this vector store
   */
  abstract getProviderName(): string;

  /**
   * Adds documents to the vector store
   * @param documents - Documents to add
   * @param embeddings - Optional pre-computed embeddings
   * @returns Document IDs
   */
  abstract addDocuments(
    documents: Document[],
    embeddings?: number[][]
  ): Promise<string[]>;

  /**
   * Searches for similar documents
   * @param query - Query text or embedding
   * @param k - Number of results to return
   * @param filter - Optional metadata filter
   * @returns Similar documents with scores
   */
  abstract similaritySearch(
    query: string | number[],
    k: number,
    filter?: Record<string, unknown>
  ): Promise<Array<{ document: Document; score: number }>>;

  /**
   * Deletes documents from the vector store
   * @param ids - Document IDs to delete
   */
  abstract deleteDocuments(ids: string[]): Promise<void>;

  /**
   * Gets a document by ID
   * @param id - Document ID
   * @returns Document or undefined
   */
  abstract getDocument(id: string): Promise<Document | undefined>;
}

/**
 * Abstract base class for Memory nodes
 * Provides common functionality for all memory provider implementations
 */
export abstract class AbstractMemoryNode {
  protected config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
  }

  /**
   * Gets the provider name for this memory
   */
  abstract getProviderName(): string;

  /**
   * Loads memory variables for the given session
   * @param sessionId - Session ID
   * @returns Memory variables
   */
  abstract loadMemoryVariables(
    sessionId: string
  ): Promise<Record<string, unknown>>;

  /**
   * Saves context to memory
   * @param sessionId - Session ID
   * @param inputValues - Input values
   * @param outputValues - Output values
   */
  abstract saveContext(
    sessionId: string,
    inputValues: Record<string, unknown>,
    outputValues: Record<string, unknown>
  ): Promise<void>;

  /**
   * Clears memory for the given session
   * @param sessionId - Session ID
   */
  abstract clearMemory(sessionId: string): Promise<void>;

  /**
   * Gets chat history for the given session
   * @param sessionId - Session ID
   * @returns Array of chat messages
   */
  abstract getChatHistory(sessionId: string): Promise<ChatMessage[]>;

  /**
   * Adds a message to chat history
   * @param sessionId - Session ID
   * @param message - Message to add
   */
  abstract addMessage(sessionId: string, message: ChatMessage): Promise<void>;
}

/**
 * Abstract base class for Agent nodes
 * Provides common functionality for all agent implementations
 */
export abstract class AbstractAgentNode {
  /**
   * Gets the agent type
   */
  abstract getAgentType(): string;

  /**
   * Executes the agent with the given input
   * @param input - Input to the agent
   * @param options - Execution options
   * @returns Agent execution result
   */
  abstract execute(
    input: string,
    options?: ChainExecutionOptions
  ): Promise<AgentExecutionResult>;

  /**
   * Gets available tools for this agent
   * @returns Array of tool names
   */
  abstract getAvailableTools(): string[];

  /**
   * Adds a tool to the agent
   * @param tool - Tool to add
   */
  abstract addTool(tool: unknown): void;
}

/**
 * Abstract base class for Chain nodes
 * Provides common functionality for all chain implementations
 */
export abstract class AbstractChainNode {
  /**
   * Gets the chain type
   */
  abstract getChainType(): string;

  /**
   * Invokes the chain with the given input
   * @param input - Input to the chain
   * @param options - Execution options
   * @returns Chain execution result
   */
  abstract invoke(
    input: string | Record<string, unknown>,
    options?: ChainExecutionOptions
  ): Promise<Record<string, unknown>>;

  /**
   * Streams the chain response
   * @param input - Input to the chain
   * @param options - Execution options
   * @yields Streamed response chunks
   */
  abstract stream(
    input: string | Record<string, unknown>,
    options?: ChainExecutionOptions
  ): AsyncGenerator<string>;
}

/**
 * Abstract base class for Document Loader nodes
 * Provides common functionality for loading documents
 */
export abstract class AbstractDocumentLoaderNode {
  /**
   * Gets the loader type
   */
  abstract getLoaderType(): string;

  /**
   * Loads documents from the source
   * @returns Array of loaded documents
   */
  abstract load(): Promise<Document[]>;

  /**
   * Loads and splits documents
   * @param chunkSize - Size of each chunk
   * @param chunkOverlap - Overlap between chunks
   * @returns Array of document chunks
   */
  abstract loadAndSplit(
    chunkSize: number,
    chunkOverlap: number
  ): Promise<Document[]>;
}

/**
 * Abstract base class for Text Splitter nodes
 * Provides common functionality for splitting text
 */
export abstract class AbstractTextSplitterNode {
  /**
   * Gets the splitter type
   */
  abstract getSplitterType(): string;

  /**
   * Splits text into chunks
   * @param text - Text to split
   * @returns Array of text chunks
   */
  abstract splitText(text: string): Promise<string[]>;

  /**
   * Splits documents into chunks
   * @param documents - Documents to split
   * @returns Array of document chunks
   */
  abstract splitDocuments(documents: Document[]): Promise<Document[]>;
}

/**
 * Abstract base class for Output Parser nodes
 * Provides common functionality for parsing LLM outputs
 */
export abstract class AbstractOutputParserNode {
  /**
   * Gets the parser type
   */
  abstract getParserType(): string;

  /**
   * Parses the LLM output
   * @param output - Raw LLM output
   * @returns Parsed output
   */
  abstract parse(output: string): Promise<unknown>;

  /**
   * Gets format instructions for the LLM
   * @returns Format instructions string
   */
  abstract getFormatInstructions(): string;
}

/**
 * Abstract base class for Tool nodes
 * Provides common functionality for tools that agents can use
 */
export abstract class AbstractToolNode {
  /**
   * Gets the tool name
   */
  abstract getName(): string;

  /**
   * Gets the tool description
   */
  abstract getDescription(): string;

  /**
   * Executes the tool with the given input
   * @param input - Tool input
   * @returns Tool output
   */
  abstract execute(input: string | Record<string, unknown>): Promise<string>;

  /**
   * Gets the input schema for this tool
   * @returns JSON Schema for the input
   */
  abstract getInputSchema(): Record<string, unknown>;
}
