# Goose Agent API Server

This directory will contain a lightweight API server for Goose AI Agent that can be called from n8n workflows and other integrations.

## Architecture

Instead of duplicating the entire Goose codebase, we create a thin API layer that:

1. **Wraps the Goose agent** from `features/goose/crates/goose`
2. **Exposes HTTP endpoints** for conversation, recipes, and skills
3. **Integrates with monorepo infrastructure** (database, DAPR, observability)

## Endpoints

```
POST /api/conversation
POST /api/recipe
POST /api/skill
GET  /api/context/:sessionId
GET  /health
```

## Implementation Strategy

Since the full Goose agent exists in `features/goose/`, we have two approaches:

### Option 1: API Wrapper (Recommended)
Create a lightweight HTTP server that uses the Goose agent as a library dependency:

```rust
// Cargo.toml
[dependencies]
goose = { path = "../../../features/goose/crates/goose" }
```

This allows us to:
- Use the actual Goose implementation
- Add monorepo-specific concerns (metrics, tracing, DAPR integration)
- Keep the API layer thin

### Option 2: Standalone Service
Deploy the Goose agent from features as a service and create a proxy here.

## Current Status

**Not Yet Implemented** - The Goose agent is currently accessed via symlinks from the features directory. To fully implement root-level integration:

1. Create HTTP API server using Axum
2. Import Goose agent from features/goose
3. Expose REST endpoints for n8n integration
4. Add DAPR integration for events and state
5. Add observability (metrics, tracing, logs)

## Temporary Solution

For now, the integration adapters connect directly to a running Goose instance via environment variables:

```bash
export GOOSE_AGENT_ENDPOINT="http://localhost:8000"
```

This can be:
- The Goose desktop app backend
- A standalone Goose server
- A containerized Goose instance

## Future Work

- [ ] Create Axum-based API server
- [ ] Add dependency on features/goose
- [ ] Implement HTTP endpoints
- [ ] Add DAPR integration
- [ ] Add metrics and tracing
- [ ] Containerize for deployment
