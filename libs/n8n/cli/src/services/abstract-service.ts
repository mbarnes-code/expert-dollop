/**
 * Abstract service classes for n8n applications.
 * Provides common patterns for building services following DDD principles.
 */

/**
 * Service lifecycle states
 */
export type ServiceState = 'uninitialized' | 'initializing' | 'ready' | 'stopping' | 'stopped';

/**
 * Service interface for lifecycle management
 */
export interface IService {
  /**
   * Get the service name
   */
  getName(): string;

  /**
   * Get the current service state
   */
  getState(): ServiceState;

  /**
   * Initialize the service
   */
  initialize(): Promise<void>;

  /**
   * Stop the service
   */
  stop(): Promise<void>;
}

/**
 * Abstract base class for services
 */
export abstract class AbstractService implements IService {
  protected state: ServiceState = 'uninitialized';

  /**
   * Get the service name
   */
  abstract getName(): string;

  /**
   * Get the current service state
   */
  getState(): ServiceState {
    return this.state;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.state !== 'uninitialized') {
      return;
    }
    this.state = 'initializing';
    try {
      await this.onInitialize();
      this.state = 'ready';
    } catch (error) {
      this.state = 'uninitialized';
      throw error;
    }
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    if (this.state !== 'ready') {
      return;
    }
    this.state = 'stopping';
    try {
      await this.onStop();
      this.state = 'stopped';
    } catch (error) {
      this.state = 'ready';
      throw error;
    }
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.state === 'ready';
  }

  /**
   * Override to add initialization logic
   */
  protected async onInitialize(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Override to add cleanup logic
   */
  protected async onStop(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param meta Optional metadata
   */
  protected log(message: string, meta?: Record<string, unknown>): void {
    console.log(`[${this.getName()}] ${message}`, meta ?? '');
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param error Optional error object
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[${this.getName()}] ERROR: ${message}`, error ?? '');
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param meta Optional metadata
   */
  protected logWarn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${this.getName()}] WARN: ${message}`, meta ?? '');
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param meta Optional metadata
   */
  protected logDebug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[${this.getName()}] DEBUG: ${message}`, meta ?? '');
  }
}

/**
 * Abstract base class for singleton services
 */
export abstract class AbstractSingletonService extends AbstractService {
  private static instances = new Map<Function, AbstractSingletonService>();

  /**
   * Get the singleton instance
   */
  static getInstance<T extends AbstractSingletonService>(this: new () => T): T {
    const existingInstance = AbstractSingletonService.instances.get(this);
    if (existingInstance) {
      return existingInstance as T;
    }
    const instance = new this();
    AbstractSingletonService.instances.set(this, instance);
    return instance;
  }

  /**
   * Clear all singleton instances (for testing)
   */
  static clearInstances(): void {
    AbstractSingletonService.instances.clear();
  }
}

/**
 * Abstract base class for cached services
 * Provides caching functionality for service results
 */
export abstract class AbstractCachedService extends AbstractService {
  private cache = new Map<string, { value: unknown; expiresAt: number }>();
  private defaultTtlMs = 60000; // 1 minute default

  /**
   * Set the default cache TTL in milliseconds
   * @param ttlMs TTL in milliseconds
   */
  setDefaultTtl(ttlMs: number): void {
    this.defaultTtlMs = ttlMs;
  }

  /**
   * Get a cached value
   * @param key Cache key
   */
  protected getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  /**
   * Set a cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs TTL in milliseconds (optional, uses default if not provided)
   */
  protected setCached<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalidate a cached value
   * @param key Cache key
   */
  protected invalidateCached(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  protected clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get or set a cached value
   * @param key Cache key
   * @param factory Factory function to create value if not cached
   * @param ttlMs TTL in milliseconds
   */
  protected async getOrSetCached<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    const cached = this.getCached<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await factory();
    this.setCached(key, value, ttlMs);
    return value;
  }

  override async onStop(): Promise<void> {
    this.clearCache();
  }
}

/**
 * Abstract base class for event-emitting services
 */
export abstract class AbstractEventService extends AbstractService {
  private listeners = new Map<string, Array<(data: unknown) => void>>();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param handler Event handler
   */
  on<T>(event: string, handler: (data: T) => void): () => void {
    const handlers = this.listeners.get(event) ?? [];
    handlers.push(handler as (data: unknown) => void);
    this.listeners.set(event, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.listeners.get(event) ?? [];
      const index = currentHandlers.indexOf(handler as (data: unknown) => void);
      if (index > -1) {
        currentHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to an event (one-time)
   * @param event Event name
   * @param handler Event handler
   */
  once<T>(event: string, handler: (data: T) => void): () => void {
    const unsubscribe = this.on(event, (data: T) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Event data
   */
  protected emit<T>(event: string, data: T): void {
    const handlers = this.listeners.get(event) ?? [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        this.logError(`Error in event handler for ${event}`, error);
      }
    }
  }

  /**
   * Remove all listeners for an event
   * @param event Event name
   */
  protected removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  override async onStop(): Promise<void> {
    this.removeAllListeners();
  }
}

/**
 * Abstract base class for repository services
 * Provides common CRUD operations pattern
 */
export abstract class AbstractRepositoryService<TEntity, TId = string> extends AbstractService {
  /**
   * Find an entity by ID
   * @param id Entity ID
   */
  abstract findById(id: TId): Promise<TEntity | null>;

  /**
   * Find all entities
   * @param options Query options
   */
  abstract findAll(options?: {
    skip?: number;
    take?: number;
    where?: Partial<TEntity>;
  }): Promise<TEntity[]>;

  /**
   * Create a new entity
   * @param data Entity data
   */
  abstract create(data: Partial<TEntity>): Promise<TEntity>;

  /**
   * Update an entity
   * @param id Entity ID
   * @param data Update data
   */
  abstract update(id: TId, data: Partial<TEntity>): Promise<TEntity | null>;

  /**
   * Delete an entity
   * @param id Entity ID
   */
  abstract delete(id: TId): Promise<boolean>;

  /**
   * Count entities
   * @param where Optional filter
   */
  abstract count(where?: Partial<TEntity>): Promise<number>;
}

/**
 * Abstract base class for queue services
 */
export abstract class AbstractQueueService extends AbstractService {
  /**
   * Add a job to the queue
   * @param name Job name
   * @param data Job data
   * @param options Job options
   */
  abstract add<T>(
    name: string,
    data: T,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    },
  ): Promise<string>;

  /**
   * Process jobs from the queue
   * @param name Job name
   * @param handler Job handler
   */
  abstract process<T>(
    name: string,
    handler: (job: { id: string; data: T }) => Promise<void>,
  ): void;

  /**
   * Remove a job from the queue
   * @param jobId Job ID
   */
  abstract remove(jobId: string): Promise<void>;

  /**
   * Get queue statistics
   */
  abstract getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }>;
}

/**
 * Service registry for managing service instances
 */
export class ServiceRegistry {
  private services = new Map<string, AbstractService>();

  /**
   * Register a service
   * @param service Service instance
   */
  register(service: AbstractService): void {
    this.services.set(service.getName(), service);
  }

  /**
   * Get a service by name
   * @param name Service name
   */
  get<T extends AbstractService>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Check if a service is registered
   * @param name Service name
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Initialize all registered services
   */
  async initializeAll(): Promise<void> {
    for (const service of this.services.values()) {
      await service.initialize();
    }
  }

  /**
   * Stop all registered services
   */
  async stopAll(): Promise<void> {
    for (const service of this.services.values()) {
      await service.stop();
    }
  }

  /**
   * Get all service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get all services
   */
  getAll(): Map<string, AbstractService> {
    return new Map(this.services);
  }
}
