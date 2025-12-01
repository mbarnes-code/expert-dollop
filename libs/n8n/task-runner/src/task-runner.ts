/**
 * Abstract base class for task runners.
 * Provides WebSocket connection to the task broker and task lifecycle management.
 */
import { EventEmitter } from 'node:events';
import { ApplicationError } from '@expert-dollop/n8n-errors';

import type { BaseRunnerConfig } from './config/base-runner-config';
import type { BrokerMessage, RunnerMessage } from './message-types';
import { TaskRunnerNodeTypes } from './node-types';
import type { TaskResultData, INodeTypeDescription } from './runner-types';
import { TaskState } from './task-state';

const OFFER_VALID_TIME_MS = 5000;
const OFFER_VALID_EXTRA_MS = 100;

/** Converts milliseconds to nanoseconds */
const msToNs = (ms: number) => BigInt(ms * 1_000_000);

/** No-operation function */
export const noOp = () => {};

/**
 * Generates a random integer between 0 (inclusive) and max (exclusive).
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Ensures a value is an Error instance.
 */
function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  return new Error(String(value));
}

/**
 * Generates a unique identifier.
 * NOTE: This is a simplified implementation for the abstracted SDK.
 * In production usage, the actual nanoid library should be used instead.
 * 
 * TODO: Replace with actual nanoid import when integrating with n8n.
 */
function nanoid(): string {
  // Use crypto.randomUUID if available for better entropy
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 21);
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Represents a task offer to the broker.
 */
export interface TaskOffer {
  offerId: string;
  validUntil: bigint;
}

/**
 * Data request tracking.
 */
