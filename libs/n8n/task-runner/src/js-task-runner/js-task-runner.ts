/**
 * JavaScript Task Runner implementation.
 * Executes JavaScript code in a sandboxed environment.
 */
import type { Context } from 'node:vm';
import { createContext, runInContext } from 'node:vm';
import * as a from 'node:assert';
import set from 'lodash/set';
import isObject from 'lodash/isObject';

import type { MainConfig } from '../config/main-config';
import { BuiltInsParser } from './built-ins-parser/built-ins-parser';
import { BuiltInsParserState } from './built-ins-parser/built-ins-parser-state';
import { isErrorLike } from './errors/error-like';
import { ExecutionError } from './errors/execution-error';
import { makeSerializable } from './errors/serializable-error';
import { TimeoutError } from './errors/timeout-error';
import { UnsupportedFunctionError } from './errors/unsupported-function.error';
import { createRequireResolver } from './require-resolver';
import type { RequireResolver } from './require-resolver';
import { DataRequestResponseReconstruct } from '../data-request/data-request-response-reconstruct';
import { noOp, TaskRunner } from '../task-runner';
import type { TaskParams } from '../task-runner';
import type {
  TaskResultData,
  DataRequestResponse,
  InputDataChunkDefinition,
  INodeExecutionData,
  ITaskDataConnections,
  INode,
  IRunExecutionData,
  INodeParameters,
  WorkflowExecuteMode,
  EnvProviderState,
  IExecuteData,
  IDataObject,
  CodeExecutionMode,
  WorkflowParameters,
  INodeTypeDescription,
} from '../runner-types';
import {
  EXPOSED_RPC_METHODS,
  UNSUPPORTED_HELPER_FUNCTIONS,
} from '../runner-types';

/**
 * RPC call object structure for nested method calls.
 */
export interface RpcCallObject {
  [name: string]: ((...args: unknown[]) => Promise<unknown>) | RpcCallObject;
}

/**
 * Settings for JavaScript execution.
 */
export interface JSExecSettings {
  /** The code to execute */
  code: string;
  /** Additional properties to add to the context */
  additionalProperties?: Record<string, unknown>;
  /** Execution mode: once for all items or once per item */
  nodeMode: CodeExecutionMode;
  /** Workflow execution mode */
  workflowMode: WorkflowExecuteMode;
  /** Whether to continue on failure */
  continueOnFail: boolean;
  /** For executing partial input data */
  chunk?: InputDataChunkDefinition;
}

/**
 * Task data structure for JS execution.
 */
export interface JsTaskData {
  workflow: Omit<WorkflowParameters, 'nodeTypes'>;
  inputData: ITaskDataConnections;
  connectionInputData: INodeExecutionData[];
  node: INode;
  runExecutionData: IRunExecutionData;
  runIndex: number;
  itemIndex: number;
  activeNodeName: string;
  siblingParameters: INodeParameters;
  mode: WorkflowExecuteMode;
  envProviderState: EnvProviderState;
  executeData?: IExecuteData;
  defaultReturnRunIndex: number;
  selfData: IDataObject;
  contextNodeName: string;
  additionalData: {
    executionId?: string;
    restartExecutionId?: string;
    restApiUrl: string;
    instanceBaseUrl: string;
    formWaitingBaseUrl: string;
    webhookBaseUrl: string;
    webhookWaitingBaseUrl: string;
    webhookTestBaseUrl: string;
    currentNodeParameters?: INodeParameters;
    executionTimeoutTimestamp?: number;
    userId?: string;
    variables: IDataObject;
  };
}

type CustomConsole = {
  log: (...args: unknown[]) => void;
};

/**
 * JavaScript Task Runner.
 * Executes JavaScript code in a sandboxed VM context.
 */
export class JsTaskRunner extends TaskRunner {
  private readonly requireResolver: RequireResolver;
  private readonly builtInsParser = new BuiltInsParser();
  private readonly taskDataReconstruct = new DataRequestResponseReconstruct();
  private readonly mode: 'secure' | 'insecure' = 'secure';

