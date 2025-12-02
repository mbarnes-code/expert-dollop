/**
 * @expert-dollop/n8n-task-runner
 *
 * Task runner SDK for executing JavaScript code in n8n workflows.
 * This package provides a WebSocket-based runner that connects to the n8n task broker
 * and executes JavaScript code in a sandboxed environment.
 *
 * ## Architecture
 *
 * The task runner follows a broker-runner architecture:
 * - Task Broker (n8n instance): Coordinates task distribution
 * - Task Runner (this package): Executes tasks in isolation
 *
 * ## Core Components
 *
 * - `TaskRunner`: Abstract base class for all runners
 * - `JsTaskRunner`: JavaScript/TypeScript task execution
 * - `TaskState`: Manages task lifecycle states
 * - `TaskRunnerNodeTypes`: Provides node type information
 *
 * ## Example Usage
 *
 * ```typescript
 * import { Container } from '@expert-dollop/n8n-di';
 * import { MainConfig, JsTaskRunner } from '@expert-dollop/n8n-task-runner';
 *
 * const config = Container.get(MainConfig);
 * const runner = new JsTaskRunner(config);
 *
 * // Runner will automatically connect to the broker
 * // and start accepting tasks
 * ```
 */

// Core exports
export { TaskRunner } from './task-runner';
export type { TaskOffer, TaskParams, TaskRunnerOpts } from './task-runner';

export { TaskState } from './task-state';
export type { TaskStatus, TaskStateOpts } from './task-state';

export { TaskRunnerNodeTypes, DEFAULT_NODETYPE_VERSION } from './node-types';

export { HealthCheckServer } from './health-check-server';

// Configuration
export { BaseRunnerConfig } from './config/base-runner-config';
export { JsRunnerConfig } from './config/js-runner-config';
export { SentryConfig } from './config/sentry-config';
export { MainConfig } from './config/main-config';

// Types
export * from './runner-types';
export * from './message-types';

// JS Task Runner
export { JsTaskRunner } from './js-task-runner/js-task-runner';
export type { JSExecSettings, JsTaskData, RpcCallObject } from './js-task-runner/js-task-runner';

// Built-ins Parser
export { BuiltInsParser } from './js-task-runner/built-ins-parser/built-ins-parser';
export { BuiltInsParserState } from './js-task-runner/built-ins-parser/built-ins-parser-state';

// Require Resolver
export { createRequireResolver } from './js-task-runner/require-resolver';
export type { RequireResolver, RequireResolverOpts } from './js-task-runner/require-resolver';

// Data Request
export { DataRequestResponseReconstruct } from './data-request/data-request-response-reconstruct';

// Errors
export { TimeoutError } from './js-task-runner/errors/timeout-error';
export { TaskCancelledError } from './js-task-runner/errors/task-cancelled-error';
export { ExecutionError } from './js-task-runner/errors/execution-error';
export { UnsupportedFunctionError } from './js-task-runner/errors/unsupported-function.error';
export { DisallowedModuleError } from './js-task-runner/errors/disallowed-module.error';
export { SerializableError, makeSerializable } from './js-task-runner/errors/serializable-error';
export { isErrorLike } from './js-task-runner/errors/error-like';
export type { ErrorLike } from './js-task-runner/errors/error-like';

// Sentry integration
export { TaskRunnerSentry } from './task-runner-sentry';
