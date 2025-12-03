/**
 * Shared TypeScript Types for Goose-n8n Integration
 * 
 * This library provides common types and schemas for deep integration
 * between Goose AI Agent and n8n workflow automation platform.
 * 
 * @packageDocumentation
 */

import { z } from 'zod';

// ============================================================================
// Workflow Execution Context
// ============================================================================

/**
 * Context for workflow executions triggered by agent
 */
export interface WorkflowExecutionContext {
  /** Unique execution identifier */
  executionId: string;
  
  /** Workflow being executed */
  workflowId: string;
  
  /** How the workflow was triggered */
  triggeredBy: 'agent' | 'schedule' | 'webhook' | 'manual';
  
  /** Link to Goose conversation (if triggered by agent) */
  agentConversationId?: string;
  
  /** Link to Goose session (if triggered by agent) */
  agentSessionId?: string;
  
  /** Input data for the workflow */
  inputData: Record<string, unknown>;
  
  /** Execution metadata */
  metadata: {
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'success' | 'error' | 'cancelled';
    error?: string;
  };
}

export const WorkflowExecutionContextSchema = z.object({
  executionId: z.string(),
  workflowId: z.string(),
  triggeredBy: z.enum(['agent', 'schedule', 'webhook', 'manual']),
  agentConversationId: z.string().optional(),
  agentSessionId: z.string().optional(),
  inputData: z.record(z.unknown()),
  metadata: z.object({
    startTime: z.date(),
    endTime: z.date().optional(),
    status: z.enum(['running', 'success', 'error', 'cancelled']),
    error: z.string().optional(),
  }),
});

// ============================================================================
// Agent-Workflow Integration
// ============================================================================

/**
 * Request from agent to execute workflow
 */
export interface AgentWorkflowRequest {
  /** Workflow to execute */
  workflowId: string;
  
  /** Agent conversation context */
  conversationId: string;
  
  /** Message that triggered the workflow */
  messageId: string;
  
  /** Workflow parameters */
  parameters: Record<string, unknown>;
  
  /** Whether to wait for completion */
  waitForCompletion: boolean;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

export const AgentWorkflowRequestSchema = z.object({
  workflowId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
  parameters: z.record(z.unknown()),
  waitForCompletion: z.boolean(),
  timeout: z.number().positive().optional(),
});

/**
 * Request from workflow to trigger agent action
 */
export interface WorkflowAgentRequest {
  /** Agent to interact with */
  agentId: string;
  
  /** Type of action */
  action: 'message' | 'execute-tool' | 'create-recipe';
  
  /** Workflow context */
  context: {
    workflowId: string;
    executionId: string;
    nodeId: string;
  };
  
  /** Action payload */
  payload: Record<string, unknown>;
}

export const WorkflowAgentRequestSchema = z.object({
  agentId: z.string(),
  action: z.enum(['message', 'execute-tool', 'create-recipe']),
  context: z.object({
    workflowId: z.string(),
    executionId: z.string(),
    nodeId: z.string(),
  }),
  payload: z.record(z.unknown()),
});

// ============================================================================
// Execution Results
// ============================================================================

/**
 * Result of workflow or agent execution
 */
export interface ExecutionResult {
  /** Whether execution succeeded */
  success: boolean;
  
  /** Result data (if successful) */
  data?: unknown;
  
  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  
  /** Execution duration in milliseconds */
  duration: number;
  
  /** Resource usage metrics */
  resourceUsage?: {
    tokensUsed?: number;
    apiCalls?: number;
    executedNodes?: number;
  };
}

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
  duration: z.number(),
  resourceUsage: z.object({
    tokensUsed: z.number().optional(),
    apiCalls: z.number().optional(),
    executedNodes: z.number().optional(),
  }).optional(),
});

// ============================================================================
// Integration Events
// ============================================================================

/**
 * Event types for cross-system integration
 */
export enum IntegrationEventType {
  // Agent events
  AGENT_CONVERSATION_STARTED = 'agent.conversation.started',
  AGENT_MESSAGE_SENT = 'agent.message.sent',
  AGENT_TOOL_EXECUTED = 'agent.tool.executed',
  AGENT_RECIPE_STARTED = 'agent.recipe.started',
  AGENT_RECIPE_COMPLETED = 'agent.recipe.completed',
  
  // Workflow events
  WORKFLOW_EXECUTION_STARTED = 'workflow.execution.started',
  WORKFLOW_EXECUTION_COMPLETED = 'workflow.execution.completed',
  WORKFLOW_EXECUTION_FAILED = 'workflow.execution.failed',
  WORKFLOW_NODE_EXECUTED = 'workflow.node.executed',
  WORKFLOW_ACTIVATED = 'workflow.activated',
  WORKFLOW_DEACTIVATED = 'workflow.deactivated',
  
