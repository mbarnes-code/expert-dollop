/**
 * @expert-dollop/n8n-types
 * 
 * Shared TypeScript interfaces and types for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Workflow types
export type {
  WorkflowExecuteMode,
  WorkflowActivateMode,
  ExecutionStatus,
  NodeConnectionType,
  HttpRequestMethod,
  IWorkflowBase,
  INode,
  INodeParameters,
  NodeParameterValue,
  NodeParameterValueType,
  INodeParameterResourceLocator,
  INodeCredentials,
  INodeCredentialsDetails,
  IConnections,
  INodeConnections,
  IConnection,
  IWorkflowSettings,
  IPinData,
  INodeExecutionData,
  GenericValue,
  IDataObject,
  IBinaryKeyData,
  IBinaryData,
  IPairedItemData,
} from './workflow.types';

export { NodeConnectionTypes } from './workflow.types';

// User types
export type {
  IUser,
  IProjectSharingData,
  ICredentialsDecrypted,
  ICredentialsEncrypted,
  CredentialInformation,
  ICredentialDataDecryptedObject,
  IRole,
  IAuthResult,
  ISessionData,
} from './user.types';

// Execution types
export type {
  IRunExecutionData,
  IStartData,
  IResultData,
  IRunData,
  ITaskData,
  ITaskDataConnections,
  ISourceData,
  INodeExecutionHint,
  ITaskMetadata,
  IRelatedExecution,
  IExecutionData,
  IExecuteContextData,
  IContextObject,
  IExecuteData,
  ITaskDataConnectionsSource,
  IWaitingForExecution,
  IWaitingForExecutionSource,
  ExecutionError,
  IExecutionSummary,
  IWorkflowExecutionDataProcess,
} from './execution.types';
