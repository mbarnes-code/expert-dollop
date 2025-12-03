/**
 * Abstract store patterns for Pinia stores.
 * Provides common patterns for building reusable stores following DDD principles.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';

/**
 * Store state interface
 */
export interface IStoreState {
  [key: string]: unknown;
}

/**
 * Store action result
 */
export interface IStoreActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Store subscription handler
 */
export type StoreSubscriptionHandler<T> = (state: T) => void;

/**
 * Abstract base class for store logic
 * Provides common patterns for store state management
 */
export class AbstractStoreLogic<TState extends IStoreState> {
  protected state: Ref<TState>;
  private subscriptions: Set<StoreSubscriptionHandler<TState>> = new Set();
  private isInitialized = false;

  constructor(initialState: TState) {
    this.state = ref(initialState) as Ref<TState>;
  }

  /**
   * Get the current state
   */
  getState(): TState {
    return this.state.value;
  }

  /**
   * Update state with partial updates
   * @param updates Partial state updates
   */
  protected updateState(updates: Partial<TState>): void {
    this.state.value = { ...this.state.value, ...updates };
    this.notifySubscribers();
  }

  /**
   * Reset state to initial value
   * @param initialState Initial state to reset to
   */
  protected resetState(initialState: TState): void {
    this.state.value = initialState;
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   * @param handler Subscription handler
   * @returns Unsubscribe function
   */
  subscribe(handler: StoreSubscriptionHandler<TState>): () => void {
    this.subscriptions.add(handler);
    return () => {
      this.subscriptions.delete(handler);
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers(): void {
    for (const handler of this.subscriptions) {
      try {
        handler(this.state.value);
      } catch (error) {
        console.error('Store subscription error:', error);
      }
    }
  }

  /**
   * Initialize the store
   * Override in derived classes to add initialization logic
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.onInitialize();
    this.isInitialized = true;
  }

  /**
   * Override to add initialization logic
   */
  protected async onInitialize(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Cleanup the store
   * Override in derived classes to add cleanup logic
   */
  async cleanup(): Promise<void> {
    this.subscriptions.clear();
    await this.onCleanup();
  }

  /**
   * Override to add cleanup logic
   */
  protected async onCleanup(): Promise<void> {
    // Override in derived classes
  }
}

/**
 * Loading state for async operations in stores
 */
export interface IAsyncState {
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

/**
 * Create initial async state
 */
export function createAsyncState(): IAsyncState {
  return {
    isLoading: false,
    error: null,
    lastUpdated: null,
  };
}

/**
 * Abstract store with async operations support
 */
export abstract class AbstractAsyncStoreLogic<TState extends IStoreState & IAsyncState> 
  extends AbstractStoreLogic<TState> {

  /**
   * Execute an async action with loading state management
   * @param action Async action to execute
   */
  protected async executeAsync<T>(action: () => Promise<T>): Promise<IStoreActionResult<T>> {
    this.updateState({ isLoading: true, error: null } as Partial<TState>);
    
    try {
      const data = await action();
      this.updateState({
        isLoading: false,
        lastUpdated: new Date(),
      } as Partial<TState>);
      return { success: true, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.updateState({
        isLoading: false,
        error: err,
      } as Partial<TState>);
      return { success: false, error: err };
    }
  }

  /**
   * Clear the error state
   */
  clearError(): void {
    this.updateState({ error: null } as Partial<TState>);
  }
}

/**
 * Entity store state interface
 */
export interface IEntityState<T, TId = string> extends IAsyncState {
  entities: Map<TId, T>;
  selectedId: TId | null;
  [key: string]: unknown;
}

/**
 * Create initial entity state
 */
export function createEntityState<T, TId = string>(): IEntityState<T, TId> {
  return {
    ...createAsyncState(),
    entities: new Map(),
    selectedId: null,
  };
}

/**
 * Abstract entity store with CRUD operations
 */
export abstract class AbstractEntityStoreLogic<
  T extends { id: TId },
  TId = string,
  TState extends IEntityState<T, TId> & IStoreState = IEntityState<T, TId> & IStoreState
> extends AbstractAsyncStoreLogic<TState> {

  /**
   * Get all entities as an array
   */
  getAll(): T[] {
    return Array.from(this.state.value.entities.values());
  }

  /**
   * Get entity by ID
   * @param id Entity ID
   */
  getById(id: TId): T | undefined {
    return this.state.value.entities.get(id);
  }

  /**
   * Get the selected entity
   */
  getSelected(): T | undefined {
    const { selectedId, entities } = this.state.value;
    return selectedId ? entities.get(selectedId) : undefined;
  }

  /**
   * Set the selected entity
   * @param id Entity ID to select
   */
  select(id: TId | null): void {
    this.updateState({ selectedId: id } as Partial<TState>);
  }

  /**
   * Add or update an entity
   * @param entity Entity to add or update
   */
  upsert(entity: T): void {
    const entities = new Map(this.state.value.entities);
    entities.set(entity.id, entity);
    this.updateState({ entities } as Partial<TState>);
  }

  /**
   * Add or update multiple entities
   * @param newEntities Entities to add or update
   */
  upsertMany(newEntities: T[]): void {
    const entities = new Map(this.state.value.entities);
    for (const entity of newEntities) {
      entities.set(entity.id, entity);
    }
    this.updateState({ entities } as Partial<TState>);
  }

  /**
   * Remove an entity by ID
   * @param id Entity ID to remove
   */
  remove(id: TId): void {
    const entities = new Map(this.state.value.entities);
    entities.delete(id);
    const updates: Partial<TState> = { entities } as Partial<TState>;
    if (this.state.value.selectedId === id) {
      (updates as Partial<IEntityState<T, TId>>).selectedId = null;
    }
    this.updateState(updates);
  }

  /**
   * Remove multiple entities by IDs
   * @param ids Entity IDs to remove
   */
  removeMany(ids: TId[]): void {
    const entities = new Map(this.state.value.entities);
    for (const id of ids) {
      entities.delete(id);
    }
    const updates: Partial<TState> = { entities } as Partial<TState>;
    if (this.state.value.selectedId && ids.includes(this.state.value.selectedId)) {
      (updates as Partial<IEntityState<T, TId>>).selectedId = null;
    }
    this.updateState(updates);
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.updateState({
      entities: new Map(),
      selectedId: null,
    } as Partial<TState>);
  }

  /**
   * Check if an entity exists
   * @param id Entity ID to check
   */
  has(id: TId): boolean {
    return this.state.value.entities.has(id);
  }

  /**
   * Get entity count
   */
  count(): number {
    return this.state.value.entities.size;
  }

  /**
   * Find entities matching a predicate
   * @param predicate Filter predicate
   */
  find(predicate: (entity: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Find first entity matching a predicate
   * @param predicate Filter predicate
   */
  findFirst(predicate: (entity: T) => boolean): T | undefined {
    return this.getAll().find(predicate);
  }
}

/**
 * Pagination state interface
 */
export interface IPaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Create initial pagination state
 */
export function createPaginationState(pageSize = 20): IPaginationState {
  return {
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  };
}

/**
 * Abstract paginated store
 */
export abstract class AbstractPaginatedStoreLogic<
  T extends { id: TId },
  TId = string,
  TState extends IEntityState<T, TId> & { pagination: IPaginationState } & IStoreState = 
    IEntityState<T, TId> & { pagination: IPaginationState } & IStoreState
> extends AbstractEntityStoreLogic<T, TId, TState> {

  /**
   * Set current page
   * @param page Page number
   */
  setPage(page: number): void {
    const pagination = { ...this.state.value.pagination, page };
    this.updateState({ pagination } as Partial<TState>);
  }

  /**
   * Set page size
   * @param pageSize Page size
   */
  setPageSize(pageSize: number): void {
    const pagination = { ...this.state.value.pagination, pageSize, page: 1 };
    this.updateState({ pagination } as Partial<TState>);
  }

  /**
   * Update pagination info from API response
   * @param totalItems Total number of items
   */
  updatePagination(totalItems: number): void {
    const { pageSize } = this.state.value.pagination;
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = { ...this.state.value.pagination, totalItems, totalPages };
    this.updateState({ pagination } as Partial<TState>);
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const { page, totalPages } = this.state.value.pagination;
    if (page < totalPages) {
      this.setPage(page + 1);
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    const { page } = this.state.value.pagination;
    if (page > 1) {
      this.setPage(page - 1);
    }
  }

  /**
   * Check if there is a next page
   */
  hasNextPage(): boolean {
    const { page, totalPages } = this.state.value.pagination;
    return page < totalPages;
  }

  /**
   * Check if there is a previous page
   */
  hasPreviousPage(): boolean {
    return this.state.value.pagination.page > 1;
  }

  /**
   * Get current page items (for client-side pagination)
   */
  getPageItems(): T[] {
    const { page, pageSize } = this.state.value.pagination;
    const all = this.getAll();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return all.slice(start, end);
  }
}

/**
 * Root store state interface
 */
export interface IRootStoreState extends IAsyncState {
  isInitialized: boolean;
  version: string;
  [key: string]: unknown;
}

/**
 * Create initial root store state
 */
export function createRootStoreState(version = '1.0.0'): IRootStoreState {
  return {
    ...createAsyncState(),
    isInitialized: false,
    version,
  };
}

/**
 * Abstract root store for application-level state
 */
export abstract class AbstractRootStoreLogic<
  TState extends IRootStoreState & IStoreState = IRootStoreState & IStoreState
> extends AbstractAsyncStoreLogic<TState> {

  /**
   * Check if the store is initialized
   */
  checkInitialized(): boolean {
    return this.state.value.isInitialized;
  }

  /**
   * Get the store version
   */
  getVersion(): string {
    return this.state.value.version;
  }

  /**
   * Mark the store as initialized
   */
  protected markInitialized(): void {
    this.updateState({ isInitialized: true } as Partial<TState>);
  }

  /**
   * Reset the entire store
   */
  reset(): void {
    this.resetState({
      ...createAsyncState(),
      isInitialized: false,
      version: this.state.value.version,
    } as TState);
  }
}

/**
 * Meta tag configuration for SEO
 */
export interface IMetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

/**
 * Apply meta tags to the document
 * @param config Meta tag configuration
 */
export function applyMetaTags(config: IMetaTagConfig): void {
  if (typeof document === 'undefined') return;

  if (config.title) {
    document.title = config.title;
  }

  const setMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`) ||
              document.querySelector(`meta[property="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        tag.setAttribute('property', name);
      } else {
        tag.setAttribute('name', name);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  if (config.description) {
    setMetaTag('description', config.description);
  }

  if (config.keywords?.length) {
    setMetaTag('keywords', config.keywords.join(', '));
  }

  if (config.ogTitle) {
    setMetaTag('og:title', config.ogTitle);
  }

  if (config.ogDescription) {
    setMetaTag('og:description', config.ogDescription);
  }

  if (config.ogImage) {
    setMetaTag('og:image', config.ogImage);
  }

  if (config.twitterCard) {
    setMetaTag('twitter:card', config.twitterCard);
  }
}
