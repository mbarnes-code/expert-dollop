# Goose AI Agent Integration

This directory contains the Goose AI agent integration using the **Strangler Fig Pattern** for gradual migration into the Expert-Dollop platform.

## Overview

Goose is a local, extensible, open source AI agent that automates engineering tasks. It's built with Rust (using Tokio and rmcp) for the backend and TypeScript/React for the frontend.

## Architecture

### Strangler Fig Migration Pattern

The strangler fig pattern allows us to gradually integrate the Goose project while maintaining its existing functionality. Instead of a complete rewrite, we create a new structure that coexists with the original implementation.

```
apps/ai/goose/
├── desktop/          -> ../../features/goose/ui/desktop (symlink)
│   ├── Web-based desktop application (Electron)
│   ├── TypeScript + React frontend
│   └── OpenAPI-generated API client
└── documentation/    -> ../../features/goose/documentation (symlink)
    └── Docusaurus-based documentation site
```

## Desktop Application

The desktop application is a full-featured Electron app with:

- **Frontend**: React 19 + TypeScript + Vite
- **UI Components**: Radix UI + TailwindCSS
- **API Integration**: Auto-generated from OpenAPI spec
- **Testing**: Vitest + Playwright E2E tests
- **Build System**: Electron Forge

### Development

```bash
cd desktop
npm install
npm run start-gui
```

### Key Features

- AI-powered conversation interface
- Tool execution and orchestration
- Recipe-based automation workflows
- MCP (Model Context Protocol) server integration
- Multi-model LLM support

## Integration with n8n

The Goose recipe system (`crates/goose/src/recipe/mod.rs`) can integrate with n8n workflows for advanced automation:

- Recipe configs define multi-step tasks
- Tool configurations orchestrate complex workflows
- Can trigger n8n workflows or be triggered by n8n

## Critical Components

The following components are preserved during migration:

### Backend Services (`backend/services/goose/`)
- **Agent Core** (`crates/goose/src/agents/agent.rs`)
  - Orchestrates conversations, tools, and LLM interactions
- **Extension Manager** (`crates/goose/src/agents/extension_manager.rs`)
  - MCP Extension Discovery and Lifecycle Management
- **Recipe System** (`crates/goose/src/recipe/mod.rs`)
  - Configuration for automated task workflows
- **Sub-Recipe Manager** (`crates/goose/src/agents/sub_recipe_manager.rs`)
  - Processes automation recipes (YAML/JSON configs)
- **Conversation Manager** (`crates/goose/src/conversation/mod.rs`)
  - Manages conversation state, message ordering, and context
- **LLM Providers** (`crates/goose/src/providers/`)
  - Abstraction layer for multiple LLM providers
  - Supports OpenAI, Anthropic, Azure, GCP, AWS Bedrock, and more

### Authentication (`backend/auth/goose/`)
- **Server Auth** (`server_auth.rs` → `goose-server/src/auth.rs`)
  - API key (secret-based) authentication
  - HTTP API protections for web UI communication
- **OAuth** (`oauth/` → `goose/src/oauth/`)
  - OAuth 2.0 flow implementation
  - Token persistence and refresh
- **Provider Auth**
  - Azure AD authentication (`azureauth.rs`)
  - GCP authentication (`gcpauth.rs`)
  - Provider-specific OAuth (`provider_oauth.rs`)

## Technology Stack

### Backend
- **Language**: Rust (2021 edition)
- **Async Runtime**: Tokio 1.43
- **MCP Protocol**: rmcp 0.9.1
- **HTTP Server**: Axum 0.8.1
- **Database**: SQLx with SQLite
- **LLM Integration**: Multiple provider support

### Frontend
- **Runtime**: Electron 38
- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7 + Electron Forge
- **UI Library**: Radix UI + TailwindCSS 4
- **State Management**: SWR for data fetching
- **Testing**: Vitest + Playwright

## DDD Architecture Alignment

Following Domain-Driven Design principles:

### Bounded Context
- **AI Agent Domain**: Goose operates as a distinct bounded context within the AI domain
- **Clear Boundaries**: Maintained through symlink structure and API contracts

### Integration Points
- **Event Bus**: Can publish/subscribe to RabbitMQ events via DAPR
- **State Management**: Can use DAPR state stores for persistence
- **Service Mesh**: Compatible with DAPR sidecar pattern

### Future Migration Path

The strangler fig pattern enables:

1. **Phase 1** (Current): Symlink integration, minimal changes
2. **Phase 2**: Extract shared abstractions to `libs/ai/`
3. **Phase 3**: Migrate backend services to DAPR-compliant modules
4. **Phase 4**: Integrate frontend with existing AI apps
5. **Phase 5**: Complete migration, remove symlinks

## Repository Reference

Original project: https://github.com/block/goose
License: Apache-2.0

## Development Commands

See the desktop application's package.json for available commands:

- `npm run start-gui` - Start desktop application
- `npm run test` - Run unit tests
- `npm run test-e2e` - Run E2E tests
- `npm run lint` - Lint TypeScript/React code
- `npm run build` - Build production bundle

## Documentation

Full documentation is available in the `documentation/` directory, which includes:

- Getting started guides
- API reference
- Architecture documentation
- Contributing guidelines
- Recipes and examples
