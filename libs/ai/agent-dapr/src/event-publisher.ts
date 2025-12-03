/**
 * DAPR Event Publisher
 * 
 * Phase 3: Backend Service Migration
 * Publishes agent events to RabbitMQ via DAPR pub/sub
 */

import { DaprClient } from '@dapr/dapr';

const DAPR_PUBSUB = 'pubsub-goose';

/**
 * Agent event types
 */
export enum AgentEventType {
  // Agent events
  AgentMessageSent = 'goose.agent.message.sent',
  AgentMessageReceived = 'goose.agent.message.received',
  AgentToolExecuted = 'goose.agent.tool.executed',
  
  // Recipe events
  RecipeStarted = 'goose.recipe.started',
  RecipeCompleted = 'goose.recipe.completed',
  RecipeFailed = 'goose.recipe.failed',
  RecipeStepStarted = 'goose.recipe.step.started',
  RecipeStepCompleted = 'goose.recipe.step.completed',
  
  // Extension events
  ExtensionLoaded = 'goose.extension.loaded',
  ExtensionUnloaded = 'goose.extension.unloaded',
  ExtensionError = 'goose.extension.error',
  
  // Conversation events
  ConversationCreated = 'goose.conversation.created',
  ConversationUpdated = 'goose.conversation.updated',
  ConversationDeleted = 'goose.conversation.deleted',
}

/**
 * Agent event payload
 */
export interface AgentEvent<T = any> {
  eventType: AgentEventType;
  entityType: string;
  entityId: string;
  data: T;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Event publisher for Goose agent events
 */
export class AgentEventPublisher {
  private daprClient: DaprClient;

  constructor(daprClient?: DaprClient) {
    this.daprClient = daprClient || new DaprClient();
  }

  /**
   * Publish an agent event
   */
  async publish<T = any>(event: AgentEvent<T>): Promise<void> {
    // Extract topic from event type
    const topic = event.eventType;
    
    await this.daprClient.pubsub.publish(
      DAPR_PUBSUB,
      topic,
      event
    );
  }

  /**
   * Publish message event
   */
  async publishMessageEvent(
    messageId: string,
    conversationId: string,
    userId?: string,
    data?: any
  ): Promise<void> {
    await this.publish({
      eventType: AgentEventType.AgentMessageSent,
      entityType: 'message',
      entityId: messageId,
      data: {
        conversationId,
        ...data,
      },
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Publish recipe execution event
   */
  async publishRecipeEvent(
    eventType: AgentEventType,
    recipeId: string,
    executionId: string,
    data?: any,
    userId?: string
  ): Promise<void> {
    await this.publish({
      eventType,
      entityType: 'recipe',
      entityId: recipeId,
      data: {
        executionId,
        ...data,
      },
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Publish extension event
   */
  async publishExtensionEvent(
    eventType: AgentEventType,
    extensionId: string,
    data?: any,
    userId?: string
  ): Promise<void> {
    await this.publish({
      eventType,
      entityType: 'extension',
      entityId: extensionId,
      data,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Publish conversation event
   */
  async publishConversationEvent(
    eventType: AgentEventType,
    conversationId: string,
    data?: any,
    userId?: string
  ): Promise<void> {
    await this.publish({
      eventType,
      entityType: 'conversation',
      entityId: conversationId,
      data,
      userId,
      timestamp: new Date(),
    });
  }
}
