# n8n Shared Libraries

This directory contains hoisted shared dependencies for the n8n workflow automation platform, following DDD (Domain-Driven Design) modular monolith best practices.

## Overview

These libraries have been extracted from the `features/n8n` directory to be shared across:
- `apps/ai/n8n` - AI workflow automation module
- `backend/services/n8n` - Backend services for n8n

## Libraries

### @expert-dollop/n8n-shared

The main entry point that re-exports all shared n8n functionality. Use this for convenience when you need multiple modules.

```typescript
import { Container, Service, Logger, hasScope, IWorkflowBase } from '@expert-dollop/n8n-shared';
```

### @expert-dollop/n8n-di

Dependency injection container following the singleton pattern.

```typescript
import { Container, Service, type Constructable } from '@expert-dollop/n8n-di';

@Service()
class MyService {
  // Service implementation
}

const instance = Container.get(MyService);
```

### @expert-dollop/n8n-constants

Shared constants including:
- License features and quotas
- Time conversion utilities
- LDAP configuration
- Authentication constants
- Execution status types

```typescript
import { 
  LICENSE_FEATURES, 
  Time, 
  AUTH_COOKIE_NAME,
  LDAP_DEFAULT_CONFIGURATION
} from '@expert-dollop/n8n-constants';
```

### @expert-dollop/n8n-errors

Structured error handling with abstract base classes:
- `ApplicationError` - Base for all application errors
- `UserError` - User-facing errors (expected)
- `OperationalError` - Operational errors (recoverable)
- `UnexpectedError` - Unexpected system errors

Specific errors:
- `AuthenticationError`, `AuthorizationError`, `ValidationError`, `NotFoundError`
- `WorkflowActivationError`, `WorkflowExecutionError`, `ExecutionCancelledError`
- `NodeOperationError`, `DatabaseConnectionError`, `ConfigurationError`

```typescript
import { 
  AuthenticationError, 
  WorkflowExecutionError,
  type ErrorSeverity 
} from '@expert-dollop/n8n-errors';
```

### @expert-dollop/n8n-types

TypeScript interfaces and types for:
- Workflows (`IWorkflowBase`, `INode`, `IConnection`)
- Execution (`IRunExecutionData`, `ITaskData`)
- Users and credentials (`IUser`, `ICredentialsDecrypted`)

```typescript
import type { 
  IWorkflowBase, 
  INodeExecutionData, 
  ExecutionStatus 
} from '@expert-dollop/n8n-types';
```

### @expert-dollop/n8n-permissions

Scope and permission management:
- Scope types for workflows, credentials, users, etc.
- Role types (global, project, credential, workflow)
- Permission checking utilities

```typescript
import { 
  hasScope, 
  getGlobalRoleScopes, 
  combineScopes,
  type Scope,
  type GlobalRole 
} from '@expert-dollop/n8n-permissions';
```

### @expert-dollop/n8n-backend-common

Common backend utilities:
- `Logger` - Singleton logger with scoping
- `LicenseState` - License feature/quota management
- Environment utilities (`inDevelopment`, `getEnvVar`)
- Path utilities (`safeJoinPath`, `isContainedWithin`)

```typescript
import { 
  Logger, 
  getLogger, 
  LicenseState,
  inProduction,
  safeJoinPath 
} from '@expert-dollop/n8n-backend-common';
```

### @expert-dollop/n8n-config

Configuration management with decorator-based environment variable binding:
- `@Config` decorator for configuration classes
- `@Env` decorator for environment variable binding
- `@Nested` decorator for nested configuration
- Zod schema validation support
- `GlobalConfig` class aggregating all configurations

```typescript
import { 
  GlobalConfig, 
  Config, 
  Env, 
  Nested,
  DatabaseConfig,
  LoggingConfig 
} from '@expert-dollop/n8n-config';

// Access via DI container
const config = Container.get(GlobalConfig);
console.log(config.port); // 5678
console.log(config.database.type); // 'sqlite'

// Custom config class
@Config
class MyConfig {
  @Env('MY_SETTING')
  mySetting: string = 'default';
  
  @Nested
  database: DatabaseConfig;
}
```

### @expert-dollop/n8n-client-oauth2

OAuth2 client library supporting Authorization Code and Client Credentials flows:
- `ClientOAuth2` - Main OAuth2 client
- `ClientOAuth2Token` - Token management with refresh
- `CodeFlow` - Authorization code flow
- `CredentialsFlow` - Client credentials flow

