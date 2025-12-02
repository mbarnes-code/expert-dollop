import type { IDataObject } from '@expert-dollop/n8n-types';

/**
 * Abstract base class for database entity repositories.
 * Provides common CRUD operations for entities across different modules.
 * 
 * Following DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractRepository<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  protected readonly entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  /**
   * Find entity by ID
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Find all entities matching the criteria
   */
  abstract find(criteria?: IFindCriteria<T>): Promise<T[]>;

  /**
   * Find one entity matching the criteria
   */
  abstract findOne(criteria: IFindCriteria<T>): Promise<T | null>;

  /**
   * Create a new entity
   */
  abstract create(data: CreateDto): Promise<T>;

  /**
   * Update an entity by ID
   */
  abstract update(id: string, data: UpdateDto): Promise<T | null>;

  /**
   * Delete an entity by ID
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Count entities matching the criteria
   */
  abstract count(criteria?: IFindCriteria<T>): Promise<number>;

  /**
   * Check if an entity exists
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /**
   * Find or create an entity
   */
  async findOrCreate(criteria: IFindCriteria<T>, createData: CreateDto): Promise<T> {
    const existing = await this.findOne(criteria);
    if (existing) {
      return existing;
    }
    return this.create(createData);
  }
}

/**
 * Find criteria interface
 */
export interface IFindCriteria<T> {
  where?: Partial<T> | IDataObject;
  order?: { [K in keyof T]?: 'ASC' | 'DESC' };
  skip?: number;
  take?: number;
  relations?: string[];
  select?: Array<keyof T>;
}

/**
 * Pagination options
 */
export interface IPaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated result
 */
export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Helper to create paginated result
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  options: IPaginationOptions,
): IPaginatedResult<T> {
  const totalPages = Math.ceil(total / options.limit);
  return {
    items,
    total,
    page: options.page,
    limit: options.limit,
    totalPages,
    hasNext: options.page < totalPages,
    hasPrevious: options.page > 1,
  };
}
