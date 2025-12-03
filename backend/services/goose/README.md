# Goose Backend Services

This directory contains the Goose AI Agent backend services, integrated using the **Strangler Fig Pattern**.

## Overview

Goose backend is a Rust-based system built on Tokio (async runtime) and rmcp (Model Context Protocol). It provides:

- AI agent orchestration
- LLM provider abstraction
- MCP server integration
- Tool execution engine
- Recipe-based automation
- Conversation state management

## Architecture

### Workspace Structure

The `crates/` directory is a Cargo workspace containing:

```
crates/
├── goose/              Core AI agent library
│   ├── src/
│   │   ├── agents/           Agent orchestration
│   │   │   ├── agent.rs                    Core AI agent
│   │   │   ├── extension_manager.rs        MCP extensions
│   │   │   └── sub_recipe_manager.rs       Recipe automation
│   │   ├── conversation/     Conversation management
│   │   │   └── mod.rs                      State, ordering, dedup
│   │   ├── providers/        LLM providers
│   │   │   ├── anthropic.rs               Claude integration
│   │   │   ├── openai.rs                  OpenAI integration
│   │   │   ├── azure.rs                   Azure OpenAI
│   │   │   ├── bedrock.rs                 AWS Bedrock
│   │   │   ├── gcpvertexai.rs             Google Vertex AI
│   │   │   ├── databricks.rs              Databricks
│   │   │   └── ...                        More providers
│   │   ├── recipe/           Workflow automation
│   │   │   └── mod.rs                      Recipe configuration
│   │   └── oauth/            OAuth 2.0 flows
│   └── Cargo.toml
├── goose-server/       HTTP API server
│   ├── src/
│   │   ├── auth.rs           Authentication & API keys
│   │   └── main.rs           Server entry point
│   └── Cargo.toml
├── goose-mcp/          MCP server implementations
├── goose-cli/          CLI interface
├── goose-bench/        Benchmarking suite
└── goose-test/         Test utilities
```

## Critical Components

### 1. Core AI Agent (`crates/goose/src/agents/agent.rs`)

The heart of Goose - orchestrates conversations, tools, and LLM interactions.

**Responsibilities:**
- Message handling and routing
- Tool execution coordination
- LLM request/response processing
- Extension lifecycle management
- Context management

### 2. Extension Manager (`crates/goose/src/agents/extension_manager.rs`)

MCP Extension Discovery and Lifecycle Management.

**Responsibilities:**
- Discover available MCP extensions
- Load and initialize extensions
- Manage extension state
- Handle extension communication
- Provide extension metadata

**Critical**: This component is essential for the platform's extensibility.

### 3. Recipe System (`crates/goose/src/recipe/mod.rs`)

Configuration for automated task workflows and tool orchestration.

**Responsibilities:**
- Parse YAML/JSON recipe configs
- Define multi-step tasks
- Configure tool chains
- Manage workflow state
- Validate recipe structure

**Integration Potential**: Can work with apps/ai/n8n for advanced orchestration.

### 4. Sub-Recipe Manager (`crates/goose/src/agents/sub_recipe_manager.rs`)

Processes automation recipes for complex engineering tasks.

**Responsibilities:**
- Execute recipe workflows
- Manage sub-recipe dependencies
- Handle recipe parameters
- Track execution state
- Report progress

**Complexity**: High - handles nested workflows and dynamic tool configurations.

### 5. Conversation Manager (`crates/goose/src/conversation/mod.rs`)

Manages conversation state, message ordering, deduplication, and context management.

**Responsibilities:**
- Maintain conversation history
- Order and deduplicate messages
- Manage conversation context
- Handle tool call results
- Serialize/deserialize state

### 6. LLM Providers (`crates/goose/src/providers/`)

Provider abstraction layer for multiple LLM services.

**Supported Providers:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Azure OpenAI
- AWS Bedrock
- GCP Vertex AI
- Databricks
- Ollama (local)
- LiteLLM (proxy)
- And many more...

**Architecture:**
- `base.rs` - Provider trait definition
- `factory.rs` - Provider instantiation
- Individual provider implementations
- `oauth.rs` - OAuth 2.0 flows
- Provider-specific auth (Azure, GCP)

## Dependencies

### Key Rust Crates

- **tokio** (1.43) - Async runtime
- **rmcp** (0.9.1) - Model Context Protocol
- **axum** (0.8.1) - HTTP server framework
- **reqwest** (0.12.9) - HTTP client
- **serde** (1.0) - Serialization
- **sqlx** (0.7) - Database access
- **tracing** (0.1) - Observability

### Build Requirements

- Rust 2021 edition
- Cargo workspace resolver 2

## Building

```bash
# Build all crates
cd crates
cargo build --release

# Build specific crate
cargo build -p goose --release
cargo build -p goose-server --release

# Run tests
cargo test --workspace

# Run server
cargo run -p goose-server
```

## Running the Server

The `goose-server` binary (`goosed`) provides an HTTP API:

```bash
# Start server
./target/release/goosed

# With custom config
./target/release/goosed --config config.toml
```

## API Authentication

See `backend/auth/goose/` for authentication components:

- Simple secret-based API keys
- HTTP API protections
- OAuth 2.0 flows for providers
- Azure AD integration
- GCP service account auth

## Integration with Expert-Dollop

### DAPR Integration (Future)

The Goose backend can be integrated with DAPR:

1. **State Management**: Use DAPR state stores for conversation persistence
2. **Pub/Sub**: Emit events for recipe execution, tool calls
3. **Service Invocation**: Call other Expert-Dollop services
4. **Secrets**: Store API keys in DAPR secret stores

### Service Mesh

Goose server can run as a microservice:

```yaml
# docker-compose.yml example
services:
  goose-server:
    image: goose-server:latest
    ports:
      - "8000:8000"
    environment:
      - GOOSE_API_KEY=${GOOSE_API_KEY}
    # Add DAPR sidecar
  goose-server-dapr:
    image: daprio/dapr:latest
    command: ["./daprd", "--app-id", "goose-server", "--app-port", "8000"]
    depends_on:
      - goose-server
```

## Class Abstraction & DDD

Following DDD principles with class abstraction:

### Domain Model
- **Agent** - Aggregate root for AI agent interactions
- **Conversation** - Aggregate for conversation state
- **Recipe** - Aggregate for workflow definitions
- **Extension** - Entity for MCP extensions
- **Provider** - Value object for LLM provider config

### Repository Pattern
- `ConversationRepository` - Persists conversations
- `RecipeRepository` - Manages recipes
- `ExtensionRepository` - Handles extensions

### Service Layer
- `AgentService` - Orchestrates agent operations
- `RecipeService` - Executes recipes
- `ProviderService` - Manages LLM providers

## Security Considerations

- API key rotation
- Secret storage (keyring integration)
- OAuth token refresh
- Provider credential management
- Input validation
- Output sanitization

## License

Apache-2.0 (inherited from original Goose project)