```typescript
import { 
  ClientOAuth2, 
  ClientOAuth2Token,
  type ClientOAuth2Options 
} from '@expert-dollop/n8n-client-oauth2';

const client = new ClientOAuth2({
  clientId: 'my-client-id',
  clientSecret: 'my-client-secret',
  accessTokenUri: 'https://example.com/oauth/token',
  authorizationUri: 'https://example.com/oauth/authorize',
  scopes: ['read', 'write'],
});

// Authorization Code flow
const authUri = client.code.getUri();
const token = await client.code.getToken(callbackUrl);

// Client Credentials flow
const token = await client.credentials.getToken();
```

### @expert-dollop/n8n-utils

General utility functions for n8n modules:
- `assert` - Assertion helper
- `createEventBus` - Typed event bus
- `createEventQueue` - Sequential event queue
- `retry` - Retry with backoff
- `smartDecimal` - Smart number formatting
- `truncate`, `truncateBeforeLast` - String truncation
- `sortByProperty` - Array sorting
- `sublimeSearch`, `reRankSearchResults` - Fuzzy search
- `sanitizeFilename` - Filename sanitization

```typescript
import { 
  assert, 
  createEventBus, 
  retry, 
  sublimeSearch,
  sanitizeFilename 
} from '@expert-dollop/n8n-utils';

// Event bus
const bus = createEventBus<{ 'user-login': { id: string } }>();
bus.on('user-login', (e) => console.log(e.id));

// Retry with exponential backoff
await retry(() => checkConnection(), 1000, 5, 'exponential');

// Fuzzy search
const results = sublimeSearch('user', items, [{ key: 'name', weight: 1.5 }]);

// Filename sanitization
const safe = sanitizeFilename('hello:world'); // 'hello_world'
```

### @expert-dollop/n8n-decorators

TypeScript decorators for n8n modules:
- **Controller decorators**: `@RestController`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Middleware`, `@Licensed`, `@GlobalScope`, `@ProjectScope`
- **Command decorators**: `@Command` for CLI commands
- **Shutdown decorators**: `@OnShutdown` with priority levels
- **Module decorators**: `@BackendModule` with license flags
- **Lifecycle decorators**: `@OnLifecycleEvent` for workflow execution hooks
- **Multi-main decorators**: `@OnLeaderTakeover`, `@OnLeaderStepdown`
- **PubSub decorators**: `@OnPubSubEvent` for distributed events
- **Utility decorators**: `@Debounce`, `@Memoized`, `@Timed`, `@Redactable`

```typescript
import { 
  RestController, 
  Get, 
  Post,
  GlobalScope,
  OnShutdown,
  BackendModule,
  Debounce,
  Memoized
} from '@expert-dollop/n8n-decorators';

// Controller with routes
@RestController('/users')
class UsersController {
  @Get('/:id')
  @GlobalScope('user:read')
  async getUser(@Param('id') id: string) { ... }
  
  @Post('/')
  async createUser(@Body body: CreateUserDto) { ... }
}

// Service with shutdown hook
@Service()
class DatabaseService {
  @OnShutdown(100) // priority
  async closeConnections() { ... }
}

// Backend module
@BackendModule({ name: 'insights', licenseFlag: 'feat:insights' })
class InsightsModule implements ModuleInterface {
  async init() { ... }
  async entities() { return [InsightsEntity]; }
}

// Utility decorators
class CacheService {
  @Memoized
  get expensiveValue() { return computeValue(); }
  
  @Debounce(1000)
  async saveToDatabase() { ... }
}
```

### @expert-dollop/n8n-db

Database utilities and entity definitions:
- **Entity base classes**: `WithStringId`, `WithTimestamps`, `WithTimestampsAndStringId`
- **Repository pattern**: `AbstractRepository<T, ID>`
- **Connection utilities**: `AbstractDbConnection`, `DbConnectionOptions`
- **Utility functions**: `generateNanoId`, `isValidEmail`, `sql`, `separate`, `withTransaction`
- **Value transformers**: `idStringifier`, `lowerCaser`, `objectRetriever`
- **Validators**: `NoXss`, `NoUrl`, `isXssSafe`, `isUrlFree`
- **Type definitions**: Execution types, user types, query types

```typescript
import { 
  WithTimestampsAndStringId,
  AbstractRepository,
  generateNanoId,
  isValidEmail,
  sql,
  withTransaction,
  NoXss,
  ExecutionStatus,
  SlimProject
} from '@expert-dollop/n8n-db';

// Entity with auto-generated ID and timestamps
class User extends WithTimestampsAndStringId {
  @NoXss()
  name: string;
  
  email: string;
}

