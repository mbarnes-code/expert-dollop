# MCP Server Integration

This directory contains Model Context Protocol (MCP) server integration for the expert-dollop platform.

## Overview

MCP servers provide standardized interfaces for AI models to interact with various data sources and tools. This integration allows adding MCP servers to extend the platform's capabilities.

## Structure

```
backend/services/mcp/
├── servers/        # Individual MCP server implementations
├── protocols/      # Protocol definitions and schemas
└── README.md
```

## Adding a New MCP Server

1. Create a new directory in `servers/` for your server
2. Implement the MCP protocol handlers
3. Register the server in the configuration
4. Connect from your client application

## Available Protocols

- `tools` - Tool definitions for AI agents
- `prompts` - Prompt templates
- `resources` - External resource access
- `sampling` - LLM sampling integration

## Configuration

MCP servers can be configured via environment variables:

```bash
MCP_SERVER_PORT=9000
MCP_SERVER_HOST=localhost
MCP_LOG_LEVEL=info
```

## Usage

```python
from mcp import Server, Protocol

server = Server()

@server.tool()
async def my_tool(input: str) -> str:
    return f"Processed: {input}"

server.run()
```
