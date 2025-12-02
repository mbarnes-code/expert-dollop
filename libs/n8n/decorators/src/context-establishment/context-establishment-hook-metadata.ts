import { Container, Service } from '@expert-dollop/n8n-di';

import { ContextEstablishmentHookClass } from './context-establishment-hook';

/**
 * Registry entry for a context establishment hook.
 */
type ContextEstablishmentHookEntry = {
  /** The hook class constructor for DI container instantiation */
  class: ContextEstablishmentHookClass;
};

/**
 * Low-level metadata registry for context establishment hooks.
 */
@Service()
export class ContextEstablishmentHookMetadata {
  /**
   * Internal collection of registered hook classes.
   */
  private readonly contextEstablishmentHooks: Set<ContextEstablishmentHookEntry> = new Set();

  /**
   * Registers a hook class in the metadata collection.
   */
  register(hookEntry: ContextEstablishmentHookEntry) {
    this.contextEstablishmentHooks.add(hookEntry);
  }

  /**
   * Retrieves all registered hook entries.
   */
  getEntries() {
    return [...this.contextEstablishmentHooks.entries()];
  }

  /**
   * Retrieves all registered hook classes.
   */
  getClasses() {
    return [...this.contextEstablishmentHooks.values()].map((entry) => entry.class);
  }
}

/**
 * Class decorator for context establishment hooks.
 *
 * This decorator performs two critical functions:
 * 1. Registers the hook class in ContextEstablishmentHookMetadata for discovery
 * 2. Enables DI by applying @Service() to make the hook injectable
 *
 * @example
 * ```typescript
 * @ContextEstablishmentHook()
 * export class BearerTokenHook implements IContextEstablishmentHook {
 *   hookDescription = {
 *     name: 'credentials.bearerToken'
 *   };
 *
 *   async execute(options: ContextEstablishmentOptions) {
 *     // Hook implementation
 *   }
 *
 *   isApplicableToTriggerNode(nodeType: string) {
 *     return nodeType === 'n8n-nodes-base.webhook';
 *   }
 * }
 * ```
 */
export const ContextEstablishmentHook =
  <T extends ContextEstablishmentHookClass>() =>
  (target: T) => {
    // Register hook class in metadata for discovery by Hook Registry
    Container.get(ContextEstablishmentHookMetadata).register({
      class: target,
    });

    // Enable dependency injection for the hook class
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Service()(target);
  };
