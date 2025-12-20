# n8n Execution Engine

This directory contains the core execution engine migrated from the n8n project.

## Overview

The execution engine is responsible for:
- Data transformation
- Workflow execution
- Graph processing
- Node execution context management

## Critical Components

### Execution Context
- `execution-context.ts` - Execution context management
- `execution-context.service.ts` - Context service
- `execution-context-hook-registry.service.ts` - Hook registry

### Workflow Execution
- `workflow-execute.ts` - Main workflow execution logic
- `active-workflows.ts` - Active workflow tracking
- `execution-lifecycle-hooks.ts` - Lifecycle hook management

### Node Execution
- `node-execution-context/` - Node-specific execution contexts
- `routing-node.ts` - Request routing for nodes

### Utilities
- `partial-execution-utils/` - Partial execution utilities
- `ssh-clients-manager.ts` - SSH client management
- `scheduled-task-manager.ts` - Task scheduling

## Architecture

The execution engine follows a modular design:

```
                    ┌─────────────────────┐
                    │  Workflow Execute   │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼─────┐  ┌──────▼──────┐  ┌─────▼─────────┐
    │ Active        │  │ Execution   │  │ Lifecycle     │
    │ Workflows     │  │ Context     │  │ Hooks         │
    └───────────────┘  └─────────────┘  └───────────────┘
```

## Usage

```typescript
import { WorkflowExecute, ExecutionContext } from '@apps/ai/n8n/core/execution-engine';
```
