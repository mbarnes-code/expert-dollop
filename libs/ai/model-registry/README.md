# ai-model-registry

Centralized AI model configuration registry for all AI services.

## Purpose

This library provides a single source of truth for AI model information across the entire monorepo. It consolidates model configurations that were previously scattered across firecrawl, goose, and n8n projects.

## What's Included

### Model Registry

- **150+ AI models** from major providers (OpenAI, Anthropic, Google, Meta)
- Model limits (input/output/total tokens)
- Pricing information (per million tokens)
- Capabilities (vision, tools, streaming, etc.)
- Provider categorization

### Token Usage Utilities

- Token usage tracking and calculation
- Cost calculation based on model pricing
- Usage formatting and reporting
- Multi-usage aggregation

## Usage

### Getting Model Information

```typescript
import {
  getModel,
  getModelLimits,
  getModelPricing,
  modelSupportsCapability,
} from '@expert-dollop/ai-model-registry';

// Get full model information
const model = getModel('gpt-4.1-mini');
console.log(model);
// {
//   id: 'gpt-4.1-mini',
//   provider: 'openai',
//   displayName: 'GPT-4.1 Mini',
//   limits: { maxInputTokens: 1000000, ... },
//   pricing: { inputTokenPrice: 0.15, ... },
//   capabilities: { supportsVision: true, ... }
// }

// Get just the limits
const limits = getModelLimits('claude-3-5-sonnet-20241022');
console.log(limits.maxInputTokens); // 200000

// Get pricing
const pricing = getModelPricing('gpt-4o');
console.log(pricing.inputTokenPrice); // 2.50 (per 1M tokens)

// Check capabilities
const supportsVision = modelSupportsCapability('gpt-4o', 'supportsVision');
console.log(supportsVision); // true
```

### Finding Models

```typescript
import {
  getModelsByProvider,
  findModelByPattern,
} from '@expert-dollop/ai-model-registry';

// Get all models from a provider
const anthropicModels = getModelsByProvider('anthropic');
console.log(anthropicModels.length); // All Anthropic models

// Fuzzy search for models
const model = findModelByPattern('claude-sonnet');
console.log(model?.id); // 'claude-3-5-sonnet-20241022'
```

### Calculating Costs

```typescript
import {
  calculateLLMCost,
  createTokenUsage,
  formatCost,
  formatTokenUsage,
} from '@expert-dollop/ai-model-registry';

// Create token usage record
const usage = createTokenUsage(10000, 2000);

// Calculate cost
const cost = calculateLLMCost(usage, 'gpt-4.1-mini');
console.log(cost); // 0.0027 (USD)

// Format for display
console.log(formatCost(cost)); // "$0.002700"
console.log(formatTokenUsage(usage)); // "12,000 tokens (10,000 in, 2,000 out)"
```

### Merging Usage Across Multiple Calls

```typescript
import { mergeTokenUsage, createTokenUsage } from '@expert-dollop/ai-model-registry';

const call1 = createTokenUsage(1000, 500);
const call2 = createTokenUsage(2000, 1000);
const call3 = createTokenUsage(500, 250);

const total = mergeTokenUsage(call1, call2, call3);
console.log(total);
// {
//   inputTokens: 3500,
//   outputTokens: 1750,
//   totalTokens: 5250
// }
```

## Model Coverage

### Providers Supported

- **OpenAI**: GPT-4, GPT-4o, GPT-4 Turbo, O3, O4, and more
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku) and Claude 3.5
- **Google**: Gemini 1.5 and 2.0 (Pro, Flash)
- **Meta**: Llama 3.1 and 3.3 series
- **Other**: Extensible for additional providers

### Model Information Available

Each model includes:
- **Limits**: Maximum input/output/total tokens
- **Pricing**: Cost per million input and output tokens
- **Capabilities**: Vision, tools, function calling, streaming, JSON mode support
- **Metadata**: Display name, provider, release date, deprecation status

## Migration Guide

### From Firecrawl

Replace this:
```typescript
// Old firecrawl code
import { modelPrices } from './lib/extract/usage/model-prices';
const limits = modelPrices['gpt-4o'];
```

With this:
```typescript
// New centralized registry
import { getModelLimits } from '@expert-dollop/ai-model-registry';
const limits = getModelLimits('gpt-4o');
```

### From Goose

Replace Rust model limits:
```rust
// Old goose code
static MODEL_SPECIFIC_LIMITS: Lazy<Vec<(&'static str, usize)>> = ...
```

With TypeScript registry access:
```typescript
import { getModelLimits } from '@expert-dollop/ai-model-registry';
```

### From n8n

Replace hardcoded model configurations:
```typescript
// Old n8n code
export const anthropicClaudeSonnet45 = () => 
  new ChatAnthropic({ model: "claude-3-5-sonnet-20241022" });
```

With registry-driven configuration:
```typescript
import { getModel } from '@expert-dollop/ai-model-registry';

const model = getModel('claude-3-5-sonnet-20241022');
export const anthropicClaudeSonnet45 = () => 
  new ChatAnthropic({ 
    model: model.id,
    // Use model.limits for token management
  });
```

## Benefits

- ✅ **Single Source of Truth**: All model info in one place
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Consistency**: Same model data across all services
- ✅ **Easy Updates**: Update model info once, affects all services
- ✅ **Cost Tracking**: Built-in cost calculation utilities
- ✅ **Extensibility**: Easy to add new models and providers

## Adding New Models

To add a new model:

```typescript
// In libs/ai/model-registry/src/lib/models.ts
export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // ... existing models ...
  
  'new-model-id': {
    id: 'new-model-id',
    provider: 'openai', // or other provider
    displayName: 'New Model Name',
    limits: {
      maxInputTokens: 100_000,
      maxOutputTokens: 10_000,
      maxTotalTokens: 110_000,
    },
    pricing: {
      inputTokenPrice: 1.00, // per 1M tokens
      outputTokenPrice: 3.00,
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
};
```

## Related

- Consolidates model configs from:
  - `features/firecrawl/apps/api/src/lib/extract/usage/model-prices.ts`
  - `features/goose/crates/goose/src/model.rs`
  - `features/n8n/packages/@n8n/ai-workflow-builder.ee/src/llm-config.ts`
- See [CONSOLIDATION_ANALYSIS.md](../../CONSOLIDATION_ANALYSIS.md) for the analysis that led to this library
- Part of the AI domain shared libraries (`libs/ai/*`)
