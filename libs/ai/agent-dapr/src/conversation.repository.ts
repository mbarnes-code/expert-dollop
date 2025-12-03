/**
 * DAPR Conversation Repository Implementation
 * 
 * Phase 3: Backend Service Migration
 * Implements ConversationRepository using DAPR state store
 */

import { DaprClient } from '@dapr/dapr';
import type {
  Conversation,
  ConversationRepository,
} from '@expert-dollop/ai/agent-interface';

const DAPR_STATE_STORE = 'statestore-goose';
const CONVERSATION_PREFIX = 'conversation:';

export class DaprConversationRepository implements ConversationRepository {
  private daprClient: DaprClient;

  constructor(daprClient?: DaprClient) {
    this.daprClient = daprClient || new DaprClient();
  }

  /**
   * Save a conversation to DAPR state store
   */
  async save(conversation: Conversation): Promise<void> {
    const key = `${CONVERSATION_PREFIX}${conversation.id}`;
    
    await this.daprClient.state.save(DAPR_STATE_STORE, [
      {
        key,
        value: conversation,
      },
    ]);
  }

  /**
   * Find a conversation by ID
   */
  async findById(id: string): Promise<Conversation | null> {
    const key = `${CONVERSATION_PREFIX}${id}`;
    
    const result = await this.daprClient.state.get(DAPR_STATE_STORE, key);
    
    if (!result) {
      return null;
    }

    return result as Conversation;
  }

  /**
   * List conversations with optional filters
   */
  async list(options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  }): Promise<Conversation[]> {
    // Note: DAPR state store doesn't support complex queries
    // For production, consider using state store query API or separate index
    
    // This is a simplified implementation
    // In production, you might want to maintain an index in a separate state key
    const indexKey = 'conversations:index';
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    
    const conversationIds = index.slice(offset, offset + limit);
    
    const conversations: Conversation[] = [];
    for (const id of conversationIds) {
      const conversation = await this.findById(id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  /**
   * Update a conversation
   */
  async update(id: string, updates: Partial<Conversation>): Promise<void> {
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Conversation ${id} not found`);
    }

    const updated: Conversation = {
      ...existing,
      ...updates,
      id: existing.id, // Don't allow ID changes
      updatedAt: new Date(),
    };

    await this.save(updated);
  }

  /**
   * Delete a conversation
   */
  async delete(id: string): Promise<void> {
    const key = `${CONVERSATION_PREFIX}${id}`;
    
    await this.daprClient.state.delete(DAPR_STATE_STORE, key);
    
    // Remove from index
    const indexKey = 'conversations:index';
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    const updatedIndex = index.filter(cid => cid !== id);
    
    await this.daprClient.state.save(DAPR_STATE_STORE, [
      {
        key: indexKey,
        value: updatedIndex,
      },
    ]);
  }

  /**
   * Helper: Add conversation to index (call after save for new conversations)
   */
  private async addToIndex(id: string): Promise<void> {
    const indexKey = 'conversations:index';
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    
    if (!index.includes(id)) {
      index.push(id);
      await this.daprClient.state.save(DAPR_STATE_STORE, [
        {
          key: indexKey,
          value: index,
        },
      ]);
    }
  }
}