// Repository implementation
class UserRepository extends AbstractRepository<User> {
  async findById(id: string): Promise<User | null> { ... }
  async findAll(): Promise<User[]> { ... }
  async save(user: User): Promise<User> { ... }
}

// Transaction handling
await withTransaction(manager, existingTrx, async (em) => {
  await em.save(user);
  await em.save(profile);
});

// SQL template literal for syntax highlighting
const query = sql`
  SELECT * FROM users 
  WHERE status = ${'active'}
`;

// Validation
if (isValidEmail(email)) { ... }
```

### @expert-dollop/n8n-task-runner

Task runner SDK for executing JavaScript code in n8n workflows:
- **Core classes**: `TaskRunner`, `JsTaskRunner`, `TaskState`
- **Configuration**: `MainConfig`, `BaseRunnerConfig`, `JsRunnerConfig`, `SentryConfig`
- **Node types**: `TaskRunnerNodeTypes` for node type registry
- **Built-ins parser**: `BuiltInsParser` for code analysis
- **Data handling**: `DataRequestResponseReconstruct`
- **Error classes**: `TimeoutError`, `TaskCancelledError`, `ExecutionError`, `DisallowedModuleError`
- **Message types**: `BrokerMessage`, `RunnerMessage`, `RequesterMessage`

```typescript
import { 
  JsTaskRunner,
  MainConfig,
  TaskRunnerNodeTypes,
  TimeoutError,
  type TaskParams,
  type TaskResultData
} from '@expert-dollop/n8n-task-runner';

// Create and start a JS task runner
const config = Container.get(MainConfig);
const runner = new JsTaskRunner(config);

// Runner automatically connects to broker and handles tasks
runner.on('runner:reached-idle-timeout', () => {
  console.log('Runner has been idle, shutting down...');
});

// Custom runner implementation
class CustomRunner extends TaskRunner {
  async executeTask(
    taskParams: TaskParams,
    signal: AbortSignal
  ): Promise<TaskResultData> {
    // Custom task execution logic
    return { result: data };
  }
}

// Node type management
const nodeTypes = new TaskRunnerNodeTypes([]);
nodeTypes.addNodeTypeDescriptions(descriptions);
const nodeType = nodeTypes.getByNameAndVersion('n8n-nodes-base.http', 1);
```

### @expert-dollop/n8n-workflow

Core workflow interfaces, types, and utilities:
- **Interfaces**: `INode`, `IConnections`, `IWorkflowBase`, `INodeExecutionData`
- **Types**: `WorkflowExecuteMode`, `ExecutionStatus`, `NodeConnectionType`
- **Workflow class**: `AbstractWorkflow` with node traversal and graph operations
- **Common utilities**: `getChildNodes`, `getParentNodes`, `mapConnectionsByDestination`
- **Error classes**: `NodeOperationError`, `NodeApiError`, `ExpressionError`
- **Constants**: Starting node types, connection types, HTTP methods

```typescript
import { 
  AbstractWorkflow,
  INode,
  IConnections,
  NodeConnectionTypes,
  NodeOperationError,
  type WorkflowExecuteMode,
  type ExecutionStatus
} from '@expert-dollop/n8n-workflow';

// Create a workflow
class MyWorkflow extends AbstractWorkflow {
  // Custom implementation
}

// Get child nodes
const children = workflow.getChildNodes('triggerNode');

// Check connection types
if (connectionType === NodeConnectionTypes.Main) { ... }
```

### @expert-dollop/n8n-core

Core functionality and execution engine for workflows:
- **Execution engine**: `AbstractWorkflowExecutor`, `SimpleWorkflowExecutor`
- **Binary data**: `AbstractBinaryDataService`, `InMemoryBinaryDataService`
- **Encryption**: `AbstractEncryptionService`, `SimpleEncryptionService`
- **Credentials**: `AbstractCredentialsService`, `InMemoryCredentialsService`
- **Node loader**: `AbstractNodeLoader`, `InMemoryNodeLoader`
- **Instance settings**: `AbstractInstanceSettings`, `SimpleInstanceSettings`
- **Utilities**: HTML sanitization, HTTP proxy, crypto helpers

```typescript
import { 
  AbstractWorkflowExecutor,
  AbstractBinaryDataService,
  AbstractEncryptionService,
  SimpleInstanceSettings,
  sanitizeHtml,
  generateHash
} from '@expert-dollop/n8n-core';

// Custom workflow executor
class MyExecutor extends AbstractWorkflowExecutor {
  protected async executeWorkflow(context, workflow, options) {
    // Execution logic
    return runData;
  }
  
