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
  "@expert-dollop/n8n-db": ["libs/n8n/db/src/index.ts"]
}
```
