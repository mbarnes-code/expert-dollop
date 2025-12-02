import { Service } from '@expert-dollop/n8n-di';

import type { Class } from '../types';

export type LifecycleHandlerClass = Class<
  Record<string, (ctx: LifecycleContext) => Promise<void> | void>
>;

export type NodeExecuteBeforeContext = {
  type: 'nodeExecuteBefore';
  workflow: unknown;
  nodeName: string;
  taskData: unknown;
};

export type NodeExecuteAfterContext = {
  type: 'nodeExecuteAfter';
  workflow: unknown;
  nodeName: string;
  taskData: unknown;
  executionData: unknown;
};

export type WorkflowExecuteBeforeContext = {
  type: 'workflowExecuteBefore';
  workflow: unknown;
  workflowInstance: unknown;
  executionData?: unknown;
};

export type WorkflowExecuteAfterContext = {
  type: 'workflowExecuteAfter';
  workflow: unknown;
  runData: unknown;
  newStaticData: Record<string, unknown>;
};

/** Context arg passed to a lifecycle event handler method. */
export type LifecycleContext =
  | NodeExecuteBeforeContext
  | NodeExecuteAfterContext
  | WorkflowExecuteBeforeContext
  | WorkflowExecuteAfterContext;

type LifecycleHandler = {
  /** Class holding the method to call on a lifecycle event. */
  handlerClass: LifecycleHandlerClass;

  /** Name of the method to call on a lifecycle event. */
  methodName: string;

  /** Name of the lifecycle event to listen to. */
  eventName: LifecycleEvent;
};

export type LifecycleEvent = LifecycleContext['type'];

@Service()
export class LifecycleMetadata {
  private readonly handlers: LifecycleHandler[] = [];

  register(handler: LifecycleHandler) {
    this.handlers.push(handler);
  }

  getHandlers(): LifecycleHandler[] {
    return this.handlers;
  }
}
