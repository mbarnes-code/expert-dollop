/**
 * Caching utility for the MTG Scripting Toolkit.
 * Provides in-memory caching with optional persistence.
 */

/**
 * Cache entry with timestamp.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache configuration options.
 */
export interface CacheConfig {
  /** Time-to-live in milliseconds */
  ttl?: number;
  /** Maximum number of entries */
  maxEntries?: number;
}

/**
 * Default cache configuration.
 */
const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 1000,
};

/**
 * Simple in-memory cache service.
 * Provides caching functionality for API responses and computed values.
 */
export class CacheService {
  private static instance: CacheService | null = null;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: Required<CacheConfig>;

  constructor(config?: CacheConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CacheService.instance = null;
  }

  /**
   * Get a value from the cache.
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set a value in the cache.
   */
  set<T>(key: string, value: T): void {
    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  /**
   * Get a cached value or compute it if not present.
   */
  async getOrCompute<T>(key: string, compute: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await compute();
    this.set(key, value);
    return value;
  }

  /**
   * Check if a key exists in the cache.
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache.
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache.
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired entries.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
