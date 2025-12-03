# Goose-n8n System-Level Integration Architecture

## Overview

This document outlines the system-level and code-level integration points between Goose AI Agent (Rust/TypeScript) and n8n workflow automation platform (TypeScript/Node.js), going beyond MCP protocol integration to create deep, native integrations.

## Integration Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                             │
│  ┌──────────────────┐                    ┌──────────────────┐      │
│  │  Goose Desktop   │                    │   n8n Editor     │      │
│  │  (Electron/React)│                    │   (Vue.js)       │      │
│  └────────┬─────────┘                    └────────┬─────────┘      │
└───────────┼──────────────────────────────────────┼─────────────────┘
            │                                       │
┌───────────┼──────────────────────────────────────┼─────────────────┐
│           │          Service Layer               │                 │
│  ┌────────▼─────────┐              ┌─────────────▼──────────┐     │
│  │  Goose Server    │◄────────────►│  n8n Server            │     │
│  │  (Rust/Axum)     │   REST/WS   │  (Node.js/Express)     │     │
│  └────────┬─────────┘              └─────────────┬──────────┘     │
│           │                                       │                 │
│  ┌────────▼─────────────────────────────────────▼──────────┐     │
│  │           Unified API Gateway (TypeScript)              │     │
│  │    - Route aggregation                                   │     │
│  │    - Authentication/Authorization                        │     │
│  │    - Request transformation                              │     │
│  └────────┬─────────────────────────────────────────────────┘     │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│           │         Integration Layer                             │
│  ┌────────▼─────────────────────────────────────────┐            │
│  │         Shared TypeScript Libraries               │            │
│  │  - @expert-dollop/ai-agent-interface             │            │
│  │  - @expert-dollop/workflow-types                 │            │
│  │  - @expert-dollop/integration-adapters           │            │
│  └────────┬──────────────────────────────────────────┘            │
│           │                                                        │
│  ┌────────▼───────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   DAPR Pub/Sub     │    │  DAPR State  │   │  DAPR Invoke │  │
│  │   (Event Bus)      │    │  (Shared)    │   │  (RPC)       │  │
│  └────────┬───────────┘    └──────┬───────┘   └──────┬───────┘  │
└───────────┼────────────────────────┼──────────────────┼──────────┘
            │                        │                  │
┌───────────┼────────────────────────┼──────────────────┼──────────┐
│           │        Data Layer      │                  │           │
│  ┌────────▼──────────┐    ┌───────▼──────────┐  ┌───▼────────┐ │
│  │   PostgreSQL      │    │   PostgreSQL     │  │  Redis     │ │
│  │   (Goose Schema)  │    │   (n8n Schema)   │  │  (Cache)   │ │
│  └───────────────────┘    └──────────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## 1. Shared TypeScript Libraries

### 1.1 Workflow-Agent Type Library

Create a shared library that defines common types for both systems:

**Package**: `@expert-dollop/workflow-agent-types`

```typescript
// libs/ai/workflow-agent-types/src/index.ts

/**
 * Unified workflow and agent types
 */

// Workflow execution context
export interface WorkflowExecutionContext {
  executionId: string;
  workflowId: string;
  triggeredBy: 'agent' | 'schedule' | 'webhook' | 'manual';
  agentConversationId?: string;  // Link to Goose conversation
  agentSessionId?: string;       // Link to Goose session
  inputData: Record<string, unknown>;
  metadata: {
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'success' | 'error' | 'cancelled';
    error?: string;
  };
}

// Agent-triggered workflow
export interface AgentWorkflowRequest {
  workflowId: string;
  conversationId: string;
  messageId: string;
  parameters: Record<string, unknown>;
  waitForCompletion: boolean;
  timeout?: number;
}

// Workflow-triggered agent action
export interface WorkflowAgentRequest {
  agentId: string;
  action: 'message' | 'execute-tool' | 'create-recipe';
  context: {
    workflowId: string;
    executionId: string;
    nodeId: string;
  };
  payload: Record<string, unknown>;
}

// Shared execution result
export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  duration: number;
  resourceUsage?: {
    tokensUsed?: number;
    apiCalls?: number;
    executedNodes?: number;
  };
}

// Event types for pub/sub
export enum IntegrationEventType {
  // Agent events
  AGENT_CONVERSATION_STARTED = 'agent.conversation.started',
  AGENT_MESSAGE_SENT = 'agent.message.sent',
  AGENT_TOOL_EXECUTED = 'agent.tool.executed',
  AGENT_RECIPE_COMPLETED = 'agent.recipe.completed',
  
  // Workflow events
  WORKFLOW_EXECUTION_STARTED = 'workflow.execution.started',
  WORKFLOW_EXECUTION_COMPLETED = 'workflow.execution.completed',
  WORKFLOW_EXECUTION_FAILED = 'workflow.execution.failed',
  WORKFLOW_NODE_EXECUTED = 'workflow.node.executed',
  
  // Integration events
  AGENT_TRIGGERED_WORKFLOW = 'integration.agent_triggered_workflow',
  WORKFLOW_TRIGGERED_AGENT = 'integration.workflow_triggered_agent',
}

export interface IntegrationEvent<T = unknown> {
  id: string;
  type: IntegrationEventType;
  timestamp: Date;
  source: 'goose' | 'n8n';
  payload: T;
  correlationId?: string;  // For tracking related events
}
```