  // Integration events
  AGENT_TRIGGERED_WORKFLOW = 'integration.agent_triggered_workflow',
  WORKFLOW_TRIGGERED_AGENT = 'integration.workflow_triggered_agent',
  RECIPE_EXECUTED_WORKFLOW = 'integration.recipe_executed_workflow',
}

/**
 * Generic integration event
 */
export interface IntegrationEvent<T = unknown> {
  /** Event unique identifier */
  id: string;
  
  /** Event type */
  type: IntegrationEventType;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Source system */
  source: 'goose' | 'n8n';
  
  /** Event payload */
  payload: T;
  
  /** Correlation ID for tracking related events */
  correlationId?: string;
}

export const IntegrationEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(IntegrationEventType),
  timestamp: z.date(),
  source: z.enum(['goose', 'n8n']),
  payload: z.unknown(),
  correlationId: z.string().optional(),
});

// ============================================================================
// Recipe-Workflow Mapping
// ============================================================================

/**
 * Mapping between Goose recipe step and n8n workflow
 */
export interface RecipeWorkflowStep {
  /** Recipe identifier */
  recipeId: string;
  
  /** Recipe execution ID (if executed) */
  recipeExecutionId?: string;
  
  /** Step index in recipe */
  stepIndex: number;
  
  /** Workflow to execute */
  workflowId: string;
  
  /** Workflow execution ID (if executed) */
  executionId?: string;
  
  /** Execution status */
  status?: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  
  /** Input mapping from recipe context */
  inputMapping?: Record<string, string>;
  
  /** Output mapping to recipe context */
  outputMapping?: Record<string, string>;
}

export const RecipeWorkflowStepSchema = z.object({
  recipeId: z.string(),
  recipeExecutionId: z.string().optional(),
  stepIndex: z.number().int().nonnegative(),
  workflowId: z.string(),
  executionId: z.string().optional(),
  status: z.enum(['pending', 'running', 'success', 'error', 'skipped']).optional(),
  inputMapping: z.record(z.string()).optional(),
  outputMapping: z.record(z.string()).optional(),
});

// ============================================================================
// Agent Tool Definition for n8n
// ============================================================================

/**
 * Goose agent tool that can be called from n8n
 */
export interface AgentToolDefinition {
  /** Tool name */
  name: string;
  
  /** Tool description */
  description: string;
  
  /** Input parameters schema */
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      required?: boolean;
      default?: unknown;
    }>;
    required?: string[];
  };
  
  /** Output schema */
  output?: {
    type: string;
    description?: string;
  };
}

export const AgentToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.object({
    type: z.literal('object'),
    properties: z.record(z.object({
      type: z.string(),
      description: z.string().optional(),
      required: z.boolean().optional(),
      default: z.unknown().optional(),
    })),
    required: z.array(z.string()).optional(),
  }),
  output: z.object({
    type: z.string(),
    description: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Workflow Node Definition for Goose
// ============================================================================

/**
 * n8n workflow that can be called as a Goose tool
 */
export interface WorkflowNodeDefinition {
  /** Workflow ID */
  id: string;
  
  /** Workflow name */
  name: string;
  
  /** Workflow description */
  description: string;
  
  /** Input parameters */
  inputs: {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }[];
  
  /** Output structure */
  outputs: {
    name: string;
    type: string;
    description?: string;
  }[];
  
  /** Workflow tags */
  tags?: string[];
}

export const WorkflowNodeDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  inputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional(),
  })),
  outputs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  })),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// Statistics and Metrics
// ============================================================================

/**
 * Integration statistics
 */
export interface IntegrationStatistics {
  /** Total workflow executions triggered by agent */
  totalAgentWorkflowExecutions: number;
  
  /** Successful executions */
  successfulExecutions: number;
  
  /** Failed executions */
  failedExecutions: number;
  
  /** Average execution duration (ms) */
  averageDuration: number;
  
  /** Average nodes executed per workflow */
  averageNodesExecuted: number;
  
  /** Total tokens used (for agent operations) */
  totalTokensUsed: number;
  
  /** Time period for statistics */
  period: {
    from: Date;
    to: Date;
  };
}

export const IntegrationStatisticsSchema = z.object({
  totalAgentWorkflowExecutions: z.number().int().nonnegative(),
  successfulExecutions: z.number().int().nonnegative(),
  failedExecutions: z.number().int().nonnegative(),
  averageDuration: z.number().nonnegative(),
  averageNodesExecuted: z.number().nonnegative(),
  totalTokensUsed: z.number().int().nonnegative(),
  period: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

// ============================================================================
// Exports
// ============================================================================

export default {
  // Types
  WorkflowExecutionContextSchema,
  AgentWorkflowRequestSchema,
  WorkflowAgentRequestSchema,
  ExecutionResultSchema,
  IntegrationEventSchema,
  RecipeWorkflowStepSchema,
  AgentToolDefinitionSchema,
  WorkflowNodeDefinitionSchema,
  IntegrationStatisticsSchema,
  
  // Enums
  IntegrationEventType,
};
