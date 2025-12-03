# N8N Cross-Module Integration Tests

This directory contains integration tests that validate interactions between n8n modules in the monorepo.

## Purpose

These tests ensure that migrated n8n modules work together correctly by testing:
- Data flow between modules
- API contracts between modules
- Cross-module business logic
- Module integration points

## Test Suites

### 1. Workflow Operations (`n8n/workflow-operations.test.ts`)

**Modules Tested:**
- `libs/n8n/workflow` ↔ `apps/ai/n8n/db` ↔ `libs/n8n/testing`

**Test Coverage:**
- Workflow creation and validation
- Node connections and relationships
- Workflow structure integrity
- Executability checks
- Node type analysis

**Test Count:** 12 test cases

---

### 2. User and Authentication (`n8n/user-auth.test.ts`)

**Modules Tested:**
- `backend/services/n8n/auth` ↔ `backend/api/n8n` ↔ `libs/n8n/testing`

**Test Coverage:**
- User creation with different roles
- JWT token generation and validation
- API key generation
- Authentication header creation
- User-authentication integration

**Test Count:** 11 test cases

---

### 3. Workflow Execution Lifecycle (`n8n/workflow-execution.test.ts`)

**Modules Tested:**
- `libs/n8n/workflow` ↔ `apps/ai/n8n/core` ↔ `libs/n8n/testing`

**Test Coverage:**
- Execution record creation
- Execution status transitions
- Different execution modes
- Execution timing tracking
- Workflow-execution linking
- Error handling

**Test Count:** 13 test cases

---

## Running Tests

### Run All Tests

```bash
cd tests/integration
npm install
npm test
```

### Run Specific Test Suite

```bash
cd tests/integration
npx vitest run n8n/workflow-operations.test.ts
npx vitest run n8n/user-auth.test.ts
npx vitest run n8n/workflow-execution.test.ts
```

### Run in Watch Mode

```bash
cd tests/integration
npm run test:watch
```

### Run with Coverage

```bash
cd tests/integration
npm test -- --coverage
```

### Run with UI

```bash
cd tests/integration
npm run test:ui
```

## Test Structure

Each test suite follows this pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { /* factories and helpers */ } from '@expert-dollop/n8n-testing';

describe('Cross-Module Integration: Feature Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange: Create test data
      const testData = Factory.create();
      
      // Act: Perform operation
      const result = performOperation(testData);
      
      // Assert: Verify outcome
      expect(result).toBeDefined();
    });
  });
});
```

## Adding New Tests

1. **Create test file** in `n8n/` directory:
   ```bash
   touch n8n/my-new-feature.test.ts
   ```

2. **Import test utilities**:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { /* needed utilities */ } from '@expert-dollop/n8n-testing';
   ```

3. **Write tests** following AAA pattern (Arrange, Act, Assert)

4. **Document** in this README

5. **Update progress report** in `docs/regression-test/n8n-integration-testing-progress.md`

## Test Utilities

All test utilities are provided by `@expert-dollop/n8n-testing`:

- **Factories:** WorkflowFactory, UserFactory, ExecutionFactory
- **Helpers:** Database, Auth, Workflow validation
- **Mocks:** (Future) Service mocks, API response mocks

See [Testing Library Documentation](../../libs/n8n/testing/README.md) for details.

## CI/CD Integration

These tests run automatically via GitHub Actions:

**Triggers:**
- Push to `main` or `copilot/**` branches
- Pull requests to `main`
- Changes to n8n modules or integration tests

**Workflow File:** `.github/workflows/n8n-integration-tests.yml`

**Node Versions Tested:** 18, 20

## Test Results

Test results are:
- Uploaded as GitHub Actions artifacts
- Posted as PR comments
- Tracked in progress reports

View the latest results in:
- [Integration Testing Progress Report](../../docs/regression-test/n8n-integration-testing-progress.md)

## Guidelines

### DO
- ✅ Test cross-module interactions
- ✅ Use factories for test data
- ✅ Keep tests focused and independent
- ✅ Clean up after tests
- ✅ Use descriptive test names
- ✅ Document complex test scenarios

### DON'T
- ❌ Test internal module logic (use unit tests)
- ❌ Create test data manually
- ❌ Share state between tests
- ❌ Test implementation details
- ❌ Write flaky tests

## Module Interaction Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Integration Test Layer                    │
│                (@expert-dollop/n8n-testing)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │libs/n8n/ │  │apps/ai/  │  │backend/  │
        │workflow  │  │n8n/db    │  │api/n8n   │
        │db        │  │n8n/core  │  │services/ │
        │testing   │  │          │  │n8n/auth  │
        └──────────┘  └──────────┘  └──────────┘
```

## Future Tests

Planned test suites:

- [ ] API Endpoint Integration (API ↔ Database ↔ Auth)
- [ ] Credential Management (Credentials ↔ Encryption ↔ Database)
- [ ] Workflow Activation Flow (Workflow ↔ Execution ↔ Triggers)
- [ ] Execution History (Execution ↔ Database ↔ API)
- [ ] Multi-user Collaboration (Users ↔ Projects ↔ Workflows)
- [ ] Webhook Triggers (Webhooks ↔ Execution ↔ Workflows)
- [ ] Error Propagation (All modules)
- [ ] Performance Benchmarks (Cross-module calls)

## Troubleshooting

### Tests Won't Run

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Import Errors

Make sure workspace dependencies are installed:
```bash
cd ../.. # Go to repo root
npm install
```

### TypeScript Errors

```bash
# Check TypeScript config
cat tsconfig.json

# Rebuild dependencies
npm run build --workspaces
```

## Related Documentation

- [Regression Test Report](../../docs/regression-test/n8n-migration-regression-test-report.md) - Complete test migration strategy
- [Integration Testing Progress](../../docs/regression-test/n8n-integration-testing-progress.md) - Current progress
- [Testing Library](../../libs/n8n/testing/README.md) - Test utilities documentation

## License

Apache-2.0
