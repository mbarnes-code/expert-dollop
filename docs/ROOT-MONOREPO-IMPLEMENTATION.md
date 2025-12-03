# Root Monorepo Implementation Strategy

This document explains the implementation strategy for integrating Goose and n8n in the root-level monorepo, outside the `features/` strangler fig directory.

## Current Architecture

### Features Directory (Strangler Fig Pattern)
- `features/goose/` - Original Goose project (open source)
- `features/n8n/` - Original n8n project (open source)

These are the complete, unmodified projects maintained for reference and gradual migration.

### Apps Directory (Root Monorepo)
- `apps/ai/goose/` - Goose integration wrapper
- `apps/ai/n8n/` - n8n platform components  
- `apps/ai/n8n-nodes-goose/` - Custom n8n nodes
- `apps/ai/goose-extensions/` - Native Goose extensions

### Libs Directory (Shared Libraries)
- `libs/ai/integration-adapters/` - Bridges and adapters
- `libs/ai/workflow-agent-types/` - Common types

## Implementation Approach

### 1. API Wrapper Pattern (Current)

Instead of duplicating code, we create thin API wrappers:

**Goose API Server** (`apps/ai/goose/api-server/`)
- Lightweight Axum HTTP server
- Exposes REST endpoints
- Can import Goose as a library dependency from `features/goose/`
- Adds monorepo-specific concerns (metrics, DAPR, tracing)

**n8n Custom Nodes** (`apps/ai/n8n-nodes-goose/`)
- TypeScript nodes that call Goose API server
- Integrate directly into n8n workflows
- Use integration adapters for type safety

**Goose Extensions** (`apps/ai/goose-extensions/`)
- Rust extension for Goose that calls n8n API
- Can be built as native Node.js module (napi-rs)
- Provides tools for workflow execution

### 2. Integration Adapters (Shared)

**TypeScript Bridges** (`libs/ai/integration-adapters/`)
- `GooseAgentBridge` - n8n → Goose communication
- `N8nWorkflowAdapter` - Goose → n8n communication
- `RecipeWorkflowConverter` - Bidirectional conversion
- `SharedExecutionContext` - State management

These provide the glue layer between systems.

### 3. Current Status

#### ✅ Completed
- Package structure and build configurations
- TypeScript types and adapters (scaffolding)
- Rust extension structure (scaffolding)
- Documentation (150KB+)
- Integration patterns and examples

#### 🚧 In Progress
- **Goose API Server** - Placeholder implementation with mock responses
  - Server runs and accepts requests
  - Returns mock data
  - TODO: Add actual Goose agent integration

- **n8n Custom Nodes** - Ready for build
  - Node definitions complete
  - TODO: Build and test with n8n

- **Goose Extensions** - Rust structure ready
  - Extension code written
  - TODO: Build and test with Goose

#### 📋 Next Steps
1. Complete Goose API server implementation
2. Build and test n8n nodes
3. Build and test Goose extension
4. Add actual Goose agent dependency
5. Integration testing
6. Deployment configuration

## Why This Approach?

### Advantages
1. **No Code Duplication** - Uses original projects as dependencies
2. **Minimal Maintenance** - Updates to features/ automatically available
3. **Clean Separation** - Integration code separate from core logic
4. **Type Safety** - Shared TypeScript types ensure compatibility
5. **Performance** - Native integrations (Rust FFI) where needed
6. **Flexibility** - Can deploy components independently

### Trade-offs
1. **Dependency on Features** - Requires features/ directory
2. **Build Complexity** - Multi-language build (Rust + TypeScript)
3. **Runtime Dependencies** - Need running Goose and n8n instances

## Deployment Options

### Option 1: Microservices (Recommended)
- Deploy Goose API server as separate service
- Deploy n8n with custom nodes
- Communication via HTTP/DAPR

### Option 2: Monolith
- Bundle Goose API server with n8n
- In-process communication
- Lower latency, higher coupling

### Option 3: Serverless
- Deploy API endpoints as functions
- Event-driven triggers
- Auto-scaling

## Development Workflow

### Building

```bash
# Build TypeScript packages
cd libs/ai/integration-adapters && npm run build
cd apps/ai/n8n-nodes-goose && npm run build

# Build Rust components  
cd apps/ai/goose-extensions && cargo build --release
cd apps/ai/goose/api-server && cargo build --release
```

### Running

```bash
# Start Goose API server
cd apps/ai/goose/api-server
cargo run

# Install n8n nodes
cd apps/ai/n8n-nodes-goose
npm link

# Start n8n with custom nodes
n8n start
```

### Testing

```bash
# Test integration adapters
cd libs/ai/integration-adapters && npm test

# Test API server
cd apps/ai/goose/api-server && cargo test

# Integration tests
# TODO: Add integration test suite
```

## Documentation

- **Integration Index**: `docs/INTEGRATION-INDEX.md`
- **Code-Level Integration**: `docs/code-level-integration.md`  
- **Examples**: `docs/code-integration-examples.md`
- **Deep Integration Summary**: `docs/DEEP-CODE-INTEGRATION-SUMMARY.md`
- **Direct Code Reuse**: `docs/DIRECT-CODE-REUSE.md`

## Future Enhancements

1. **Complete Goose Integration**
   - Add actual Goose agent dependency
   - Implement conversation management
   - Add recipe execution
   - Add skill system

2. **Advanced Features**
   - Native FFI modules (napi-rs)
   - Direct code imports
   - Shared memory IPC
   - WASM integration

3. **Production Readiness**
   - Error handling and retry logic
   - Metrics and monitoring
   - Health checks and probes
   - Security hardening
   - Load testing

4. **Developer Experience**
   - Hot reload for development
   - Better debugging tools
   - Integration test suite
   - CI/CD pipelines

## Conclusion

The current implementation provides a solid foundation for deep integration while maintaining clean architecture. The placeholder implementations demonstrate the API contracts and can be progressively enhanced with actual Goose agent functionality.

The approach balances:
- **Immediate functionality** - Mock responses work for testing
- **Future flexibility** - Easy to add real implementations
- **Code quality** - Clean separation of concerns
- **Performance** - Multiple integration layers for different use cases
