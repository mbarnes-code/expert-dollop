/**
 * Chat Service - Unified LLM Chat Interface
 * 
 * This service consolidates chat functionality from:
 * - features/n8n/packages/@n8n/ai-workflow-builder.ee (LangChain-based chat)
 * - features/goose (AI agent chat)
 * 
 * Provides a unified interface for chat-based AI interactions.
 */

// Chat message types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Chat service for managing AI conversations
 * Inspired by n8n's AI Workflow Builder chat functionality
 */
export class ChatService {
  private sessions: Map<string, ChatSession> = new Map();

  /**
   * Create a new chat session
   */
  createSession(model: string = 'gpt-4.1-mini'): ChatSession {
    const session: ChatSession = {
      id: this.generateSessionId(),
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get an existing session
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    message.timestamp = new Date();
    session.messages.push(message);
    session.updatedAt = new Date();
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Simulate chat completion (placeholder for actual LLM integration)
   * In a real implementation, this would call:
   * - LangChain for n8n-style chat
   * - Goose agents for agent-based chat
   * - Direct LLM APIs
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a simulated response
    const response: ChatCompletionResponse = {
      id: this.generateMessageId(),
      model: request.model,
      message: {
        role: 'assistant',
        content: this.generateSimulatedResponse(request),
        timestamp: new Date(),
      },
      usage: {
        promptTokens: this.estimateTokens(
          request.messages.map(m => m.content).join(' ')
        ),
        completionTokens: 150,
        totalTokens: 0,
      },
    };

    response.usage!.totalTokens = 
      response.usage!.promptTokens + response.usage!.completionTokens;

    return response;
  }

  /**
   * Simulate streaming chat (placeholder)
   */
  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
    const response = await this.chat(request);
    const words = response.message.content.split(' ');

    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield word + ' ';
    }
  }

  // Helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private generateSimulatedResponse(request: ChatCompletionRequest): string {
    const lastMessage = request.messages[request.messages.length - 1];
    
    // Generate contextual response based on the question
    if (lastMessage.content.toLowerCase().includes('hello') || 
        lastMessage.content.toLowerCase().includes('hi')) {
      return `Hello! I'm an AI assistant powered by ${request.model}. How can I help you today?`;
    }
    
    if (lastMessage.content.toLowerCase().includes('model')) {
      return `I'm currently using the ${request.model} model. This is a unified chat interface that consolidates functionality from n8n's AI Workflow Builder and Goose's agent system.`;
    }

    if (lastMessage.content.toLowerCase().includes('capability') ||
        lastMessage.content.toLowerCase().includes('what can you do')) {
      return `I can help with various tasks including answering questions, analyzing data, generating code, and more. This interface provides a unified chat experience across different AI backends including LangChain-based workflows and agent systems.`;
    }

    // Default response
    return `I understand you said: "${lastMessage.content}". In a full implementation, this would be processed by LangChain (from n8n's AI Workflow Builder) or Goose agents. The response would be generated by ${request.model} and could include function calling, tool use, and structured outputs.`;
  }
}

// Export singleton instance
export const chatService = new ChatService();

export default ChatService;
