/**
 * Model Registry - Centralized AI Model Configuration
 * Consolidates model information from firecrawl, goose, and n8n
 */

export interface ModelCapabilities {
  supportsVision?: boolean;
  supportsTools?: boolean;
  supportsFunctionCalling?: boolean;
  supportsStreaming?: boolean;
  supportsJSON?: boolean;
}

export interface ModelPricing {
  inputTokenPrice?: number; // Price per 1M tokens
  outputTokenPrice?: number; // Price per 1M tokens
  currency?: string;
}

export interface ModelLimits {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxTotalTokens: number;
  defaultOutputTokens?: number;
}

export interface ModelInfo {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'other';
  displayName: string;
  limits: ModelLimits;
  pricing?: ModelPricing;
  capabilities?: ModelCapabilities;
  deprecated?: boolean;
  releaseDate?: string;
}

/**
 * Central registry of AI models
 * Consolidated from:
 * - features/firecrawl/apps/api/src/lib/extract/usage/model-prices.ts
 * - features/goose/crates/goose/src/model.rs
 * - features/n8n AI workflow builder configurations
 */
export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // OpenAI Models
  'gpt-5': {
    id: 'gpt-5',
    provider: 'openai',
    displayName: 'GPT-5',
    limits: {
      maxInputTokens: 272_000,
      maxOutputTokens: 16_384,
      maxTotalTokens: 288_384,
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsJSON: true,
    },
  },

  'gpt-4.1': {
    id: 'gpt-4.1',
    provider: 'openai',
    displayName: 'GPT-4.1',
    limits: {
      maxInputTokens: 1_000_000,
      maxOutputTokens: 16_384,
      maxTotalTokens: 1_016_384,
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsJSON: true,
    },
  },

  'gpt-4.1-mini': {
    id: 'gpt-4.1-mini',
    provider: 'openai',
    displayName: 'GPT-4.1 Mini',
    limits: {
      maxInputTokens: 1_000_000,
      maxOutputTokens: 16_384,
      maxTotalTokens: 1_016_384,
    },
    pricing: {
      inputTokenPrice: 0.15, // per 1M tokens
      outputTokenPrice: 0.60, // per 1M tokens
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsJSON: true,
    },
  },

  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    limits: {
      maxInputTokens: 128_000,
      maxOutputTokens: 16_384,
      maxTotalTokens: 144_384,
    },
    pricing: {
      inputTokenPrice: 2.50,
      outputTokenPrice: 10.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsJSON: true,
    },
  },

  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    limits: {
      maxInputTokens: 128_000,
      maxOutputTokens: 4_096,
      maxTotalTokens: 132_096,
    },
    pricing: {
      inputTokenPrice: 10.00,
      outputTokenPrice: 30.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
      supportsJSON: true,
    },
  },

  'o3-mini': {
    id: 'o3-mini',
    provider: 'openai',
    displayName: 'O3 Mini',
    limits: {
      maxInputTokens: 200_000,
      maxOutputTokens: 100_000,
      maxTotalTokens: 300_000,
    },
    capabilities: {
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'o4-mini': {
    id: 'o4-mini',
    provider: 'openai',
    displayName: 'O4 Mini',
    limits: {
      maxInputTokens: 200_000,
      maxOutputTokens: 100_000,
      maxTotalTokens: 300_000,
    },
    capabilities: {
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  // Anthropic Models
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    limits: {
      maxInputTokens: 200_000,
      maxOutputTokens: 8_192,
      maxTotalTokens: 208_192,
    },
    pricing: {
      inputTokenPrice: 3.00,
      outputTokenPrice: 15.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'claude-3-opus': {
    id: 'claude-3-opus',
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    limits: {
      maxInputTokens: 200_000,
      maxOutputTokens: 4_096,
      maxTotalTokens: 204_096,
    },
    pricing: {
      inputTokenPrice: 15.00,
      outputTokenPrice: 75.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Haiku',
    limits: {
      maxInputTokens: 200_000,
      maxOutputTokens: 8_192,
      maxTotalTokens: 208_192,
    },
    pricing: {
      inputTokenPrice: 0.80,
      outputTokenPrice: 4.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  // Google Models
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash (Experimental)',
    limits: {
      maxInputTokens: 1_000_000,
      maxOutputTokens: 8_192,
      maxTotalTokens: 1_008_192,
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    limits: {
      maxInputTokens: 2_000_000,
      maxOutputTokens: 8_192,
      maxTotalTokens: 2_008_192,
    },
    pricing: {
      inputTokenPrice: 1.25,
      outputTokenPrice: 5.00,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    provider: 'google',
    displayName: 'Gemini 1.5 Flash',
    limits: {
      maxInputTokens: 1_000_000,
      maxOutputTokens: 8_192,
      maxTotalTokens: 1_008_192,
    },
    pricing: {
      inputTokenPrice: 0.075,
      outputTokenPrice: 0.30,
      currency: 'USD',
    },
    capabilities: {
      supportsVision: true,
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  // Meta Models
  'llama-3.3-70b': {
    id: 'llama-3.3-70b',
    provider: 'meta',
    displayName: 'Llama 3.3 70B',
    limits: {
      maxInputTokens: 128_000,
      maxOutputTokens: 4_096,
      maxTotalTokens: 132_096,
    },
    capabilities: {
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },

  'llama-3.1-405b': {
    id: 'llama-3.1-405b',
    provider: 'meta',
    displayName: 'Llama 3.1 405B',
    limits: {
      maxInputTokens: 128_000,
      maxOutputTokens: 4_096,
      maxTotalTokens: 132_096,
    },
    capabilities: {
      supportsTools: true,
      supportsFunctionCalling: true,
      supportsStreaming: true,
    },
  },
};

/**
 * Default model limits for unknown models
 */
export const DEFAULT_MODEL_LIMITS: ModelLimits = {
  maxInputTokens: 8_192,
  maxOutputTokens: 4_096,
  maxTotalTokens: 12_288,
};

/**
 * Get model information by ID
 */
export function getModel(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Get model limits, falling back to defaults if model not found
 */
export function getModelLimits(modelId: string): ModelLimits {
  const model = getModel(modelId);
  return model?.limits || DEFAULT_MODEL_LIMITS;
}

/**
 * Get model pricing information
 */
export function getModelPricing(modelId: string): ModelPricing | undefined {
  return getModel(modelId)?.pricing;
}

/**
 * Check if a model supports a specific capability
 */
export function modelSupportsCapability(
  modelId: string,
  capability: keyof ModelCapabilities
): boolean {
  const model = getModel(modelId);
  return model?.capabilities?.[capability] === true;
}

/**
 * Get all models by provider
 */
export function getModelsByProvider(
  provider: ModelInfo['provider']
): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}

/**
 * Fuzzy match model ID (handles partial matches and variations)
 * Useful for when model names come in different formats
 */
export function findModelByPattern(pattern: string): ModelInfo | undefined {
  const lowerPattern = pattern.toLowerCase();

  // Exact match first
  const exactMatch = Object.keys(MODEL_REGISTRY).find(
    (key) => key.toLowerCase() === lowerPattern
  );
  if (exactMatch) return MODEL_REGISTRY[exactMatch];

  // Partial match
  const partialMatch = Object.keys(MODEL_REGISTRY).find((key) =>
    key.toLowerCase().includes(lowerPattern)
  );
  if (partialMatch) return MODEL_REGISTRY[partialMatch];

  return undefined;
}
