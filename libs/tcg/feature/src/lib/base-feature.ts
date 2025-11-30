/**
 * Abstract base class for feature components.
 * Provides common patterns for domain-driven design.
 */
export abstract class BaseFeature {
  protected readonly featureName: string;

  constructor(featureName: string) {
    this.featureName = featureName;
  }

  /**
   * Get the feature name for logging/identification
   */
  getName(): string {
    return this.featureName;
  }

  /**
   * Initialize the feature - override in subclasses for setup logic
   */
  abstract initialize(): Promise<void>;

  /**
   * Clean up resources - override in subclasses for cleanup logic
   */
  abstract dispose(): Promise<void>;
}
