/**
 * Token usage calculation utilities
 * Consolidated from firecrawl token tracking
 */

import { getModelPricing } from './models';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Calculate LLM cost based on token usage and model
 * @param usage Token usage statistics
 * @param modelId Model identifier
 * @returns Cost in USD
 */
export function calculateLLMCost(usage: TokenUsage, modelId: string): number {
  const pricing = getModelPricing(modelId);
  
  if (!pricing || !pricing.inputTokenPrice || !pricing.outputTokenPrice) {
    return 0;
  }

  const inputCost = (usage.inputTokens / 1_000_000) * pricing.inputTokenPrice;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.outputTokenPrice;

  return inputCost + outputCost;
}

/**
 * Create a token usage object
 */
export function createTokenUsage(
  inputTokens: number,
  outputTokens: number
): TokenUsage {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * Merge multiple token usage records
 */
export function mergeTokenUsage(...usages: TokenUsage[]): TokenUsage {
  return usages.reduce(
    (acc, usage) => ({
      inputTokens: acc.inputTokens + usage.inputTokens,
      outputTokens: acc.outputTokens + usage.outputTokens,
      totalTokens: acc.totalTokens + usage.totalTokens,
    }),
    createTokenUsage(0, 0)
  );
}

/**
 * Format token usage as a human-readable string
 */
export function formatTokenUsage(usage: TokenUsage): string {
  return `${usage.totalTokens.toLocaleString()} tokens (${usage.inputTokens.toLocaleString()} in, ${usage.outputTokens.toLocaleString()} out)`;
}

/**
 * Format cost as currency
 */
export function formatCost(cost: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(cost);
}
