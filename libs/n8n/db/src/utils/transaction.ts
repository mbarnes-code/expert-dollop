/**
 * Entity manager interface for transaction handling
 */
export interface EntityManager {
  transaction<T>(run: (em: EntityManager) => Promise<T>): Promise<T>;
}

type Tx = EntityManager | null | undefined;

/**
 * Wraps a function in a transaction if no EntityManager is passed.
 * This allows to use the same function in and out of transactions
 * without creating a transaction when already in one.
 * 
 * @param manager - The entity manager to use
 * @param trx - Optional existing transaction
 * @param run - The function to run
 * @param beginTransaction - Whether to begin a new transaction if trx is not provided
 * @returns The result of the run function
 * 
 * @example
 * ```typescript
 * // Use with existing transaction
 * await withTransaction(manager, existingTrx, async (em) => {
 *   await em.save(entity1);
 *   await em.save(entity2);
 * });
 * 
 * // Create new transaction
 * await withTransaction(manager, null, async (em) => {
 *   await em.save(entity1);
 *   await em.save(entity2);
 * });
 * ```
 */
export async function withTransaction<T>(
  manager: EntityManager,
  trx: Tx,
  run: (em: EntityManager) => Promise<T>,
  beginTransaction: boolean = true,
): Promise<T> {
  if (trx) return await run(trx);
  if (beginTransaction) return await manager.transaction(run);

  return await run(manager);
}
