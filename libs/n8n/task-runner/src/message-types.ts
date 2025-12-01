/**
 * Message type definitions for communication between
 * task broker, task runner, and task requester.
 */

import type {
  AVAILABLE_RPC_METHODS,
  TaskDataRequestParams,
  TaskResultData,
  NeededNodeType,
  INodeTypeBaseDescription,
} from './runner-types';

/**
 * Messages sent by the broker to various parties.
 */
export namespace BrokerMessage {
  /**
   * Messages sent by the broker to the runner.
   */
  export namespace ToRunner {
    /** Request for runner information */
    export interface InfoRequest {
      type: 'broker:inforequest';
    }

    /** Confirmation that runner has been registered */
    export interface RunnerRegistered {
      type: 'broker:runnerregistered';
    }

    /** Acceptance of a task offer */
    export interface TaskOfferAccept {
      type: 'broker:taskofferaccept';
      taskId: string;
      offerId: string;
    }

    /** Request to cancel a task */
    export interface TaskCancel {
      type: 'broker:taskcancel';
      taskId: string;
      reason: string;
    }

    /** Task settings payload */
    export interface TaskSettings {
      type: 'broker:tasksettings';
      taskId: string;
      settings: unknown;
    }

    /** RPC response */
    export interface RPCResponse {
      type: 'broker:rpcresponse';
      callId: string;
      taskId: string;
      status: 'success' | 'error';
      data: unknown;
    }

    /** Task data response */
    export interface TaskDataResponse {
      type: 'broker:taskdataresponse';
      taskId: string;
      requestId: string;
      data: unknown;
    }

    /** Node types payload */
    export interface NodeTypes {
      type: 'broker:nodetypes';
      taskId: string;
      requestId: string;
      nodeTypes: INodeTypeBaseDescription[];
    }

    /** Union of all broker-to-runner message types */
    export type All =
      | InfoRequest
      | TaskOfferAccept
      | TaskCancel
      | TaskSettings
      | RunnerRegistered
      | RPCResponse
      | TaskDataResponse
      | NodeTypes;
  }

  /**
   * Messages sent by the broker to the requester.
   */
  export namespace ToRequester {
    /** Task is ready for execution */
    export interface TaskReady {
      type: 'broker:taskready';
      requestId: string;
      taskId: string;
    }

    /** Task completed successfully */
    export interface TaskDone {
      type: 'broker:taskdone';
      taskId: string;
      data: TaskResultData;
    }

    /** Task failed with error */
    export interface TaskError {
      type: 'broker:taskerror';
      taskId: string;
      error: unknown;
    }

    /** Task request expired */
    export interface RequestExpired {
      type: 'broker:requestexpired';
      requestId: string;
      reason: 'timeout';
    }

    /** Request for task data */
    export interface TaskDataRequest {
      type: 'broker:taskdatarequest';
      taskId: string;
      requestId: string;
      requestParams: TaskDataRequestParams;
    }

    /** Request for node types */
    export interface NodeTypesRequest {
      type: 'broker:nodetypesrequest';
      taskId: string;
      requestId: string;
      requestParams: NeededNodeType[];
    }

    /** RPC call */
    export interface RPC {
      type: 'broker:rpc';
      callId: string;
      taskId: string;
      name: (typeof AVAILABLE_RPC_METHODS)[number];
      params: unknown[];
    }

    /** Union of all broker-to-requester message types */
    export type All =
      | TaskReady
      | TaskDone
      | TaskError
      | RequestExpired
      | TaskDataRequest
      | NodeTypesRequest
      | RPC;
  }
}

/**
 * Messages sent by the requester to the broker.
 */
export namespace RequesterMessage {
  export namespace ToBroker {
    /** Task settings */
    export interface TaskSettings {
      type: 'requester:tasksettings';
      taskId: string;
      settings: unknown;
    }

    /** Cancel a task */
    export interface TaskCancel {
      type: 'requester:taskcancel';
      taskId: string;
      reason: string;
    }

    /** Task data response */
    export interface TaskDataResponse {
      type: 'requester:taskdataresponse';
      taskId: string;
      requestId: string;
      data: unknown;
    }

    /** Node types response */
    export interface NodeTypesResponse {
      type: 'requester:nodetypesresponse';
      taskId: string;
      requestId: string;
      nodeTypes: INodeTypeBaseDescription[];
    }

    /** RPC response */
    export interface RPCResponse {
      type: 'requester:rpcresponse';
      taskId: string;
      callId: string;
      status: 'success' | 'error';
      data: unknown;
    }

    /** Request a new task */
    export interface TaskRequest {
      type: 'requester:taskrequest';
      requestId: string;
      taskType: string;
    }

    /** Union of all requester-to-broker message types */
    export type All =
      | TaskSettings
      | TaskCancel
      | RPCResponse
      | TaskDataResponse
      | NodeTypesResponse
      | TaskRequest;
  }
}

/**
 * Messages sent by the runner to the broker.
 */
export namespace RunnerMessage {
  export namespace ToBroker {
    /** Runner information */
    export interface Info {
      type: 'runner:info';
      name: string;
      types: string[];
    }

    /** Task accepted */
    export interface TaskAccepted {
      type: 'runner:taskaccepted';
      taskId: string;
    }

    /** Task rejected */
    export interface TaskRejected {
      type: 'runner:taskrejected';
      taskId: string;
      reason: string;
    }

    /** Task deferred (launcher requesting broker to hold task) */
    export interface TaskDeferred {
      type: 'runner:taskdeferred';
      taskId: string;
    }

    /** Task completed successfully */
    export interface TaskDone {
      type: 'runner:taskdone';
      taskId: string;
      data: TaskResultData;
    }

    /** Task failed with error */
    export interface TaskError {
      type: 'runner:taskerror';
      taskId: string;
      error: unknown;
    }

    /** Offer to accept a task */
    export interface TaskOffer {
      type: 'runner:taskoffer';
      offerId: string;
      taskType: string;
      validFor: number;
    }

    /** Request task data */
    export interface TaskDataRequest {
      type: 'runner:taskdatarequest';
      taskId: string;
      requestId: string;
      requestParams: TaskDataRequestParams;
    }

    /**
     * Request node types.
     * Node types are needed only when the script relies on paired item functionality.
     */
    export interface NodeTypesRequest {
      type: 'runner:nodetypesrequest';
      taskId: string;
      requestId: string;
      requestParams: NeededNodeType[];
    }

    /** RPC call */
    export interface RPC {
      type: 'runner:rpc';
      callId: string;
      taskId: string;
      name: (typeof AVAILABLE_RPC_METHODS)[number];
      params: unknown[];
    }

    /** Union of all runner-to-broker message types */
    export type All =
      | Info
      | TaskDone
      | TaskError
      | TaskAccepted
      | TaskRejected
      | TaskDeferred
      | TaskOffer
      | RPC
      | TaskDataRequest
      | NodeTypesRequest;
  }
}
