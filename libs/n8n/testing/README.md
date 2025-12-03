# N8N Testing Infrastructure

This directory contains the shared testing infrastructure for cross-module integration testing of the n8n workflow automation platform.

## Overview

The `@expert-dollop/n8n-testing` library provides reusable test utilities, factories, and helpers to ensure consistency across all n8n module tests.

## Structure

```
libs/n8n/testing/
├── src/
│   ├── factories/           # Test data generators
│   │   ├── workflow.factory.ts
│   │   ├── user.factory.ts
│   │   └── execution.factory.ts
│   ├── helpers/            # Test utility functions
│   │   ├── database-helpers.ts
│   │   ├── auth-helpers.ts
│   │   └── workflow-helpers.ts
│   ├── mocks/              # Mock implementations (future)
│   ├── fixtures/           # Test data fixtures (future)
│   └── index.ts            # Main export
├── package.json
└── tsconfig.json
```

## Usage

### Installing

```bash
npm install @expert-dollop/n8n-testing --workspace=your-test-package
```

### Importing

```typescript
import {
  WorkflowFactory,
  UserFactory,
  ExecutionFactory,
  validateWorkflowStructure,
  createMockJWT,
  createMockAuthHeaders
} from '@expert-dollop/n8n-testing';
```

## Factories

### WorkflowFactory

Create test workflows with various configurations:

```typescript
// Basic workflow
const workflow = WorkflowFactory.create();

// Two-node workflow with connections
const workflow = WorkflowFactory.createSimpleTwoNode();

// Workflow with HTTP request
const workflow = WorkflowFactory.createWithHttpRequest('https://api.example.com');

// Active workflow
const workflow = WorkflowFactory.createActive();

// Custom workflow
const workflow = WorkflowFactory.create({
  name: 'My Workflow',
  active: true,
  tags: ['test', 'demo']
});
```

### UserFactory

Create test users with different roles:

```typescript
// Basic user
const user = UserFactory.create();

// Owner user
const owner = UserFactory.createOwner();

// Admin user
const admin = UserFactory.createAdmin();

// Multiple users
const users = UserFactory.createMany(5);

// Custom user
const user = UserFactory.create({
  email: 'custom@example.com',
  role: 'global:admin'
});
```

### ExecutionFactory

Create test execution records:

```typescript
// Basic execution
const execution = ExecutionFactory.create({ workflowId: 'workflow-123' });

// Successful execution
const execution = ExecutionFactory.createSuccess('workflow-123');

// Failed execution
const execution = ExecutionFactory.createError('workflow-123', 'Node failed');

// Running execution
const execution = ExecutionFactory.createRunning('workflow-123');
```

## Helpers

### Database Helpers

```typescript
import { 
  createTestDatabaseHelper,
  waitFor,
  sleep,
  assertThrows
} from '@expert-dollop/n8n-testing';

// Create in-memory database helper
const db = createTestDatabaseHelper();
await db.setup();

// Wait for condition
await waitFor(() => someCondition === true, 5000);

// Assert error is thrown
await assertThrows(async () => {
  await someFunctionThatShouldFail();
}, 'Expected error message');
```

### Authentication Helpers

```typescript
import {
  createMockJWT,
  createMockAPIKey,
  createMockAuthHeaders,
  parseMockJWT
} from '@expert-dollop/n8n-testing';

// Create JWT token
const token = createMockJWT({ userId: 'user-123', role: 'global:admin' });

// Create API key
const apiKey = createMockAPIKey('n8n_api');

// Create auth headers
const jwtHeaders = createMockAuthHeaders('jwt');
const apiKeyHeaders = createMockAuthHeaders('apikey');
const cookieHeaders = createMockAuthHeaders('cookie');

// Parse JWT payload
const payload = parseMockJWT(token);
console.log(payload.sub, payload.email, payload.role);
```

### Workflow Helpers

```typescript
import {
  validateWorkflowStructure,
  countNodesByType,
  findNodeByName,
  getNodeTypes,
  isExecutable
} from '@expert-dollop/n8n-testing';

const workflow = WorkflowFactory.createSimpleTwoNode();

// Validate structure
validateWorkflowStructure(workflow); // throws if invalid

// Count nodes by type
const counts = countNodesByType(workflow);
// { 'n8n-nodes-base.start': 1, 'n8n-nodes-base.set': 1 }

// Find specific node
const startNode = findNodeByName(workflow, 'Start');

// Get all node types
const types = getNodeTypes(workflow);

// Check if executable
const canExecute = isExecutable(workflow); // true/false
```

## Best Practices

1. **Use factories for test data** - Don't create test data manually
2. **Use helpers for common operations** - Avoid duplicating utility code
3. **Keep tests focused** - Test one interaction per test case
4. **Use descriptive test names** - Make test intent clear
5. **Clean up after tests** - Use beforeEach/afterEach hooks

## Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorkflowFactory,
  ExecutionFactory,
  validateWorkflowStructure,
  isExecutable
} from '@expert-dollop/n8n-testing';

describe('Workflow Execution Integration', () => {
  let workflow;
  
  beforeEach(() => {
    workflow = WorkflowFactory.createSimpleTwoNode();
  });
  
  it('should create valid workflow', () => {
    expect(() => validateWorkflowStructure(workflow)).not.toThrow();
    expect(isExecutable(workflow)).toBe(true);
  });
  
  it('should link execution to workflow', () => {
    const execution = ExecutionFactory.create({
      workflowId: workflow.id
    });
    
    expect(execution.workflowId).toBe(workflow.id);
    expect(execution.status).toBe('new');
  });
});
```

## Adding New Utilities

To add new test utilities:

1. Create the utility in the appropriate directory:
   - Factories → `src/factories/`
   - Helpers → `src/helpers/`
   - Mocks → `src/mocks/`
   - Fixtures → `src/fixtures/`

2. Export from `src/index.ts`:
   ```typescript
   export * from './factories/my-new-factory';
   export * from './helpers/my-new-helper';
   ```

3. Document usage in this README

4. Add tests if the utility is complex

## Related Documentation

- [Regression Test Report](../../docs/regression-test/n8n-migration-regression-test-report.md)
- [Integration Testing Progress](../../docs/regression-test/n8n-integration-testing-progress.md)
- [Integration Tests](../../tests/integration/n8n/)

## License

Apache-2.0
