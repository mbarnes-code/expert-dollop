/**
 * Model Registry Service - Centralized Model Information
 * 
 * This service consolidates model configuration from:
 * - features/firecrawl/apps/api/src/lib/extract/usage/model-prices.ts
 * - features/goose/crates/goose/src/model.rs
 * - libs/ai/model-registry
 * 
 * Provides a centralized API for model information, pricing, and limits.
 */

import { getModel, getModelLimits, getModelPricing, MODEL_REGISTRY } from '@expert-dollop/ai-model-registry';

// Extended model pricing from firecrawl with additional fields
export interface ExtendedModelPricing {
  max_tokens: number;
  max_input_tokens: number;
  max_output_tokens: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  input_cost_per_token_batches?: number;
  output_cost_per_token_batches?: number;
  cache_read_input_token_cost?: number;
  input_cost_per_request?: number;
  litellm_provider: string;
  mode: string;
  supports_pdf_input?: boolean;
  supports_function_calling?: boolean;
  supports_parallel_function_calling?: boolean;
  supports_response_schema?: boolean;
  supports_vision?: boolean;
  supports_prompt_caching?: boolean;
  supports_system_messages?: boolean;
  supports_tool_choice?: boolean;
}

// Firecrawl model prices - subset for key models
// Full list available in features/firecrawl/apps/api/src/lib/extract/usage/model-prices.ts
export const firecrawlModelPrices: Record<string, ExtendedModelPricing> = {
  "gpt-4o": {
    max_tokens: 16384,
    max_input_tokens: 128000,
    max_output_tokens: 16384,
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    input_cost_per_token_batches: 0.00000125,
    output_cost_per_token_batches: 0.000005,
    cache_read_input_token_cost: 0.00000125,
    litellm_provider: "openai",
    mode: "chat",
    supports_pdf_input: true,
    supports_function_calling: true,
    supports_parallel_function_calling: true,
    supports_response_schema: true,
    supports_vision: true,
    supports_prompt_caching: true,
    supports_system_messages: true,
    supports_tool_choice: true,
  },
  "gpt-4.1-mini": {
    max_tokens: 16384,
    max_input_tokens: 1000000,
    max_output_tokens: 16384,
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    litellm_provider: "openai",
    mode: "chat",
    supports_function_calling: true,
    supports_parallel_function_calling: true,
    supports_response_schema: true,
    supports_vision: true,
    supports_prompt_caching: true,
    supports_system_messages: true,
    supports_tool_choice: true,
  },
  "claude-3-5-sonnet-20241022": {
    max_tokens: 8192,
    max_input_tokens: 200000,
    max_output_tokens: 8192,
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    cache_read_input_token_cost: 0.0000003,
    litellm_provider: "anthropic",
    mode: "chat",
    supports_function_calling: true,
    supports_vision: true,
    supports_prompt_caching: true,
    supports_system_messages: true,
    supports_tool_choice: true,
  },
  "gemini-2.0-flash-exp": {
    max_tokens: 8192,
    max_input_tokens: 1000000,
    max_output_tokens: 8192,
    input_cost_per_token: 0,
    output_cost_per_token: 0,
    litellm_provider: "vertex_ai-chat-models",
    mode: "chat",
    supports_function_calling: true,
    supports_vision: true,
    supports_system_messages: true,
  },
};

// Goose model context limits - from features/goose/crates/goose/src/model.rs
export const gooseModelLimits: Record<string, number> = {
  "gpt-5": 272_000,
  "gpt-4-turbo": 128_000,
  "gpt-4.1": 1_000_000,
  "gpt-4-1": 1_000_000,
  "gpt-4o": 128_000,
  "o4-mini": 200_000,
  "o3-mini": 200_000,
  "o3": 200_000,
  "claude": 200_000,
  "gemini-1.5-flash": 1_000_000,
  "gemini-1": 128_000,
  "gemini-2": 1_000_000,
  "llama-3.3-70b": 128_000,
  "llama-3.1-405b": 128_000,
};

export class ModelRegistryService {
  /**
   * Get comprehensive model information combining all sources
   */
  static getModelInfo(modelId: string) {
    const registryModel = getModel(modelId);
    const firecrawlModel = firecrawlModelPrices[modelId];
    const gooseLimit = gooseModelLimits[modelId];

    return {
      id: modelId,
      registry: registryModel,
      firecrawl: firecrawlModel,
      gooseContextLimit: gooseLimit,
      exists: !!(registryModel || firecrawlModel || gooseLimit),
    };
  }

  /**
   * Get all available models
   */
  static getAllModels() {
    const allModelIds = new Set([
      ...Object.keys(MODEL_REGISTRY),
      ...Object.keys(firecrawlModelPrices),
      ...Object.keys(gooseModelLimits),
    ]);

    return Array.from(allModelIds).map(id => this.getModelInfo(id));
  }

  /**
   * Search models by provider
   */
  static searchByProvider(provider: string) {
    return this.getAllModels().filter(model => 
      model.registry?.provider === provider ||
      model.firecrawl?.litellm_provider?.includes(provider.toLowerCase())
    );
  }

  /**
   * Get models that support specific capabilities
   */
  static getModelsWithCapability(capability: string) {
    return this.getAllModels().filter(model => {
      if (model.registry?.capabilities) {
        return model.registry.capabilities[capability as keyof typeof model.registry.capabilities];
      }
      if (model.firecrawl) {
        return model.firecrawl[`supports_${capability}` as keyof typeof model.firecrawl];
      }
      return false;
    });
  }

  /**
   * Get pricing information (combining sources)
   */
  static getPricing(modelId: string) {
    const registry = getModelPricing(modelId);
    const firecrawl = firecrawlModelPrices[modelId];

    return {
      registry,
      firecrawl: firecrawl ? {
        inputCostPerToken: firecrawl.input_cost_per_token,
        outputCostPerToken: firecrawl.output_cost_per_token,
        cacheReadCost: firecrawl.cache_read_input_token_cost,
        batchInputCost: firecrawl.input_cost_per_token_batches,
        batchOutputCost: firecrawl.output_cost_per_token_batches,
        perRequestCost: firecrawl.input_cost_per_request,
      } : undefined,
    };
  }

  /**
   * Get token limits (combining sources)
   */
  static getLimits(modelId: string) {
    const registry = getModelLimits(modelId);
    const firecrawl = firecrawlModelPrices[modelId];
    const goose = gooseModelLimits[modelId];

    return {
      registry,
      firecrawl: firecrawl ? {
        maxTokens: firecrawl.max_tokens,
        maxInputTokens: firecrawl.max_input_tokens,
        maxOutputTokens: firecrawl.max_output_tokens,
      } : undefined,
      gooseContextLimit: goose,
    };
  }
}

export default ModelRegistryService;
