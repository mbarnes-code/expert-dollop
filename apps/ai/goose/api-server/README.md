# Goose API Server

Lightweight HTTP API server that wraps the Goose AI Agent for integration with n8n workflows and other services.

## Status

**Placeholder Implementation** - This server currently returns mock responses. It demonstrates the API contract and integration points.

## Running

```bash
cargo run
```

Server will start on `http://localhost:8000`

## Configuration

Environment variables:
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)

## API Endpoints

### Health Check
```bash
GET /health
```

### Execute Conversation
```bash
POST /api/conversation
Content-Type: application/json

{
  "message": "Analyze this data",
  "session_id": "optional-session-id",
  "model": "gpt-4",
  "extensions": ["developer", "todo"],
  "wait_for_completion": true,
  "include_context": true
}
```

### Execute Recipe
```bash
POST /api/recipe
Content-Type: application/json

{
  "recipe_name": "code-review",
  "parameters": { "repository": "my-repo" },
  "model": "gpt-4"
}
```

### Execute Skill
```bash
POST /api/skill
Content-Type: application/json

{
  "skill_name": "summarize-text",
  "input": "Long text to summarize..."
}
```

### Get Context
```bash
GET /api/context/:session_id
```

## Next Steps

To complete the implementation:

1. Add dependency on Goose agent from `features/goose/crates/goose`
2. Initialize Goose agent in AppState
3. Implement actual handlers that call Goose functions
4. Add error handling and validation
5. Add metrics and tracing
6. Add DAPR integration
7. Add authentication/authorization

## Integration

This server is designed to be called by:
- n8n workflows via GooseAgent nodes
- Integration adapters (GooseAgentBridge)
- Other microservices in the monorepo

## Development

```bash
# Run with debug logging
RUST_LOG=debug cargo run

# Build release binary
cargo build --release

# Run tests
cargo test
```