interface DataRequest {
  taskId: string;
  requestId: string;
  resolve: (data: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * Node types request tracking.
 */
interface NodeTypesRequest {
  taskId: string;
  requestId: string;
  resolve: (data: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * RPC call tracking.
 */
interface RPCCall {
  callId: string;
  resolve: (data: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * Parameters the task receives when it is executed.
 */
export interface TaskParams<T = unknown> {
  taskId: string;
  settings: T;
}

/**
 * Options for creating a task runner.
 */
export interface TaskRunnerOpts extends BaseRunnerConfig {
  taskType: string;
  name?: string;
}

/**
 * WebSocket interface (simplified for type safety).
 */
interface WebSocketLike {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: string, listener: (event: unknown) => void, options?: { once?: boolean }): void;
  removeEventListener(type: string, listener: (event: unknown) => void): void;
  once(event: string, listener: () => void): void;
}

/**
 * Abstract base class for all task runners.
 * Provides:
 * - WebSocket connection to the task broker
 * - Task lifecycle management (offers, acceptance, execution, completion)
 * - RPC call handling
 * - Data request handling
 * - Node type caching
 *
 * Subclasses must implement the `executeTask` method.
 */
export abstract class TaskRunner extends EventEmitter {
  /** Unique identifier for this runner instance */
  id: string = nanoid();

  /** WebSocket connection to the broker */
  ws: WebSocketLike | null = null;

  /** Whether the runner can send task offers */
  canSendOffers = false;

  /** Currently running tasks */
  runningTasks: Map<string, TaskState> = new Map();

  /** Interval for sending task offers */
  offerInterval: NodeJS.Timeout | undefined;

  /** Open task offers waiting for acceptance */
  openOffers: Map<string, TaskOffer> = new Map();

  /** Pending data requests */
  dataRequests: Map<string, DataRequest> = new Map();

  /** Pending node types requests */
  nodeTypesRequests: Map<string, NodeTypesRequest> = new Map();

  /** Pending RPC calls */
  rpcCalls: Map<string, RPCCall> = new Map();

  /** Node type registry */
  nodeTypes: TaskRunnerNodeTypes = new TaskRunnerNodeTypes([]);

  /** Type of tasks this runner handles */
  taskType: string;

  /** Maximum concurrent tasks */
  maxConcurrency: number;

  /** Display name for this runner */
  name: string;

  /** Idle timer for auto-shutdown */
  private idleTimer: NodeJS.Timeout | undefined;

  /** How long (in seconds) a task is allowed to take for completion */
  protected readonly taskTimeout: number;

  /** How long (in seconds) a runner may be idle before exit */
  private readonly idleTimeout: number;

  constructor(opts: TaskRunnerOpts) {
    super();

    this.taskType = opts.taskType;
    this.name = opts.name ?? 'Node.js Task Runner SDK';
    this.maxConcurrency = opts.maxConcurrency;
    this.taskTimeout = opts.taskTimeout;
    this.idleTimeout = opts.idleTimeout;

    // Note: WebSocket connection is not established here to allow for dependency injection
    // Subclasses should call initializeConnection() after construction
    this.resetIdleTimer();
  }

  /**
   * Initialize the WebSocket connection.
   * This method should be overridden by subclasses to establish the actual connection.
   * 
   * @param brokerUri - The URI of the task broker
   * @param grantToken - Authentication token for the broker
   * @param maxPayloadSize - Maximum message payload size in bytes
   * @throws Error if not overridden (abstract method pattern)
   */
  protected initializeConnection(_brokerUri: string, _grantToken: string, _maxPayloadSize: number): void {
    // This is an abstract method that should be overridden by subclasses
    // The actual implementation would use the ws library to establish WebSocket connection
    throw new Error('initializeConnection must be implemented by subclass');
  }

  private resetIdleTimer() {
    if (this.idleTimeout === 0) return;

    this.clearIdleTimer();

    this.idleTimer = setTimeout(() => {
      if (this.runningTasks.size === 0) this.emit('runner:reached-idle-timeout');
    }, this.idleTimeout * 1000);
  }

  protected receiveMessage(messageData: string) {
    const data = JSON.parse(messageData) as BrokerMessage.ToRunner.All;
    void this.onMessage(data);
  }

  private stopTaskOffers() {
    this.canSendOffers = false;
    if (this.offerInterval) {
      clearInterval(this.offerInterval);
      this.offerInterval = undefined;
    }
  }

  private startTaskOffers() {
    this.canSendOffers = true;
    if (this.offerInterval) {
      clearInterval(this.offerInterval);
    }
    this.offerInterval = setInterval(() => this.sendOffers(), 250);
  }

  /**
   * Removes expired task offers.
   */
  deleteStaleOffers() {
    this.openOffers.forEach((offer, key) => {
      if (offer.validUntil < process.hrtime.bigint()) {
        this.openOffers.delete(key);
      }
    });
  }

  /**
   * Sends task offers to the broker.
   */
  sendOffers() {
    this.deleteStaleOffers();

    if (!this.canSendOffers) {
      return;
    }

    const offersToSend = this.maxConcurrency - (this.openOffers.size + this.runningTasks.size);

    for (let i = 0; i < offersToSend; i++) {
      // Add a bit of randomness so that not all offers expire at the same time
      const validForInMs = OFFER_VALID_TIME_MS + randomInt(500);
      // Add a little extra time to account for latency
      const validUntil = process.hrtime.bigint() + msToNs(validForInMs + OFFER_VALID_EXTRA_MS);
      const offer: TaskOffer = {
        offerId: nanoid(),
        validUntil,
      };
      this.openOffers.set(offer.offerId, offer);
      this.send({
        type: 'runner:taskoffer',
        taskType: this.taskType,
        offerId: offer.offerId,
        validFor: validForInMs,
      });
    }
  }

  /**
   * Sends a message to the broker.
   */
  send(message: RunnerMessage.ToBroker.All) {
    if (this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handles incoming messages from the broker.
   */
  onMessage(message: BrokerMessage.ToRunner.All) {
    switch (message.type) {
      case 'broker:inforequest':
        this.send({
          type: 'runner:info',
          name: this.name,
          types: [this.taskType],
        });
        break;
      case 'broker:runnerregistered':
        this.startTaskOffers();
        break;
      case 'broker:taskofferaccept':
        this.offerAccepted(message.offerId, message.taskId);
        break;
      case 'broker:taskcancel':
        void this.taskCancelled(message.taskId, message.reason);
        break;
      case 'broker:tasksettings':
        void this.receivedSettings(message.taskId, message.settings);
        break;
      case 'broker:taskdataresponse':
        this.processDataResponse(message.requestId, message.data);
        break;
      case 'broker:rpcresponse':
        this.handleRpcResponse(message.callId, message.status, message.data);
        break;
      case 'broker:nodetypes':
        this.processNodeTypesResponse(message.requestId, message.nodeTypes);
        break;
    }
  }

  /**
   * Processes a data response from the broker.
   */
  processDataResponse(requestId: string, data: unknown) {
    const request = this.dataRequests.get(requestId);
    if (!request) {
      return;
    }
    request.resolve(data);
  }

  /**
   * Processes a node types response from the broker.
   */
  processNodeTypesResponse(requestId: string, nodeTypes: INodeTypeDescription[]) {
    const request = this.nodeTypesRequests.get(requestId);

    if (!request) return;

    request.resolve(nodeTypes);
  }

  /**
   * Whether the task runner has capacity to accept more tasks.
   */
  hasOpenTaskSlots(): boolean {
    return this.runningTasks.size < this.maxConcurrency;
  }

  /**
   * Handles a task offer acceptance from the broker.
   */
  offerAccepted(offerId: string, taskId: string) {
    if (!this.hasOpenTaskSlots()) {
      this.openOffers.delete(offerId);
      this.send({
        type: 'runner:taskrejected',
        taskId,
        reason: 'No open task slots - runner already at capacity',
      });
      return;
    }

    const offer = this.openOffers.get(offerId);
    if (!offer) {
      this.send({
        type: 'runner:taskrejected',
        taskId,
        reason: 'Offer expired - not accepted within validity window',
      });
      return;
    } else {
      this.openOffers.delete(offerId);
    }

    this.resetIdleTimer();
    const taskState = new TaskState({
      taskId,
      timeoutInS: this.taskTimeout,
      onTimeout: () => {
        void this.taskTimedOut(taskId);
      },
    });
    this.runningTasks.set(taskId, taskState);

    this.send({
      type: 'runner:taskaccepted',
      taskId,
    });
  }

  /**
   * Handles task cancellation.
   */
  async taskCancelled(taskId: string, reason: string) {
    const taskState = this.runningTasks.get(taskId);
    if (!taskState) {
      return;
    }

    await taskState.caseOf({
      waitingForSettings: () => this.finishTask(taskState),
      'aborting:timeout': noOp,
      'aborting:cancelled': noOp,
      running: () => {
        taskState.status = 'aborting:cancelled';
        taskState.abortController.abort('cancelled');
        this.cancelTaskRequests(taskId, reason);
      },
    });
  }

  /**
   * Handles task timeout.
   */
  async taskTimedOut(taskId: string) {
    const taskState = this.runningTasks.get(taskId);
    if (!taskState) {
      return;
    }

    await taskState.caseOf({
      waitingForSettings: () => {
        try {
          this.send({
            type: 'runner:taskerror',
            taskId,
            error: new Error(`Task execution timed out after ${this.taskTimeout} seconds`),
          });
        } finally {
          this.finishTask(taskState);
        }
      },
      'aborting:timeout': TaskState.throwUnexpectedTaskStatus,
      running: () => {
        taskState.status = 'aborting:timeout';
        taskState.abortController.abort('timeout');
        this.cancelTaskRequests(taskId, 'timeout');
      },
      'aborting:cancelled': noOp,
    });
  }

  /**
   * Handles received task settings.
   */
  async receivedSettings(taskId: string, settings: unknown) {
    const taskState = this.runningTasks.get(taskId);
    if (!taskState) {
      return;
    }

    await taskState.caseOf({
      'aborting:cancelled': TaskState.throwUnexpectedTaskStatus,
      'aborting:timeout': TaskState.throwUnexpectedTaskStatus,
      running: TaskState.throwUnexpectedTaskStatus,
      waitingForSettings: async () => {
        taskState.status = 'running';

        await this.executeTask(
          {
            taskId,
            settings,
          },
          taskState.abortController.signal,
        )
          .then(async (data) => await this.taskExecutionSucceeded(taskState, data))
          .catch(async (error) => await this.taskExecutionFailed(taskState, error));
      },
    });
  }

  /**
   * Executes a task. Must be implemented by subclasses.
   *
   * @param taskParams - Task parameters including settings
   * @param signal - Abort signal for cancellation
   * @returns Task result data
   */
  async executeTask(_taskParams: TaskParams, _signal: AbortSignal): Promise<TaskResultData> {
    throw new ApplicationError('Unimplemented');
  }

  /**
   * Requests node types from the broker.
   */
  async requestNodeTypes<T = unknown>(
    taskId: string,
    requestParams: RunnerMessage.ToBroker.NodeTypesRequest['requestParams'],
  ): Promise<T> {
    const requestId = nanoid();

    const nodeTypesPromise = new Promise<T>((resolve, reject) => {
      this.nodeTypesRequests.set(requestId, {
        requestId,
        taskId,
        resolve: resolve as (data: unknown) => void,
        reject,
      });
    });

    this.send({
      type: 'runner:nodetypesrequest',
      taskId,
      requestId,
      requestParams,
    });

    try {
      return await nodeTypesPromise;
    } finally {
      this.nodeTypesRequests.delete(requestId);
    }
  }

  /**
   * Requests data from the broker.
   */
  async requestData<T = unknown>(
    taskId: string,
    requestParams: RunnerMessage.ToBroker.TaskDataRequest['requestParams'],
  ): Promise<T> {
    const requestId = nanoid();

    const dataRequestPromise = new Promise<T>((resolve, reject) => {
      this.dataRequests.set(requestId, {
        requestId,
        taskId,
        resolve: resolve as (data: unknown) => void,
        reject,
      });
    });

    this.send({
      type: 'runner:taskdatarequest',
      taskId,
      requestId,
      requestParams,
    });

    try {
      return await dataRequestPromise;
    } finally {
      this.dataRequests.delete(requestId);
    }
  }

  /**
   * Makes an RPC call to the broker.
   */
  async makeRpcCall(
    taskId: string,
    name: RunnerMessage.ToBroker.RPC['name'],
    params: unknown[],
  ): Promise<unknown> {
    const callId = nanoid();

    const dataPromise = new Promise((resolve, reject) => {
      this.rpcCalls.set(callId, {
        callId,
        resolve,
        reject,
      });
    });

    try {
      this.send({
        type: 'runner:rpc',
        callId,
        taskId,
        name,
        params,
      });

      return await dataPromise;
    } finally {
      this.rpcCalls.delete(callId);
    }
  }

  /**
   * Handles an RPC response from the broker.
   */
  handleRpcResponse(
    callId: string,
    status: BrokerMessage.ToRunner.RPCResponse['status'],
    data: unknown,
  ) {
    const call = this.rpcCalls.get(callId);
    if (!call) {
      return;
    }
    if (status === 'success') {
      call.resolve(data);
    } else {
      call.reject(typeof data === 'string' ? new Error(data) : data);
    }
  }

  /**
   * Stops the runner gracefully.
   */
  async stop() {
    this.clearIdleTimer();
    this.stopTaskOffers();
    await this.waitUntilAllTasksAreDone();
    await this.closeConnection();
  }

  /**
   * Clears the idle timer.
   */
  clearIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
  }

  private async closeConnection() {
    if (this.ws) {
      // 1000 is the standard close code
      this.ws.close(1000, 'Shutting down');

      await new Promise<void>((resolve) => {
        this.ws?.once('close', resolve);
      });
    }
  }

  private async waitUntilAllTasksAreDone(maxWaitTimeInMs = 30_000) {
    const start = Date.now();

    while (this.runningTasks.size > 0) {
      if (Date.now() - start > maxWaitTimeInMs) {
        throw new ApplicationError('Timeout while waiting for tasks to finish');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private async taskExecutionSucceeded(taskState: TaskState, data: TaskResultData) {
    try {
      const sendData = () => {
        this.send({
          type: 'runner:taskdone',
          taskId: taskState.taskId,
          data,
        });
      };

      await taskState.caseOf({
        waitingForSettings: TaskState.throwUnexpectedTaskStatus,
        'aborting:cancelled': noOp,
        'aborting:timeout': sendData,
        running: sendData,
      });
    } finally {
      this.finishTask(taskState);
    }
  }

  private async taskExecutionFailed(taskState: TaskState, error: unknown) {
    try {
      const sendError = () => {
        this.send({
          type: 'runner:taskerror',
          taskId: taskState.taskId,
          error,
        });
      };

      await taskState.caseOf({
        waitingForSettings: TaskState.throwUnexpectedTaskStatus,
        'aborting:cancelled': noOp,
        'aborting:timeout': () => {
          console.warn(`Task ${taskState.taskId} timed out`);
          sendError();
        },
        running: sendError,
      });
    } finally {
      this.finishTask(taskState);
    }
  }

  /**
   * Cancels all node type and data requests made by the given task.
   */
  private cancelTaskRequests(taskId: string, reason: string) {
    const error = new Error(`Task cancelled: ${reason}`);
    
    for (const [requestId, request] of this.dataRequests.entries()) {
      if (request.taskId === taskId) {
        request.reject(error);
        this.dataRequests.delete(requestId);
      }
    }

    for (const [requestId, request] of this.nodeTypesRequests.entries()) {
      if (request.taskId === taskId) {
        request.reject(error);
        this.nodeTypesRequests.delete(requestId);
      }
    }
  }

  /**
   * Finishes a task by removing it from running tasks and sending new offers.
   */
  private finishTask(taskState: TaskState) {
    taskState.cleanup();
    this.runningTasks.delete(taskState.taskId);
    this.sendOffers();
    this.resetIdleTimer();
  }
}
