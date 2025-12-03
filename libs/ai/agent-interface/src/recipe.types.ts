/**
 * Recipe Schema Interface
 * 
 * This module defines the shared interfaces for recipe-based workflow automation.
 * Extracted from Goose AI Agent (Phase 2 - Shared Abstractions)
 */

import { z } from 'zod';

/**
 * Recipe step parameter schema
 */
export const RecipeParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean().default(false),
  default: z.any().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.any()).optional(),
  }).optional(),
});

export type RecipeParameter = z.infer<typeof RecipeParameterSchema>;

/**
 * Recipe step condition schema
 */
export const RecipeConditionSchema = z.object({
  type: z.enum(['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'exists']),
  field: z.string(),
  value: z.any(),
});

export type RecipeCondition = z.infer<typeof RecipeConditionSchema>;

/**
 * Recipe step schema
 */
export const RecipeStepSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  tool: z.string(),
  action: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  condition: RecipeConditionSchema.optional(),
  onSuccess: z.string().optional(), // Next step ID
  onFailure: z.string().optional(), // Fallback step ID
  retry: z.object({
    maxAttempts: z.number().default(1),
    delayMs: z.number().default(1000),
  }).optional(),
  timeout: z.number().optional(), // milliseconds
});

export type RecipeStep = z.infer<typeof RecipeStepSchema>;

/**
 * Recipe metadata schema
 */
export const RecipeMetadataSchema = z.object({
  author: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
});

export type RecipeMetadata = z.infer<typeof RecipeMetadataSchema>;

/**
 * Recipe schema
 */
export const RecipeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  parameters: z.array(RecipeParameterSchema).optional(),
  steps: z.array(RecipeStepSchema),
  metadata: RecipeMetadataSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;

/**
 * Recipe execution status
 */
export enum RecipeExecutionStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/**
 * Recipe step execution result schema
 */
export const RecipeStepResultSchema = z.object({
  stepId: z.string(),
  stepName: z.string(),
  status: z.nativeEnum(RecipeExecutionStatus),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  output: z.any().optional(),
  error: z.string().optional(),
  retryCount: z.number().default(0),
});

export type RecipeStepResult = z.infer<typeof RecipeStepResultSchema>;

/**
 * Recipe execution result schema
 */
export const RecipeExecutionResultSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  recipeName: z.string(),
  status: z.nativeEnum(RecipeExecutionStatus),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  stepResults: z.array(RecipeStepResultSchema),
  context: z.record(z.any()).optional(),
  error: z.string().optional(),
});

export type RecipeExecutionResult = z.infer<typeof RecipeExecutionResultSchema>;

/**
 * Recipe Repository Interface
 * 
 * This interface defines the contract for recipe persistence.
 */
export interface RecipeRepository {
  /**
   * Save a recipe
   */
  save(recipe: Recipe): Promise<void>;

  /**
   * Find a recipe by ID
   */
  findById(id: string): Promise<Recipe | null>;

  /**
   * Find recipes by name
   */
  findByName(name: string): Promise<Recipe[]>;

  /**
   * List all recipes
   */
  list(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    tags?: string[];
  }): Promise<Recipe[]>;

  /**
   * Delete a recipe
   */
  delete(id: string): Promise<void>;

  /**
   * Update a recipe
   */
  update(id: string, updates: Partial<Recipe>): Promise<void>;
}

/**
 * Recipe Executor Interface
 * 
 * This interface defines the contract for recipe execution.
 */
export interface RecipeExecutor {
  /**
   * Execute a recipe
   */
  execute(
    recipe: Recipe,
    parameters?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<RecipeExecutionResult>;

  /**
   * Execute a recipe by ID
   */
  executeById(
    recipeId: string,
    parameters?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<RecipeExecutionResult>;

  /**
   * Cancel a running recipe execution
   */
  cancel(executionId: string): Promise<void>;

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): Promise<RecipeExecutionResult | null>;
}

/**
 * Recipe validation result
 */
export interface RecipeValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
  warnings: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Recipe Validator Interface
 */
export interface RecipeValidator {
  /**
   * Validate a recipe
   */
  validate(recipe: Recipe): RecipeValidationResult;

  /**
   * Validate recipe YAML/JSON
   */
  validateFromString(content: string, format: 'yaml' | 'json'): RecipeValidationResult;
}
