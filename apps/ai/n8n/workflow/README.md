# n8n Workflow Module

This directory contains the workflow expression evaluation and data transformation logic migrated from the n8n project.

## Overview

The workflow module provides:
- Expression evaluation
- Data transformation utilities
- Graph processing
- Type validation

## Key Components

### Expression Evaluation
- `expression.ts` - Main expression evaluator
- `expression-evaluator-proxy.ts` - Proxy for expression evaluation
- `expression-sandboxing.ts` - Sandboxed expression execution
- `expressions/` - Expression utilities

### Data Transformation
- `workflow-data-proxy.ts` - Data proxy for workflows
- `workflow-data-proxy-helpers.ts` - Helper functions
- `type-validation.ts` - Type validation utilities

### Graph Processing
- `graph/` - Graph algorithms and utilities
- `workflow.ts` - Workflow graph representation
- `workflow-diff.ts` - Workflow comparison

### Execution Context
- `execution-context.ts` - Execution context management
- `execution-status.ts` - Execution status tracking
- `run-execution-data/` - Execution data handling

### Extensions
- `extensions/` - Built-in extensions
- `native-methods/` - Native method implementations

## Architecture

```
                    ┌─────────────────────┐
                    │     Workflow        │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
    │ Expression│      │    Graph    │     │    Data     │
    │ Evaluator │      │  Processing │     │ Transform   │
    └───────────┘      └─────────────┘     └─────────────┘
```

## Usage

```typescript
import { Expression, Workflow, WorkflowDataProxy } from '@apps/ai/n8n/workflow';
```