  constructor(config: MainConfig, name = 'JS Task Runner') {
    super({
      taskType: 'javascript',
      name,
      ...config.baseRunnerConfig,
    });

    const { jsRunnerConfig } = config;

    const parseModuleAllowList = (moduleList: string) =>
      moduleList === '*'
        ? '*'
        : new Set(
            moduleList
              .split(',')
              .map((x) => x.trim())
              .filter((x) => x !== ''),
          );

    const allowedBuiltInModules = parseModuleAllowList(jsRunnerConfig.allowedBuiltInModules ?? '');
    const allowedExternalModules = parseModuleAllowList(
      jsRunnerConfig.allowedExternalModules ?? '',
    );
    this.mode = jsRunnerConfig.insecureMode ? 'insecure' : 'secure';

    this.requireResolver = createRequireResolver({
      allowedBuiltInModules,
      allowedExternalModules,
    });

    if (this.mode === 'secure') this.preventPrototypePollution(allowedExternalModules);
  }

  private preventPrototypePollution(allowedExternalModules: Set<string> | '*') {
    if (allowedExternalModules instanceof Set) {
      // This is a workaround to enable the allowed external libraries to mutate
      // prototypes directly. For example momentjs overrides .toString() directly
      // on the Moment.prototype, which doesn't work if Object.prototype has been
      // frozen. This works as long as the overrides are done when the library is
      // imported.
      for (const module of allowedExternalModules) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require(module);
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
            console.error(
              `Allowlisted module '${module}' is not installed. Please either install it or remove it from the allowlist in the n8n-task-runners.json config file.`,
            );
            continue;
          }
          throw error;
        }
      }
    }

    // Freeze globals, except in tests because Jest needs to be able to mutate prototypes
    if (process.env.NODE_ENV !== 'test') {
      Object.getOwnPropertyNames(globalThis)
        // @ts-expect-error - globalThis does not have string in index signature
        .map((name) => globalThis[name])
        .filter((value) => typeof value === 'function')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        .forEach((fn) => Object.freeze(fn.prototype));
    }
  }

  async executeTask(
    taskParams: TaskParams<JSExecSettings>,
    abortSignal: AbortSignal,
  ): Promise<TaskResultData> {
    const { taskId, settings } = taskParams;
    a.ok(settings, 'JS Code not sent to runner');

    this.validateTaskSettings(settings);

    const neededBuiltInsResult = this.builtInsParser.parseUsedBuiltIns(settings.code);
    const neededBuiltIns = neededBuiltInsResult.ok && neededBuiltInsResult.result
      ? neededBuiltInsResult.result
      : BuiltInsParserState.newNeedsAllDataState();

    const dataResponse = await this.requestData<DataRequestResponse>(
      taskId,
      neededBuiltIns.toDataRequestParams(settings.chunk),
    );

    const data = this.reconstructTaskData(dataResponse, settings.chunk);

    await this.requestNodeTypeIfNeeded(neededBuiltIns, data.workflow, taskId);

    const result =
      settings.nodeMode === 'runOnceForAllItems'
        ? await this.runForAllItems(taskId, settings, data, abortSignal)
        : await this.runForEachItem(taskId, settings, data, abortSignal);

    return {
      result,
      customData: data.runExecutionData.resultData.metadata,
    };
  }

  private validateTaskSettings(settings: JSExecSettings) {
    a.ok(settings.code, 'No code to execute');

    if (settings.nodeMode === 'runOnceForAllItems') {
      a.ok(settings.chunk === undefined, 'Chunking is not supported for runOnceForAllItems');
    }
  }

  private getNativeVariables() {
    const { mode } = this;
    return {
      // Exposed Node.js globals
      Buffer: new Proxy(Buffer, {
        get(target, prop) {
          if (mode === 'insecure') return target[prop as keyof typeof Buffer];
          if (prop === 'allocUnsafe' || prop === 'allocUnsafeSlow') {
            return Buffer.alloc;
          }
          return target[prop as keyof typeof Buffer];
        },
      }),
      setTimeout,
      setInterval,
      setImmediate,
      clearTimeout,
      clearInterval,
      clearImmediate,

      // Missing JS natives
      btoa,
      atob,
      TextDecoder,
      TextEncoder,
      FormData,
    };
  }

  /**
   * Executes the requested code for all items in a single run.
   */
  private async runForAllItems(
    taskId: string,
    settings: JSExecSettings,
    data: JsTaskData,
    signal: AbortSignal,
  ): Promise<TaskResultData['result']> {
    const inputItems = data.connectionInputData;

    const context = this.buildContext(taskId, data.node, {
      items: inputItems,
      ...settings.additionalProperties,
    });

    try {
      const result = await new Promise<TaskResultData['result']>((resolve, reject) => {
        const abortHandler = () => {
          reject(new TimeoutError(this.taskTimeout));
        };

        signal.addEventListener('abort', abortHandler, { once: true });

        let taskResult: Promise<TaskResultData['result']>;

        if (this.mode === 'secure') {
          taskResult = runInContext(this.createVmExecutableCode(settings.code), context, {
            timeout: this.taskTimeout * 1000,
          }) as Promise<TaskResultData['result']>;
        } else {
          taskResult = this.runDirectly<TaskResultData['result']>(settings.code, context);
        }

        void taskResult
          .then(resolve)
          .catch(reject)
          .finally(() => {
            signal.removeEventListener('abort', abortHandler);
          });
      });

      if (result === null) {
        return [];
      }

      return result;
    } catch (e) {
      // Errors thrown by the VM are not instances of Error, so map them to an ExecutionError
      const error = this.toExecutionErrorIfNeeded(e);

      if (settings.continueOnFail) {
        return [{ json: { error: error.message } }];
      }

      throw error;
    }
  }

  /**
   * Executes the requested code for each item in the input data.
   */
  private async runForEachItem(
    taskId: string,
    settings: JSExecSettings,
    data: JsTaskData,
    signal: AbortSignal,
  ): Promise<INodeExecutionData[]> {
    const inputItems = data.connectionInputData;
    const returnData: INodeExecutionData[] = [];

    // If a chunk was requested, only process the items in the chunk
    const chunkStartIdx = settings.chunk ? settings.chunk.startIndex : 0;
    const chunkEndIdx = settings.chunk
      ? settings.chunk.startIndex + settings.chunk.count
      : inputItems.length;

    const context = this.buildContext(
      taskId,
      data.node,
      settings.additionalProperties,
    );

    for (let index = chunkStartIdx; index < chunkEndIdx; index++) {
      Object.assign(context, { item: inputItems[index] });

      try {
        const result = await new Promise<INodeExecutionData | undefined>((resolve, reject) => {
          const abortHandler = () => {
            reject(new TimeoutError(this.taskTimeout));
          };

          signal.addEventListener('abort', abortHandler);

          let taskResult: Promise<INodeExecutionData>;

          if (this.mode === 'secure') {
            taskResult = runInContext(this.createVmExecutableCode(settings.code), context, {
              timeout: this.taskTimeout * 1000,
            }) as Promise<INodeExecutionData>;
          } else {
            taskResult = this.runDirectly<INodeExecutionData>(settings.code, context);
          }

          void taskResult
            .then(resolve)
            .catch(reject)
            .finally(() => {
              signal.removeEventListener('abort', abortHandler);
            });
        });

        // Filter out null values
        if (result === null) {
          continue;
        }

        if (result) {
          const jsonData = this.extractJsonData(result);

          returnData.push(
            result.binary
              ? {
                  json: jsonData as IDataObject,
                  pairedItem: { item: index },
                  binary: result.binary,
                }
              : {
                  json: jsonData as IDataObject,
                  pairedItem: { item: index },
                },
          );
        }
      } catch (e) {
        // Errors thrown by the VM are not instances of Error, so map them to an ExecutionError
        const error = this.toExecutionErrorIfNeeded(e);

        if (!settings.continueOnFail) {
          throw error;
        }

        returnData.push({
          json: { error: error.message },
          pairedItem: {
            item: index,
          },
        });
      }
    }

    return returnData;
  }

  private extractJsonData(result: INodeExecutionData) {
    if (!isObject(result)) return result;

    if ('json' in result) return result.json;

    if ('binary' in result) {
      // Pick only json property to prevent metadata duplication
      return (result as INodeExecutionData).json ?? {};
    }

    return result;
  }

  private toExecutionErrorIfNeeded(error: unknown): Error {
    if (error instanceof Error) {
      return makeSerializable(error);
    }

    if (isErrorLike(error)) {
      return new ExecutionError(error);
    }

    return new ExecutionError({ message: JSON.stringify(error) });
  }

  private reconstructTaskData(
    response: DataRequestResponse,
    chunk?: InputDataChunkDefinition,
  ): JsTaskData {
    const inputData = this.taskDataReconstruct.reconstructConnectionInputItems(
      response.inputData,
      chunk,
    ) as INodeExecutionData[];

    return {
      ...response,
      connectionInputData: inputData,
      executeData: this.taskDataReconstruct.reconstructExecuteData(response, inputData),
    };
  }

  private async requestNodeTypeIfNeeded(
    neededBuiltIns: BuiltInsParserState,
    workflow: JsTaskData['workflow'],
    taskId: string,
  ) {
    /**
     * We request node types only when we know a task needs all nodes, because
     * needing all nodes means that the task relies on paired item functionality,
     * which is the same requirement for needing node types.
     */
    if (neededBuiltIns.needsAllNodes) {
      const uniqueNodeTypes = new Map(
        workflow.nodes.map((node) => [
          `${node.type}|${node.typeVersion}`,
          { name: node.type, version: node.typeVersion },
        ]),
      );

      const unknownNodeTypes = this.nodeTypes.onlyUnknown([...uniqueNodeTypes.values()]);

      const nodeTypes = await this.requestNodeTypes<INodeTypeDescription[]>(
        taskId,
        unknownNodeTypes,
      );

      this.nodeTypes.addNodeTypeDescriptions(nodeTypes);
    }
  }

  private buildRpcCallObject(taskId: string): RpcCallObject {
    const rpcObject: RpcCallObject = {};

    for (const rpcMethod of EXPOSED_RPC_METHODS) {
      set(
        rpcObject,
        rpcMethod.split('.'),
        async (...args: unknown[]) => await this.makeRpcCall(taskId, rpcMethod, args),
      );
    }

    for (const rpcMethod of UNSUPPORTED_HELPER_FUNCTIONS) {
      set(rpcObject, rpcMethod.split('.'), () => {
        throw new UnsupportedFunctionError(rpcMethod);
      });
    }

    return rpcObject;
  }

  private buildCustomConsole(taskId: string): CustomConsole {
    return {
      // all except `log` are dummy methods that disregard without throwing
      ...Object.keys(console).reduce<Record<string, () => void>>((acc, name) => {
        acc[name] = noOp;
        return acc;
      }, {}),

      // Send log output back to the main process
      log: (...args: unknown[]) => {
        const formattedLogArgs = args.map((arg) => {
          if (isObject(arg) && '__isExecutionContext' in arg) return '[[ExecutionContext]]';
          if (typeof arg === 'string') return `'${arg}'`;
          return JSON.stringify(arg);
        });
        void this.makeRpcCall(taskId, 'logNodeOutput', formattedLogArgs);
      },
    };
  }

  /**
   * Builds the 'global' context object that is passed to the script.
   */
  buildContext(
    taskId: string,
    node: INode,
    additionalProperties: Record<string, unknown> = {},
  ): Context {
    return createContext({
      __isExecutionContext: true,
      require: this.requireResolver,
      module: {},
      console: this.buildCustomConsole(taskId),
      ...this.getNativeVariables(),
      ...this.buildRpcCallObject(taskId),
      ...additionalProperties,
    });
  }

  private createVmExecutableCode(code: string): string {
    return [
      // shim for `global` compatibility
      'globalThis.global = globalThis',

      // prevent prototype manipulation
      'Object.getPrototypeOf = () => ({})',
      'Reflect.getPrototypeOf = () => ({})',
      'Object.setPrototypeOf = () => false',
      'Reflect.setPrototypeOf = () => false',

      // wrap user code
      `module.exports = async function VmCodeWrapper() {${code}\n}()`,
    ].join('; ');
  }

  private async runDirectly<T>(code: string, context: Context): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      'context',
      `with(context) { return (async function() {${code}\n})(); }`,
    );
    return await fn(context) as T;
  }
}