  protected createExecutionContext(executionId, workflow, mode) {
    return { workflowId: workflow.id, executionId, mode, ... };
  }
}

// Encryption service
class MyEncryptionService extends AbstractEncryptionService {
  protected getEncryptionKey() {
    return process.env.ENCRYPTION_KEY!;
  }
}

// HTML sanitization
const safe = sanitizeHtml(userInput);
```

### @expert-dollop/n8n-api-types

API type definitions and DTOs for n8n REST API:
- **DTOs**: `LoginRequestDto`, `CreateProjectDto`, `PaginationDto`
- **User schemas**: `User`, `UsersList`, `passwordSchema`
- **Project schemas**: `ProjectType`, `ProjectIcon`, `ProjectRelation`
- **Data tables**: `DataTable`, `DataTableColumn`, `DataTableFilter`
- **Insights**: `InsightsSummary`, `InsightsByWorkflow`, `InsightsByTime`
- **Push messages**: `HeartbeatMessage`, `Collaborator`, `WorkerStatus`
- **Source control**: `SourceControlledFile`
- **External secrets**: `ExternalSecretsProvider`

```typescript
import { 
  LoginRequestDto,
  CreateProjectDto,
  PaginationDto,
  passwordSchema,
  User,
  InsightsSummary,
  type Collaborator,
  type WorkerStatus
} from '@expert-dollop/n8n-api-types';

// Validate login request
const result = loginRequestSchema.safeParse(requestBody);
if (!result.success) {
  throw new Error('Invalid login request');
}

// Validate password strength
const isValidPassword = passwordSchema.safeParse(password).success;

// Create pagination DTO
const pagination = createPaginationDto({ skip: '0', take: '20' });
```

## Abstract Base Classes

The shared library provides abstract base classes for DDD patterns:

### AbstractWorkflowExecutor

Base class for workflow execution services:

```typescript
import { AbstractWorkflowExecutor } from '@expert-dollop/n8n-shared';

class MyWorkflowExecutor extends AbstractWorkflowExecutor {
  protected async initialize(workflow: IWorkflowBase) { ... }
  protected async executeNode(...) { ... }
  protected async finalize(...) { ... }
  async cancel(reason?: string) { ... }
  async execute(...) { ... }
}
```

### AbstractNodeExecutionContext

Base class for node execution contexts:

```typescript
import { AbstractNodeExecutionContext } from '@expert-dollop/n8n-shared';

class MyNodeContext extends AbstractNodeExecutionContext {
  getInputData(inputIndex?: number) { ... }
  getNodeParameter<T>(...) { ... }
  getCredentials<T>(...) { ... }
  // ...
}
```

### AbstractCredentialService

Base class for credential management:

```typescript
import { AbstractCredentialService } from '@expert-dollop/n8n-shared';

class MyCredentialService extends AbstractCredentialService {
  async get(type: string, id: string) { ... }
  async decrypt(encryptedData: string) { ... }
  async encrypt(data: ICredentialDataDecryptedObject) { ... }
  // ...
}
```

### AbstractRepository

Base class for database repositories:

```typescript
import { AbstractRepository } from '@expert-dollop/n8n-shared';

class WorkflowRepository extends AbstractRepository<Workflow, CreateWorkflowDto> {
  async findById(id: string) { ... }
  async find(criteria?: IFindCriteria<Workflow>) { ... }
  async create(data: CreateWorkflowDto) { ... }
  // ...
}
```

## Utility Functions

```typescript
import {
  deepCopy,
  jsonParse,
  sleep,
  randomString,
  assert,
  isObjectEmpty,
  fileTypeFromMimeType,
} from '@expert-dollop/n8n-shared';

// Deep copy an object
const copy = deepCopy(original);

// Parse JSON with fallback
const data = jsonParse(jsonString, { default: 'value' });

// Sleep for 1 second
await sleep(1000);

