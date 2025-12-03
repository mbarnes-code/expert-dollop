# Goose AI Agent - Strangler Fig Migration Guide

## Overview

This document describes the integration of the Goose AI agent into the Expert-Dollop platform using the **Strangler Fig Pattern**. This approach allows for gradual migration while maintaining full functionality of the original Goose project.

## What is the Strangler Fig Pattern?

The Strangler Fig pattern is a gradual migration strategy named after the strangler fig tree that grows around another tree. Instead of replacing the old system all at once, we:

1. Create new structure alongside the old
2. Use symlinks to expose functionality in new locations
3. Gradually extract and refactor components
4. Eventually "strangle out" the old implementation

**Benefits:**
- Low risk - original code continues to work
- Incremental - migrate piece by piece
- Reversible - can roll back at any time
- Testable - validate each step

## Migration Structure

### Phase 1: Symlink Integration (Current)

```
expert-dollop/
├── features/goose/              # Original goose project (unchanged)
│   ├── ui/desktop/              # Electron desktop app
│   ├── documentation/           # Docusaurus docs
│   └── crates/                  # Rust workspace
│       ├── goose/               # Core library
│       ├── goose-server/        # HTTP server
│       ├── goose-mcp/           # MCP implementations
│       ├── goose-cli/           # CLI interface
│       └── ...
│
├── apps/ai/goose/               # New frontend location
│   ├── desktop -> ../../../features/goose/ui/desktop
│   ├── documentation -> ../../../features/goose/documentation
│   └── README.md
│
├── backend/services/goose/      # New backend location
│   ├── crates -> ../../../features/goose/crates
│   └── README.md
│
└── backend/auth/goose/          # New auth location
    ├── server_auth.rs -> ../../../features/goose/crates/goose-server/src/auth.rs
    ├── oauth -> ../../../features/goose/crates/goose/src/oauth
    ├── provider_oauth.rs -> ../../../features/goose/crates/goose/src/providers/oauth.rs
    ├── azureauth.rs -> ../../../features/goose/crates/goose/src/providers/azureauth.rs
    ├── gcpauth.rs -> ../../../features/goose/crates/goose/src/providers/gcpauth.rs
    └── README.md
```

### Critical Components Preserved

All critical components are accessible through symlinks:

#### Frontend (`apps/ai/goose/desktop`)
- Electron desktop application
- React + TypeScript UI
- Web-based interface
- OpenAPI client

#### Backend Core (`backend/services/goose/crates/goose`)
- **Agent** (`src/agents/agent.rs`) - Core AI orchestration
- **Extension Manager** (`src/agents/extension_manager.rs`) - MCP lifecycle
- **Recipe System** (`src/recipe/mod.rs`) - Workflow automation
- **Sub-Recipe Manager** (`src/agents/sub_recipe_manager.rs`) - Complex workflows
- **Conversation** (`src/conversation/mod.rs`) - State management
- **Providers** (`src/providers/`) - LLM abstraction

#### Backend Server (`backend/services/goose/crates/goose-server`)
- HTTP API server
- WebSocket support
- API routing

#### Authentication (`backend/auth/goose`)
- API key authentication
- OAuth 2.0 flows
- Cloud provider auth (Azure, GCP)

## Technology Stack

### Backend
- **Language**: Rust 2021
- **Async Runtime**: Tokio 1.43
- **Protocol**: rmcp 0.9.1 (Model Context Protocol)
- **HTTP**: Axum 0.8.1
- **Database**: SQLx + SQLite
- **Testing**: cargo test

### Frontend
- **Runtime**: Electron 38
- **Framework**: React 19 + TypeScript 5.9
- **Build**: Vite 7 + Electron Forge
- **UI**: Radix UI + TailwindCSS 4
- **Testing**: Vitest + Playwright

## Running Goose

### Desktop Application

```bash
cd apps/ai/goose/desktop
npm install
npm run start-gui
```

### Backend Server

```bash
cd backend/services/goose
cargo build --release -p goose-server
cargo run -p goose-server
```

### CLI

```bash
cd backend/services/goose
cargo build --release -p goose-cli
./target/release/goose
```

## Integration Points

### With n8n Workflows

The Goose recipe system can integrate with n8n:

**Goose → n8n:**
```yaml
# recipe.yaml
name: "trigger-n8n-workflow"
steps:
  - tool: "webhook"
    endpoint: "http://n8n:5678/webhook/goose-trigger"
    data: ${context}
```

**n8n → Goose:**
```json
// n8n HTTP Request node
{
  "url": "http://goose-server:8000/api/execute",
  "method": "POST",
  "body": {
    "recipe": "automated-task",
    "parameters": {...}
  }
}
```

### With DAPR (Future)

```yaml
# dapr component for goose state
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore-goose
spec:
  type: state.postgresql
  metadata:
    - name: connectionString
      value: "..."
    - name: schemaName
      value: "goose"
```

## DDD Architecture

### Bounded Context: AI Agent

The Goose integration represents a distinct bounded context within the AI domain.

**Aggregate Roots:**
- `Agent` - The AI agent instance
- `Conversation` - Dialogue session
- `Recipe` - Workflow definition

