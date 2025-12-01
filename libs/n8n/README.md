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
  "@expert-dollop/n8n-backend-common": ["libs/n8n/backend-common/src/index.ts"]
}
```
