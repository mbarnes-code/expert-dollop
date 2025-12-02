import type { Constructable } from '@expert-dollop/n8n-di';

/**
 * Input parameters passed to a context establishment hook during execution.
 *
 * Hooks receive the current workflow state and extract information from
 * trigger items to build the execution context (e.g., credentials, environment).
 */
export type ContextEstablishmentOptions = {
  /** The trigger node that initiated the workflow execution */
  triggerNode: unknown;

  /** The complete workflow definition */
  workflow: unknown;

  /**
   * Trigger items from the workflow execution start.
   * Hooks can extract data from these items and optionally modify them.
   */
  triggerItems: unknown[] | null;

  /**
   * The plaintext execution context built so far.
   */
  context: Record<string, unknown>;

  /**
   * Hook-specific configuration provided by the trigger node.
   */
  options?: Record<string, unknown>;
};

/**
 * Result returned by a context establishment hook after execution.
 */
export type ContextEstablishmentResult = {
  /**
   * The potentially modified trigger items.
   */
  triggerItems?: unknown[];

  /**
   * Partial context update to merge into the execution context.
   */
  contextUpdate?: Record<string, unknown>;
};

/**
 * Metadata describing a context establishment hook.
 */
export type HookDescription = {
  /**
   * Unique identifier for this hook type.
   */
  name: string;

  /**
   * Human-readable display name for the hook.
   */
  displayName?: string;

  /**
   * Hook-specific configuration options.
   */
  options?: unknown[];
};

/**
 * Interface for context establishment hooks that extract data from trigger
 * items and extend the execution context during workflow initialization.
 */
export interface IContextEstablishmentHook {
  /**
   * Self-describing metadata for this hook instance.
   */
  hookDescription: HookDescription;

  /**
   * Executes the hook to extract context data from trigger information.
   */
  execute(options: ContextEstablishmentOptions): Promise<ContextEstablishmentResult>;

  /**
   * Determines if this hook is applicable to a specific trigger node type.
   */
  isApplicableToTriggerNode(nodeType: string): boolean;

  /**
   * Optional hook initialization method called during registry setup.
   */
  init?(): Promise<void>;
}

/**
 * Type representing the constructor/class of a context establishment hook.
 */
export type ContextEstablishmentHookClass = Constructable<IContextEstablishmentHook>;
