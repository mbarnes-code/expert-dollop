/**
 * Analytics Service - AI Operations Monitoring and Cost Tracking
 * 
 * This service consolidates analytics functionality from:
 * - features/firecrawl/apps/api/src/lib/extract/usage/llm-cost.ts (cost tracking)
 * - features/n8n LangSmith tracing
 * 
 * Provides centralized monitoring for LLM usage, costs, and performance.
 */

export interface TokenUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: Date;
}

export interface CostRecord {
  id: string;
  model: string;
  usage: TokenUsage;
  cost: number;
  currency: string;
  timestamp: Date;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

/**
 * Model pricing from firecrawl
 * Simplified version - full pricing in features/firecrawl/apps/api/src/lib/extract/usage/model-prices.ts
 */
const MODEL_PRICING: Record<string, {
  input_cost_per_token: number;
  output_cost_per_token: number;
}> = {
  'gpt-4.1-mini': {
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
  },
  'gpt-4o': {
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
  },
  'claude-3-5-sonnet-20241022': {
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
  },
  'gemini-2.0-flash-exp': {
    input_cost_per_token: 0,
    output_cost_per_token: 0,
  },
};

/**
 * Analytics service for tracking LLM usage and costs
 * Inspired by firecrawl's cost tracking system
 */
export class AnalyticsService {
  private records: CostRecord[] = [];

  /**
   * Calculate cost from token usage (from firecrawl's llm-cost.ts)
   */
  calculateCost(usage: TokenUsage): number {
    const pricing = MODEL_PRICING[usage.model];
    
    if (!pricing) {
      console.warn(`No pricing info for model: ${usage.model}`);
      return 0;
    }

    const inputCost = usage.promptTokens * pricing.input_cost_per_token;
    const outputCost = usage.completionTokens * pricing.output_cost_per_token;
    
    return Number((inputCost + outputCost).toFixed(7));
  }

  /**
   * Record usage and cost
   */
  recordUsage(usage: TokenUsage): CostRecord {
    const cost = this.calculateCost(usage);
    
    const record: CostRecord = {
      id: this.generateId(),
      model: usage.model,
      usage,
      cost,
      currency: 'USD',
      timestamp: new Date(),
    };

    this.records.push(record);
    return record;
  }

  /**
   * Get all records
   */
  getAllRecords(): CostRecord[] {
    return [...this.records];
  }

  /**
   * Get records for a specific time range
   */
  getRecordsByTimeRange(startDate: Date, endDate: Date): CostRecord[] {
    return this.records.filter(
      record => record.timestamp >= startDate && record.timestamp <= endDate
    );
  }

  /**
   * Get usage statistics
   */
  getStats(startDate?: Date, endDate?: Date): UsageStats {
    const records = startDate && endDate
      ? this.getRecordsByTimeRange(startDate, endDate)
      : this.records;

    const stats: UsageStats = {
      totalRequests: records.length,
      totalTokens: 0,
      totalCost: 0,
      byModel: {},
    };

    for (const record of records) {
      stats.totalTokens += record.usage.totalTokens;
      stats.totalCost += record.cost;

      if (!stats.byModel[record.model]) {
        stats.byModel[record.model] = {
          requests: 0,
          tokens: 0,
          cost: 0,
        };
      }

      stats.byModel[record.model].requests++;
      stats.byModel[record.model].tokens += record.usage.totalTokens;
      stats.byModel[record.model].cost += record.cost;
    }

    // Round total cost
    stats.totalCost = Number(stats.totalCost.toFixed(7));

    // Round per-model costs
    for (const model in stats.byModel) {
      stats.byModel[model].cost = Number(stats.byModel[model].cost.toFixed(7));
    }

    return stats;
  }

  /**
   * Get top models by usage
   */
  getTopModels(limit: number = 10): Array<{
    model: string;
    requests: number;
    tokens: number;
    cost: number;
  }> {
    const stats = this.getStats();
    
    return Object.entries(stats.byModel)
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, limit);
  }

  /**
   * Clear all records
   */
  clearRecords(): void {
    this.records = [];
  }

  /**
   * Get recent records
   */
  getRecentRecords(limit: number = 100): CostRecord[] {
    return this.records.slice(-limit).reverse();
  }

  // Helper methods

  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format cost as currency
   */
  formatCost(cost: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(cost);
  }

  /**
   * Format tokens
   */
  formatTokens(tokens: number): string {
    return tokens.toLocaleString();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

export default AnalyticsService;
