import { BaseFeature } from './base-feature';

/**
 * Configuration for Spellbook feature
 */
export interface SpellbookConfig {
  apiUrl?: string;
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * Default configuration values
 */
const DEFAULTS = {
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Spellbook feature class following DDD patterns.
 * Implements the strangler fig pattern for gradual integration.
 */
export class SpellbookFeature extends BaseFeature {
  private static instance: SpellbookFeature | null = null;
  private readonly config: SpellbookConfig;
  private initialized = false;

  constructor(config?: SpellbookConfig) {
    super('spellbook');
    this.config = {
      apiUrl: config?.apiUrl,
      enableCache: config?.enableCache ?? DEFAULTS.enableCache,
      cacheTTL: config?.cacheTTL ?? DEFAULTS.cacheTTL,
    };
  }

  /**
   * Get singleton instance of the feature
   */
  static getInstance(config?: SpellbookConfig): SpellbookFeature {
    if (!SpellbookFeature.instance) {
      SpellbookFeature.instance = new SpellbookFeature(config);
    }
    return SpellbookFeature.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    SpellbookFeature.instance = null;
  }

  /**
   * Get the feature configuration
   */
  getConfig(): SpellbookConfig {
    return { ...this.config };
  }

  /**
   * Check if feature is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the spellbook feature
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    // Initialization logic can be added here
    this.initialized = true;
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.initialized = false;
    SpellbookFeature.instance = null;
  }
}
