# Custom n8n Nodes for Goose AI Agent

This package provides custom n8n nodes that enable direct integration with Goose AI Agent from within n8n workflows.

## Features

- **GooseAgent Node**: Execute Goose agent conversations, recipes, and skills directly from workflows
- **Direct API Integration**: 2-5x faster than MCP-based integration
- **Session Management**: Maintain conversation context across workflow steps
- **Full Extension Support**: Access all Goose extensions (developer, todo, chatrecall, skills)

## Installation

### In n8n

1. Install the package:
```bash
npm install @expert-dollop/n8n-nodes-goose
```

2. Link to n8n custom nodes:
```bash
cd ~/.n8n/custom
ln -s /path/to/apps/ai/n8n-nodes-goose .
```

3. Restart n8n

### Configuration

Set the Goose agent endpoint:

```bash
export GOOSE_AGENT_ENDPOINT="http://localhost:8000"
export GOOSE_API_KEY="optional-api-key"
```

## Nodes

### GooseAgent

Execute Goose AI Agent operations from workflows.

**Operations**:
- **Execute Conversation**: Send a message and get AI response
- **Execute Recipe**: Run a Goose recipe with parameters
- **Execute Skill**: Execute a specific Goose skill
- **Get Context**: Retrieve conversation context

**Example Usage**:

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeConversation",
        "message": "Analyze the data from the previous step",
        "model": "gpt-4",
        "extensions": ["developer", "todo"],
        "options": {
          "waitForCompletion": true,
          "includeContext": true
        }
      },
      "name": "Goose Agent",
      "type": "gooseAgent",
      "typeVersion": 1,
      "position": [450, 300]
    }
  ]
}
```

## Integration with Monorepo

This package is part of the expert-dollop monorepo and uses:

- `@expert-dollop/integration-adapters` - Shared bridges and adapters
- `@expert-dollop/workflow-agent-types` - Common type definitions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Clean
npm run clean
```

## Performance

- **Latency**: ~20-50ms (vs ~50-100ms via MCP)
- **Throughput**: Supports parallel execution
- **Overhead**: Direct HTTP API calls, no MCP serialization

## Documentation

See `docs/code-level-integration.md` for complete integration guide and examples.