### 1.2 Integration Adapters Library

**Package**: `@expert-dollop/integration-adapters`

```typescript
// libs/ai/integration-adapters/src/workflow-adapter.ts

import { WorkflowExecutionContext, ExecutionResult } from '@expert-dollop/workflow-agent-types';

/**
 * Adapter for Goose to execute n8n workflows directly via API
 * (alternative to MCP when system-level integration is needed)
 */
export class N8nWorkflowAdapter {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  /**
   * Execute workflow and return immediately (async)
   */
  async executeWorkflowAsync(
    workflowId: string,
    data: Record<string, unknown>,
    context?: Partial<WorkflowExecutionContext>
  ): Promise<{ executionId: string }> {
    const response = await fetch(`${this.apiUrl}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        meta: context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Workflow execution failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { executionId: result.executionId };
  }

  /**
   * Execute workflow and wait for completion (sync)
   */
  async executeWorkflowSync(
    workflowId: string,
    data: Record<string, unknown>,
    timeout: number = 30000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const { executionId } = await this.executeWorkflowAsync(workflowId, data);

    // Poll for completion
    while (Date.now() - startTime < timeout) {
      const status = await this.getExecutionStatus(executionId);
      
      if (status.finished) {
        return {
          success: !status.error,
          data: status.data,
          error: status.error,
          duration: Date.now() - startTime,
          resourceUsage: {
            executedNodes: status.executedNodes,
          },
        };
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Workflow execution timeout');
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string) {
    const response = await fetch(`${this.apiUrl}/executions/${executionId}`, {
      headers: { 'X-N8N-API-KEY': this.apiKey },
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Adapter for n8n to trigger Goose agent actions
 */
export class GooseAgentAdapter {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  /**
   * Send message to agent and get response
   */
  async sendMessage(
    conversationId: string,
    message: string,
    context?: Record<string, unknown>
  ): Promise<{ messageId: string; response: string }> {
    const response = await fetch(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute agent tool
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<ExecutionResult> {
    const response = await fetch(`${this.apiUrl}/tools/${toolName}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters }),
    });

    if (!response.ok) {
      throw new Error(`Tool execution failed: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## 2. DAPR Event-Driven Integration

### 2.1 DAPR Pub/Sub Component

```yaml
# infrastructure/dapr/components/pubsub-integration.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: integration-pubsub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
    - name: host
      value: "amqp://rabbitmq:5672"
    - name: durable
      value: "true"
    - name: deletedWhenUnused
      value: "false"
    - name: autoAck
      value: "false"
    - name: deliveryMode
      value: "2"  # persistent
    - name: requeueInFailure
      value: "true"
```

### 2.2 Event Publisher (Goose Side)

```typescript
// backend/services/goose/integration/event-publisher.ts

import { DaprClient } from '@dapr/dapr';
import { IntegrationEvent, IntegrationEventType } from '@expert-dollop/workflow-agent-types';

export class GooseEventPublisher {
  private daprClient: DaprClient;

  constructor() {
    this.daprClient = new DaprClient({
      daprHost: process.env.DAPR_HOST || 'localhost',
      daprPort: process.env.DAPR_HTTP_PORT || '3500',
    });
  }

  /**
   * Publish event when agent triggers workflow
   */
  async publishWorkflowTriggered(event: {
    workflowId: string;
    conversationId: string;
    executionId: string;
    parameters: Record<string, unknown>;
  }) {
    const integrationEvent: IntegrationEvent = {
      id: crypto.randomUUID(),
      type: IntegrationEventType.AGENT_TRIGGERED_WORKFLOW,
      timestamp: new Date(),
      source: 'goose',
      payload: event,
      correlationId: event.conversationId,
    };

    await this.daprClient.pubsub.publish(
      'integration-pubsub',
      'agent-workflow-events',
      integrationEvent
    );
  }

  /**
   * Publish event when agent completes recipe
   */
  async publishRecipeCompleted(event: {
    recipeId: string;
    conversationId: string;
    success: boolean;
    workflows: string[];  // IDs of workflows executed
  }) {
    const integrationEvent: IntegrationEvent = {
      id: crypto.randomUUID(),
      type: IntegrationEventType.AGENT_RECIPE_COMPLETED,
      timestamp: new Date(),
      source: 'goose',
      payload: event,
      correlationId: event.conversationId,
    };

    await this.daprClient.pubsub.publish(
      'integration-pubsub',
      'agent-events',
      integrationEvent
    );
  }
}
```

### 2.3 Event Subscriber (n8n Side)

```typescript
// backend/services/n8n-server/integration/event-subscriber.ts

import { DaprServer } from '@dapr/dapr';
import { IntegrationEvent, IntegrationEventType } from '@expert-dollop/workflow-agent-types';
import { WorkflowRunner } from 'n8n-core';

export class N8nEventSubscriber {
  private daprServer: DaprServer;

  constructor(private workflowRunner: WorkflowRunner) {
    this.daprServer = new DaprServer({
      serverHost: process.env.SERVER_HOST || 'localhost',
      serverPort: process.env.SERVER_PORT || '3000',
    });
  }

  async start() {
    // Subscribe to agent events
    await this.daprServer.pubsub.subscribe(
      'integration-pubsub',
      'agent-events',
      async (event: IntegrationEvent) => {
        await this.handleAgentEvent(event);
      }
    );

    await this.daprServer.start();
  }

  private async handleAgentEvent(event: IntegrationEvent) {
    switch (event.type) {
      case IntegrationEventType.AGENT_TRIGGERED_WORKFLOW:
        await this.handleWorkflowTrigger(event);
        break;
      case IntegrationEventType.AGENT_RECIPE_COMPLETED:
        await this.handleRecipeCompleted(event);
        break;
    }
  }

  private async handleWorkflowTrigger(event: IntegrationEvent) {
    const { workflowId, parameters, conversationId } = event.payload as any;
    
    // Execute workflow with agent context
    await this.workflowRunner.run(workflowId, {
      data: parameters,
      metadata: {
        triggeredBy: 'agent',
        agentConversationId: conversationId,
        eventId: event.id,
      },
    });
  }

  private async handleRecipeCompleted(event: IntegrationEvent) {
    // Log recipe completion, update metrics, trigger dependent workflows, etc.
    console.log('Recipe completed:', event.payload);
  }
}
```

## 3. Shared Database Schema Integration

### 3.1 Integration Tables (PostgreSQL)

```sql
-- infrastructure/postgres/schemas/integration.sql

-- Create integration schema
CREATE SCHEMA IF NOT EXISTS integration;

-- Agent-Workflow Execution Mapping
CREATE TABLE integration.agent_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent context
    conversation_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255),
    agent_session_id VARCHAR(255),
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    
    -- Execution details
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,  -- 'running', 'success', 'error', 'cancelled'
    
    -- Results
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    
    -- Metrics
    duration_ms INTEGER,
    tokens_used INTEGER,
    nodes_executed INTEGER,
    
    -- Indexing
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workflow-Agent Action Mapping
CREATE TABLE integration.workflow_agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    
    -- Agent action
    action_type VARCHAR(50) NOT NULL,  -- 'message', 'tool-execution', 'recipe-creation'
    conversation_id VARCHAR(255),
    tool_name VARCHAR(255),
    
    -- Action details
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    
    -- Results
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recipe-Workflow Correlation
CREATE TABLE integration.recipe_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipe context
    recipe_id VARCHAR(255) NOT NULL,
    recipe_execution_id UUID,
    step_index INTEGER NOT NULL,
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    
    -- Execution
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50),
    
    -- Results
    input_data JSONB,
    output_data JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_workflow_conversation ON integration.agent_workflow_executions(conversation_id);
CREATE INDEX idx_agent_workflow_execution ON integration.agent_workflow_executions(execution_id);
CREATE INDEX idx_agent_workflow_status ON integration.agent_workflow_executions(status, triggered_at);

CREATE INDEX idx_workflow_agent_workflow ON integration.workflow_agent_actions(workflow_id, execution_id);
CREATE INDEX idx_workflow_agent_conversation ON integration.workflow_agent_actions(conversation_id);

CREATE INDEX idx_recipe_workflow_recipe ON integration.recipe_workflow_steps(recipe_id, recipe_execution_id);
CREATE INDEX idx_recipe_workflow_execution ON integration.recipe_workflow_steps(execution_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_workflow_executions_updated_at BEFORE UPDATE ON integration.agent_workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_agent_actions_updated_at BEFORE UPDATE ON integration.workflow_agent_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_workflow_steps_updated_at BEFORE UPDATE ON integration.recipe_workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.2 Repository Implementation

```typescript
// libs/ai/integration-adapters/src/repositories/execution-repository.ts

import { Pool } from 'pg';
import { WorkflowExecutionContext } from '@expert-dollop/workflow-agent-types';

export class AgentWorkflowExecutionRepository {
  constructor(private pool: Pool) {}

  /**
   * Create new agent-workflow execution record
   */
  async create(data: {
    conversationId: string;
    messageId?: string;
    workflowId: string;
    executionId: string;
    inputData: Record<string, unknown>;
  }): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO integration.agent_workflow_executions 
       (conversation_id, message_id, workflow_id, execution_id, input_data, status)
       VALUES ($1, $2, $3, $4, $5, 'running')
       RETURNING id`,
      [data.conversationId, data.messageId, data.workflowId, data.executionId, JSON.stringify(data.inputData)]
    );
    
    return result.rows[0].id;
  }

  /**
   * Update execution status and results
   */
  async update(id: string, data: {
    status: string;
    outputData?: Record<string, unknown>;
    errorMessage?: string;
    durationMs?: number;
    nodesExecuted?: number;
  }) {
    await this.pool.query(
      `UPDATE integration.agent_workflow_executions
       SET status = $1,
           output_data = $2,
           error_message = $3,
           duration_ms = $4,
           nodes_executed = $5,
           completed_at = CASE WHEN $1 IN ('success', 'error', 'cancelled') THEN NOW() ELSE completed_at END
       WHERE id = $6`,
      [
        data.status,
        data.outputData ? JSON.stringify(data.outputData) : null,
        data.errorMessage,
        data.durationMs,
        data.nodesExecuted,
        id,
      ]
    );
  }

  /**
   * Get all executions for a conversation
   */
  async findByConversation(conversationId: string) {
    const result = await this.pool.query(
      `SELECT * FROM integration.agent_workflow_executions
       WHERE conversation_id = $1
       ORDER BY triggered_at DESC`,
      [conversationId]
    );
    
    return result.rows;
  }

  /**
   * Get execution by workflow execution ID
   */
  async findByExecutionId(executionId: string) {
    const result = await this.pool.query(
      `SELECT * FROM integration.agent_workflow_executions
       WHERE execution_id = $1`,
      [executionId]
    );
    
    return result.rows[0];
  }

  /**
   * Get execution statistics
   */
  async getStatistics(filters: {
    conversationId?: string;
    workflowId?: string;
    from?: Date;
    to?: Date;
  }) {
    const conditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.conversationId) {
      conditions.push(`conversation_id = $${paramIndex++}`);
      params.push(filters.conversationId);
    }

    if (filters.workflowId) {
      conditions.push(`workflow_id = $${paramIndex++}`);
      params.push(filters.workflowId);
    }

    if (filters.from) {
      conditions.push(`triggered_at >= $${paramIndex++}`);
      params.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`triggered_at <= $${paramIndex++}`);
      params.push(filters.to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.pool.query(
      `SELECT 
         COUNT(*) as total_executions,
         COUNT(*) FILTER (WHERE status = 'success') as successful_executions,
         COUNT(*) FILTER (WHERE status = 'error') as failed_executions,
         AVG(duration_ms) as avg_duration_ms,
         AVG(nodes_executed) as avg_nodes_executed,
         SUM(tokens_used) as total_tokens_used
       FROM integration.agent_workflow_executions
       ${whereClause}`,
      params
    );

    return result.rows[0];
  }
}
```

## 4. Code-Level Integration: Custom n8n Nodes

### 4.1 Goose Agent Node for n8n

```typescript
// apps/ai/n8n/nodes/GooseAgent/GooseAgent.node.ts

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { GooseAgentAdapter } from '@expert-dollop/integration-adapters';

export class GooseAgent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Goose Agent',
    name: 'gooseAgent',
    icon: 'file:goose.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Interact with Goose AI Agent',
    defaults: {
      name: 'Goose Agent',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'gooseApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a message to the agent and get response',
          },
          {
            name: 'Execute Tool',
            value: 'executeTool',
            description: 'Execute an agent tool',
          },
          {
            name: 'Execute Recipe',
            value: 'executeRecipe',
            description: 'Execute an agent recipe',
          },
          {
            name: 'Get Conversation History',
            value: 'getHistory',
            description: 'Get conversation history',
          },
        ],
        default: 'sendMessage',
      },
      // Send Message operation
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['sendMessage', 'getHistory'],
          },
        },
        default: '',
        required: true,
        description: 'The ID of the conversation',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        default: '',
        required: true,
        description: 'Message to send to the agent',
      },
      {
        displayName: 'Context Data',
        name: 'context',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        default: '{}',
        description: 'Additional context data to provide to the agent',
      },
      // Execute Tool operation
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['executeTool'],
          },
        },
        default: '',
        required: true,
        description: 'Name of the tool to execute',
      },
      {
        displayName: 'Tool Parameters',
        name: 'toolParameters',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['executeTool'],
          },
        },
        default: '{}',
        description: 'Parameters for the tool',
      },
      // Execute Recipe operation
      {
        displayName: 'Recipe Name',
        name: 'recipeName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['executeRecipe'],
          },
        },
        default: '',
        required: true,
        description: 'Name of the recipe to execute',
      },
      {
        displayName: 'Recipe Input',
        name: 'recipeInput',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['executeRecipe'],
          },
        },
        default: '{}',
        description: 'Input data for the recipe',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    // Get credentials
    const credentials = await this.getCredentials('gooseApi');
    const adapter = new GooseAgentAdapter(
      credentials.apiUrl as string,
      credentials.apiKey as string
    );

    for (let i = 0; i < items.length; i++) {
      try {
        let result;

        switch (operation) {
          case 'sendMessage':
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            const message = this.getNodeParameter('message', i) as string;
            const context = this.getNodeParameter('context', i, '{}') as string;
            
            result = await adapter.sendMessage(
              conversationId,
              message,
              JSON.parse(context)
            );
            break;

          case 'executeTool':
            const toolName = this.getNodeParameter('toolName', i) as string;
            const toolParameters = this.getNodeParameter('toolParameters', i, '{}') as string;
            
            result = await adapter.executeTool(
              toolName,
              JSON.parse(toolParameters)
            );
            break;

          case 'executeRecipe':
            const recipeName = this.getNodeParameter('recipeName', i) as string;
            const recipeInput = this.getNodeParameter('recipeInput', i, '{}') as string;
            
            result = await adapter.executeRecipe(
              recipeName,
              JSON.parse(recipeInput)
            );
            break;

          case 'getHistory':
            const historyConversationId = this.getNodeParameter('conversationId', i) as string;
            result = await adapter.getConversationHistory(historyConversationId);
            break;

          default:
            throw new NodeOperationError(
              this.getNode(),
              `Unknown operation: ${operation}`
            );
        }

        returnData.push({
          json: result,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

### 4.2 n8n Workflow Node for Goose (Rust Extension)

```rust
// backend/services/goose/extensions/n8n-workflow/src/lib.rs

use goose::mcp_utils::ToolDefinition;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Serialize, Deserialize)]
pub struct N8nConfig {
    pub api_url: String,
    pub api_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkflowExecuteParams {
    pub workflow_id: String,
    pub data: Value,
    pub wait_for_completion: Option<bool>,
}

/// Direct n8n integration extension for Goose
pub struct N8nWorkflowExtension {
    config: N8nConfig,
    client: reqwest::Client,
}

impl N8nWorkflowExtension {
    pub fn new(config: N8nConfig) -> Self {
        Self {
            config,
            client: reqwest::Client::new(),
        }
    }

    /// Get tool definitions for MCP
    pub fn get_tools() -> Vec<ToolDefinition> {
        vec![
            ToolDefinition {
                name: "n8n_execute_workflow".to_string(),
                description: "Execute an n8n workflow directly".to_string(),
                input_schema: json!({
                    "type": "object",
                    "properties": {
                        "workflow_id": {
                            "type": "string",
                            "description": "ID of the workflow to execute"
                        },
                        "data": {
                            "type": "object",
                            "description": "Input data for the workflow"
                        },
                        "wait_for_completion": {
                            "type": "boolean",
                            "description": "Wait for workflow to complete before returning",
                            "default": false
                        }
                    },
                    "required": ["workflow_id"]
                }),
            },
            ToolDefinition {
                name: "n8n_get_workflow_status".to_string(),
                description: "Get status of a workflow execution".to_string(),
                input_schema: json!({
                    "type": "object",
                    "properties": {
                        "execution_id": {
                            "type": "string",
                            "description": "ID of the execution"
                        }
                    },
                    "required": ["execution_id"]
                }),
            },
        ]
    }

    /// Execute workflow
    pub async fn execute_workflow(
        &self,
        params: WorkflowExecuteParams,
    ) -> Result<Value, Box<dyn std::error::Error>> {
        let url = format!("{}/workflows/{}/execute", self.config.api_url, params.workflow_id);
        
        let response = self.client
            .post(&url)
            .header("X-N8N-API-KEY", &self.config.api_key)
            .json(&json!({
                "data": params.data,
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Workflow execution failed: {}", response.status()).into());
        }

        let result: Value = response.json().await?;
        let execution_id = result["executionId"].as_str()
            .ok_or("No execution ID in response")?;

        if params.wait_for_completion.unwrap_or(false) {
            // Poll for completion
            self.wait_for_completion(execution_id).await
        } else {
            Ok(json!({
                "execution_id": execution_id,
                "status": "started"
            }))
        }
    }

    /// Wait for workflow completion
    async fn wait_for_completion(&self, execution_id: &str) -> Result<Value, Box<dyn std::error::Error>> {
        use tokio::time::{sleep, Duration};

        for _ in 0..60 {  // Max 60 attempts (60 seconds with 1s interval)
            let status = self.get_execution_status(execution_id).await?;
            
            if status["finished"].as_bool().unwrap_or(false) {
                return Ok(status);
            }

            sleep(Duration::from_secs(1)).await;
        }

        Err("Workflow execution timeout".into())
    }

    /// Get execution status
    pub async fn get_execution_status(
        &self,
        execution_id: &str,
    ) -> Result<Value, Box<dyn std::error::Error>> {
        let url = format!("{}/executions/{}", self.config.api_url, execution_id);
        
        let response = self.client
            .get(&url)
            .header("X-N8N-API-KEY", &self.config.api_key)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to get execution status: {}", response.status()).into());
        }

        response.json().await.map_err(Into::into)
    }
}
```

## 5. Unified API Gateway

Create a unified API gateway that aggregates both Goose and n8n APIs:

```typescript
// backend/services/integration-gateway/src/index.ts

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Goose proxy
app.use('/api/agent', createProxyMiddleware({
  target: process.env.GOOSE_API_URL || 'http://localhost:8000',
  pathRewrite: { '^/api/agent': '' },
  changeOrigin: true,
}));

// n8n proxy
app.use('/api/workflows', createProxyMiddleware({
  target: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
  pathRewrite: { '^/api/workflows': '' },
  changeOrigin: true,
}));

// Integration endpoints
app.post('/api/integration/execute-with-agent', async (req, res) => {
  const { workflowId, message, conversationId } = req.body;
  
  // 1. Send message to agent
  // 2. Extract intent and parameters
  // 3. Execute workflow
  // 4. Return results to agent
  // 5. Agent responds to user
});

app.listen(3000);
```

## Summary

This architecture provides multiple layers of integration:

1. **MCP Protocol**: High-level tool integration (already exists)
2. **Shared Libraries**: Common types and adapters for code reuse
3. **DAPR Integration**: Event-driven communication and state sharing
4. **Database Integration**: Correlation and analytics across systems
5. **Custom Nodes**: Native n8n nodes that call Goose directly
6. **Rust Extensions**: Native Goose extensions that call n8n directly
7. **API Gateway**: Unified REST API for both systems

These integration points enable deep, native integration while maintaining the independence of each system.