**Entities:**
- `Extension` - MCP extension
- `Tool` - Executable tool
- `Message` - Conversation message

**Value Objects:**
- `ProviderConfig` - LLM provider configuration
- `RecipeStep` - Workflow step
- `ToolParameter` - Tool parameter

**Domain Services:**
- `AgentOrchestrator` - Coordinates agent operations
- `RecipeExecutor` - Executes workflows
- `ExtensionLoader` - Manages extensions
- `ProviderFactory` - Creates LLM providers

**Repositories:**
- `ConversationRepository` - Persists conversations
- `RecipeRepository` - Stores recipes
- `ExtensionRepository` - Manages extensions

## Migration Phases

### Phase 1: Symlink Integration ✅ (Complete)

**Goal:** Expose Goose functionality in new locations without modifying code.

**Actions:**
- [x] Create directory structure
- [x] Create symlinks
- [x] Document integration
- [x] Verify symlink accessibility
- [x] Create comprehensive documentation

### Phase 2: Shared Abstractions ✅ (Complete)

**Goal:** Extract common interfaces to shared libraries.

**Actions:**
- [x] Create `libs/ai/agent-interface/`
- [x] Define `AgentProvider` interface
- [x] Extract conversation types (Message, Conversation, ConversationRepository)
- [x] Create recipe schema library (Recipe, RecipeStep, RecipeExecutor)
- [x] Extract extension types (Extension, ExtensionManager, ExtensionInterface)
- [x] Add Zod schemas for runtime validation
- [x] Create comprehensive README and documentation

**Deliverables:**
- `@expert-dollop/ai/agent-interface` - TypeScript library with all shared interfaces
- Full Zod schema validation
- Repository patterns for persistence
- Complete TypeScript type definitions

### Phase 3: Backend Service Migration (Next)

**Goal:** Wrap Goose services with DAPR-compliant APIs.

**Actions:**
- [ ] Create DAPR components
- [ ] Add pub/sub for events
- [ ] Migrate state to DAPR stores
- [ ] Add service-to-service calls

### Phase 4: Frontend Integration

**Goal:** Integrate with existing AI apps.

**Actions:**
- [ ] Create shared UI components in `libs/ai/ui/`
- [ ] Integrate with `apps/ai/chat/`
- [ ] Unified authentication
- [ ] Shared state management

### Phase 5: Complete Migration

**Goal:** Full DDD-compliant implementation.

**Actions:**
- [ ] Replace symlinks with native code
- [ ] Full DAPR integration
- [ ] Unified testing
- [ ] Remove features/goose dependency

## Development Workflow

### Making Changes

**To the original Goose code:**
```bash
cd features/goose
# Make changes as normal
cargo build
npm run build
```

**Changes are immediately visible** in new locations due to symlinks.

### Adding New Features

**Should I modify features/goose or create new code?**

- **Goose-specific features**: Modify `features/goose`
- **Integration features**: Create in `apps/ai/goose` or `backend/services/goose`
- **Shared features**: Create in `libs/ai/`

### Testing

```bash
# Test original Goose
cd features/goose
cargo test --workspace
npm test

# Test integration
cd apps/ai/goose/desktop
npm test

cd backend/services/goose
cargo test
```

## Security Considerations

### API Keys
- Store in environment variables or DAPR secret stores
- Never commit to repository
- Rotate regularly

### OAuth Tokens
- Stored securely in system keyring
- Automatic refresh
- Scoped appropriately

### Cloud Credentials
- Use service accounts
- Minimum necessary permissions
- Audit access

## Monitoring & Observability

### Tracing
Goose includes OpenTelemetry support:

```rust
// Already configured in goose
use tracing::info;
info!("Agent started");
```

### Metrics
- Agent execution time
- LLM API calls
- Token usage
- Error rates

### Logs
- Structured logging via `tracing`
- Log levels: ERROR, WARN, INFO, DEBUG, TRACE
- Export to OTLP endpoint

## Troubleshooting

### Symlinks not working?

Check if Git is configured to handle symlinks:
```bash
git config core.symlinks true
```

On Windows, ensure Developer Mode is enabled or run as Administrator.

### Build failures?

Ensure Rust toolchain is installed:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update
```

### Node dependencies?

```bash
cd apps/ai/goose/desktop
rm -rf node_modules package-lock.json
npm install
```

## Contributing

When contributing to the Goose integration:

1. **Understand the pattern** - Read this guide first
2. **Minimal changes** - Prefer symlinks over code changes
3. **Document integration** - Update READMEs
4. **Test thoroughly** - Ensure both old and new paths work
5. **Follow DDD** - Respect bounded contexts

## References

### Documentation
- `apps/ai/goose/README.md` - Frontend integration
- `backend/services/goose/README.md` - Backend services
- `backend/auth/goose/README.md` - Authentication

### Original Project
- GitHub: https://github.com/block/goose
- Docs: https://block.github.io/goose/
- License: Apache-2.0

### Expert-Dollop Docs
- Main README: `/README.md`
- DAPR Integration: `/infrastructure/dapr/README.md` (if exists)
- Backend API: `/backend/api/README.md` (if exists)

## License

This integration maintains the Apache-2.0 license of the original Goose project.
