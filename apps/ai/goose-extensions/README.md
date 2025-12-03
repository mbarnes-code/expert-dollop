# Goose Extensions

This directory contains native Rust extensions for Goose AI Agent that enable deep integration with other systems.

## n8n_native Extension

The `n8n_native` extension provides direct workflow execution capabilities from within Goose conversations, bypassing the MCP protocol for performance-critical operations.

### Features

- **Direct Workflow Execution**: Execute n8n workflows via REST API with minimal overhead
- **Workflow Creation**: Generate workflow templates from conversation context
- **Execution Tracking**: Monitor and correlate workflow executions with agent conversations
- **Performance**: 2-5x faster than MCP-based integration

### Tools Provided

1. `execute_workflow_native` - Execute workflows directly
2. `create_workflow_from_context` - Generate workflows from templates
3. `list_workflows_native` - Fast workflow discovery
4. `get_workflow_execution_history` - Execution analytics

### Configuration

Set these environment variables:

```bash
export N8N_API_URL="http://localhost:5678/api/v1"
export N8N_API_KEY="your-api-key"
```

### Usage

Enable the extension in Goose configuration:

```yaml
extensions:
  n8n_native:
    enabled: true
    api_url: http://localhost:5678/api/v1
    api_key: ${N8N_API_KEY}
```

Then use in conversations:

```
User: "Execute the data-processing workflow with source='api'"

Goose: [Uses n8n_native extension to execute workflow]
```

### Building as Native Node.js Module (Optional)

To build as a native module for even tighter integration:

```bash
npm install
npm run build
```

This creates a `.node` file that can be imported directly in TypeScript/JavaScript.

## Integration with Monorepo

This extension is part of the expert-dollop monorepo and integrates with:

- `apps/ai/n8n` - n8n workflow platform
- `libs/ai/integration-adapters` - Shared integration libraries
- `libs/ai/workflow-agent-types` - Common type definitions

## Development

```bash
# Build Rust library
cargo build --release

# Build as Node.js module (optional)
cargo build --release --features napi-module

# Run tests
cargo test
```