// Generate random string
const token = randomString(32);
```

## Adding New Shared Code

1. Identify code that is shared between multiple n8n modules
2. Determine which library it belongs to:
   - Types → `n8n-types`
   - Constants → `n8n-constants`
   - Errors → `n8n-errors`
   - Permissions → `n8n-permissions`
   - Backend utilities → `n8n-backend-common`
   - Configuration → `n8n-config`
   - OAuth2 → `n8n-client-oauth2`
   - General utilities → `n8n-utils`
   - Decorators → `n8n-decorators`
   - Database utilities → `n8n-db`
   - DI container → `n8n-di`
3. Add the code to the appropriate library
4. Export from the library's `index.ts`
5. Update `n8n-shared` if needed

## Path Aliases

All libraries are available via TypeScript path aliases defined in `tsconfig.base.json`:

```json
{
  "@expert-dollop/n8n-shared": ["libs/n8n/shared/src/index.ts"],
  "@expert-dollop/n8n-constants": ["libs/n8n/constants/src/index.ts"],
  "@expert-dollop/n8n-di": ["libs/n8n/di/src/index.ts"],
  "@expert-dollop/n8n-errors": ["libs/n8n/errors/src/index.ts"],
  "@expert-dollop/n8n-types": ["libs/n8n/types/src/index.ts"],
  "@expert-dollop/n8n-permissions": ["libs/n8n/permissions/src/index.ts"],
  "@expert-dollop/n8n-backend-common": ["libs/n8n/backend-common/src/index.ts"],
  "@expert-dollop/n8n-config": ["libs/n8n/config/src/index.ts"],
  "@expert-dollop/n8n-client-oauth2": ["libs/n8n/client-oauth2/src/index.ts"],
  "@expert-dollop/n8n-utils": ["libs/n8n/utils/src/index.ts"],
  "@expert-dollop/n8n-decorators": ["libs/n8n/decorators/src/index.ts"],
  "@expert-dollop/n8n-db": ["libs/n8n/db/src/index.ts"],
  "@expert-dollop/n8n-task-runner": ["libs/n8n/task-runner/src/index.ts"],
  "@expert-dollop/n8n-api-types": ["libs/n8n/api-types/src/index.ts"],
  "@expert-dollop/n8n-nodes-langchain": ["libs/n8n/nodes-langchain/src/index.ts"],
  "@expert-dollop/n8n-cli": ["libs/n8n/cli/src/index.ts"]
}
```

### @expert-dollop/n8n-nodes-langchain

LangChain/AI nodes library with abstract base classes:
- **Abstract node classes**: `AbstractLLMNode`, `AbstractEmbeddingNode`, `AbstractVectorStoreNode`, `AbstractMemoryNode`, `AbstractAgentNode`, `AbstractChainNode`, `AbstractDocumentLoaderNode`, `AbstractTextSplitterNode`, `AbstractOutputParserNode`, `AbstractToolNode`
- **Credential utilities**: `AbstractCredentialProvider`, `AbstractOpenAICompatibleCredentialProvider`
- **Helper functions**: `hasMethods`, `isChatModel`, `escapeSingleCurlyBrackets`, `serializeChatHistory`, `hasLongSequentialRepeat`
- **Types**: `LLMProvider`, `EmbeddingProvider`, `VectorStoreProvider`, `ChatMessage`, `Document`

```typescript
import { 
  AbstractLLMNode,
  AbstractVectorStoreNode,
  AbstractAgentNode,
  hasMethods,
  serializeChatHistory,
  type LLMModelConfig,
  type ChatMessage
} from '@expert-dollop/n8n-nodes-langchain';

// Custom LLM node implementation
class MyLLMNode extends AbstractLLMNode {
  async invoke(prompt: string) { ... }
  async invokeChat(messages: ChatMessage[]) { ... }
  async *stream(prompt: string) { ... }
}

// Vector store implementation
class MyVectorStore extends AbstractVectorStoreNode {
  async addDocuments(documents) { ... }
  async similaritySearch(query, k) { ... }
}
```

### @expert-dollop/n8n-cli

CLI abstractions and server utilities:
- **Command abstractions**: `AbstractCommand`, `CommandRegistry`
- **Server abstractions**: `AbstractServer`, `ServerConfig`, `EndpointConfig`
- **Middleware utilities**: `createCorsMiddleware`, `createRawBodyReader`, `createRequestLoggingMiddleware`, `createRateLimitMiddleware`, `createAuthMiddleware`
- **HTTP errors**: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `InternalServerError`, `ValidationError`, `AuthenticationError`

```typescript
import { 
  AbstractCommand,
  AbstractServer,
  createCorsMiddleware,
  BadRequestError,
  UnauthorizedError,
  type ServerConfig
} from '@expert-dollop/n8n-cli';

// Custom CLI command
class StartCommand extends AbstractCommand {
  getCommandName() { return 'start'; }
  async run() {
    this.log('Starting server...');
    // ...
  }
}

// Custom server
class MyServer extends AbstractServer {
  async init() { ... }
  async start() { ... }
  protected setupHealthCheck() { ... }
}

// Middleware usage
app.use(createCorsMiddleware({ origin: true }));
app.use(createRateLimitMiddleware(100, 60000));
```
