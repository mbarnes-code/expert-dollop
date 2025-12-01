/**
 * Event system for n8n server.
 * Provides event-driven architecture utilities.
 */

/**
 * Event types for the n8n server.
 */
export interface N8nServerEvents {
  // Server lifecycle
  'server-started': { port: number; host: string };
  'server-stopping': undefined;
  'server-stopped': undefined;

  // Workflow events
  'workflow-created': { id: string; name: string };
  'workflow-updated': { id: string; name: string };
  'workflow-deleted': { id: string };
  'workflow-activated': { id: string };
  'workflow-deactivated': { id: string };

  // Execution events
  'execution-started': { id: string; workflowId: string; mode: string };
  'execution-finished': { id: string; workflowId: string; success: boolean };
  'execution-error': { id: string; workflowId: string; error: string };
  'execution-cancelled': { id: string; workflowId: string };

  // User events
  'user-created': { id: string; email: string };
  'user-updated': { id: string };
  'user-deleted': { id: string };
  'user-signed-in': { id: string };
  'user-signed-out': { id: string };

  // Credential events
  'credential-created': { id: string; type: string };
  'credential-updated': { id: string };
  'credential-deleted': { id: string };

  // Webhook events
  'webhook-received': { path: string; method: string; workflowId?: string };
  'webhook-processed': { path: string; executionId?: string };

  // Node events
  'node-executed': { nodeId: string; nodeName: string; workflowId: string };
  'node-error': { nodeId: string; nodeName: string; error: string };
}

/**
 * Event handler type.
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Event emitter interface.
 */
export interface IEventEmitter<Events extends Record<string, unknown>> {
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
}

/**
 * Simple event emitter implementation.
 */
export class EventEmitter<Events extends Record<string, unknown>>
  implements IEventEmitter<Events>
{
  private handlers = new Map<keyof Events, Set<EventHandler<unknown>>>();

  /**
   * Register an event handler.
   */
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);
  }

  /**
   * Remove an event handler.
   */
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
  }

  /**
   * Emit an event.
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      }
    }
  }

  /**
   * Register a one-time event handler.
   */
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const wrapper: EventHandler<Events[K]> = (data) => {
      this.off(event, wrapper);
      handler(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove all handlers for an event.
   */
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

/**
 * Event service for n8n server events.
 */
export class EventService extends EventEmitter<N8nServerEvents> {
  private static instance: EventService;

  private constructor() {
    super();
  }

  /**
   * Get the singleton instance.
   */
  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }
}

/**
 * Event relay interface for forwarding events.
 */
export interface IEventRelay {
  /**
   * Initialize the relay.
   */
  init(): Promise<void>;

  /**
   * Shutdown the relay.
   */
  shutdown(): Promise<void>;
}

/**
 * Abstract event relay class.
 * Extend this to create event relays (e.g., for logging, metrics, webhooks).
 */
export abstract class AbstractEventRelay implements IEventRelay {
  protected eventService: EventService;

  constructor() {
    this.eventService = EventService.getInstance();
  }

  /**
   * Initialize the relay and subscribe to events.
   */
  abstract init(): Promise<void>;

  /**
   * Shutdown the relay and cleanup subscriptions.
   */
  abstract shutdown(): Promise<void>;

  /**
   * Subscribe to an event.
   */
  protected subscribe<K extends keyof N8nServerEvents>(
    event: K,
    handler: EventHandler<N8nServerEvents[K]>,
  ): void {
    this.eventService.on(event, handler);
  }

  /**
   * Unsubscribe from an event.
   */
  protected unsubscribe<K extends keyof N8nServerEvents>(
    event: K,
    handler: EventHandler<N8nServerEvents[K]>,
  ): void {
    this.eventService.off(event, handler);
  }
}

/**
 * Logging event relay.
 * Logs all events to the console or a logger.
 */
export class LoggingEventRelay extends AbstractEventRelay {
  private logger: {
    info: (message: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, meta?: Record<string, unknown>) => void;
  };

  private handlers: Map<keyof N8nServerEvents, EventHandler<unknown>> = new Map();

  constructor(logger?: {
    info: (message: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, meta?: Record<string, unknown>) => void;
  }) {
    super();
    this.logger = logger ?? console;
  }

  async init(): Promise<void> {
    const events: (keyof N8nServerEvents)[] = [
      'server-started',
      'workflow-created',
      'workflow-activated',
      'execution-started',
      'execution-finished',
      'execution-error',
    ];

    for (const event of events) {
      const handler = (data: unknown) => {
        this.logger.info(`Event: ${event}`, data as Record<string, unknown>);
      };
      this.handlers.set(event, handler);
      this.subscribe(event, handler as EventHandler<N8nServerEvents[typeof event]>);
    }
  }

  async shutdown(): Promise<void> {
    for (const [event, handler] of this.handlers) {
      this.unsubscribe(event, handler as EventHandler<N8nServerEvents[typeof event]>);
    }
    this.handlers.clear();
  }
}

/**
 * Metrics event relay.
 * Collects metrics from events for monitoring.
 */
export class MetricsEventRelay extends AbstractEventRelay {
  private metrics: {
    executionsTotal: number;
    executionsSuccess: number;
    executionsError: number;
    workflowsActive: number;
  } = {
    executionsTotal: 0,
    executionsSuccess: 0,
    executionsError: 0,
    workflowsActive: 0,
  };

  private handlers: Map<keyof N8nServerEvents, EventHandler<unknown>> = new Map();

  async init(): Promise<void> {
    this.handlers.set('execution-started', () => {
      this.metrics.executionsTotal++;
    });

    this.handlers.set('execution-finished', (data: unknown) => {
      const { success } = data as { success: boolean };
      if (success) {
        this.metrics.executionsSuccess++;
      } else {
        this.metrics.executionsError++;
      }
    });

    this.handlers.set('workflow-activated', () => {
      this.metrics.workflowsActive++;
    });

    this.handlers.set('workflow-deactivated', () => {
      this.metrics.workflowsActive = Math.max(0, this.metrics.workflowsActive - 1);
    });

    for (const [event, handler] of this.handlers) {
      this.subscribe(event, handler as EventHandler<N8nServerEvents[typeof event]>);
    }
  }

  async shutdown(): Promise<void> {
    for (const [event, handler] of this.handlers) {
      this.unsubscribe(event, handler as EventHandler<N8nServerEvents[typeof event]>);
    }
    this.handlers.clear();
  }

  /**
   * Get current metrics.
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }
}
