/**
 * Abstract repository base class following the Repository pattern
 * Provides a standard interface for data access operations
 */
export abstract class AbstractRepository<T, ID = string> {
  /**
   * Find an entity by its ID
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * Find all entities
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Find entities by a filter condition
   */
  abstract findBy(where: Partial<T>): Promise<T[]>;

  /**
   * Find a single entity by a filter condition
   */
  abstract findOneBy(where: Partial<T>): Promise<T | null>;

  /**
   * Save an entity (create or update)
   */
  abstract save(entity: T): Promise<T>;

  /**
   * Save multiple entities
   */
  abstract saveMany(entities: T[]): Promise<T[]>;

  /**
   * Delete an entity by ID
   */
  abstract deleteById(id: ID): Promise<void>;

  /**
   * Delete entities by filter condition
   */
  abstract deleteBy(where: Partial<T>): Promise<void>;

  /**
   * Count all entities
   */
  abstract count(): Promise<number>;

  /**
   * Count entities by filter condition
   */
  abstract countBy(where: Partial<T>): Promise<number>;

  /**
   * Check if an entity exists by ID
   */
  abstract exists(id: ID): Promise<boolean>;
}
