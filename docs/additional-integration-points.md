# Goose-n8n Integration: Additional Integration Points

This document outlines additional integration points discovered and implemented beyond MCP protocol integration.

## Integration Layers Implemented

### 1. MCP Protocol Integration (Documented)
- ✅ n8n MCP Server exists in `features/n8n-mcp-server`
- ✅ Goose has MCP client capabilities
- ✅ Documentation created for MCP-based integration

### 2. Shared TypeScript Libraries (NEW)

#### 2.1 Workflow-Agent Types Library
**Location**: `libs/ai/workflow-agent-types/`

**Purpose**: Shared type definitions for deep integration

**Features**:
- WorkflowExecutionContext - Links agent conversations to workflow executions
- AgentWorkflowRequest - Type-safe agent-to-workflow communication
- WorkflowAgentRequest - Type-safe workflow-to-agent communication
- IntegrationEvent - Event types for pub/sub integration
- ExecutionResult - Unified result format
- RecipeWorkflowStep - Recipe-to-workflow mapping
- All types include Zod schemas for runtime validation

**Usage**:
```typescript
import {
  AgentWorkflowRequest,
  ExecutionResult,
  IntegrationEventType,
} from '@expert-dollop/workflow-agent-types';
```

#### 2.2 Integration Adapters Library
**Location**: `libs/ai/integration-adapters/`

**Purpose**: Direct API integration adapters

**Planned Components**:
- N8nWorkflowAdapter - Goose → n8n direct API calls
- GooseAgentAdapter - n8n → Goose direct API calls
- EventPublisher/Subscriber - DAPR pub/sub integration
- AgentWorkflowExecutionRepository - Database integration layer

### 3. System-Level Integration Points

#### 3.1 DAPR Event Bus Integration
**Component**: `infrastructure/dapr/components/pubsub-integration.yaml`

**Events**:
- Agent events (conversation.started, message.sent, tool.executed, recipe.completed)
- Workflow events (execution.started, execution.completed, execution.failed)
- Integration events (agent_triggered_workflow, workflow_triggered_agent)

**Benefits**:
- Decoupled communication
- Event-driven workflows
- Scalable pub/sub pattern
- Cross-system correlation

#### 3.2 Shared Database Schema
**Schema**: `infrastructure/postgres/schemas/integration.sql`

**Tables**:
- `integration.agent_workflow_executions` - Track agent-triggered workflows
- `integration.workflow_agent_actions` - Track workflow-triggered agent actions
- `integration.recipe_workflow_steps` - Map recipe steps to workflows

**Benefits**:
- Cross-system analytics
- Execution correlation
- Performance metrics
- Audit trail

#### 3.3 Code-Level Integration

**n8n Custom Node for Goose**:
- Location: `apps/ai/n8n/nodes/GooseAgent/`
- Operations: sendMessage, executeTool, executeRecipe, getHistory
- Credentials: Goose API authentication
- Benefits: Native n8n integration, drag-and-drop Goose actions

**Goose Extension for n8n (Rust)**:
- Location: `backend/services/goose/extensions/n8n-workflow/`
- Tools: n8n_execute_workflow, n8n_get_workflow_status
- Direct HTTP client integration
- Benefits: No MCP overhead, faster execution

#### 3.4 Unified API Gateway
**Location**: `backend/services/integration-gateway/`

**Features**:
- Proxy to both Goose and n8n APIs
- Unified authentication
- Request/response transformation
- Integration endpoints for complex operations

**Endpoints**:
- `/api/agent/*` → Goose API
- `/api/workflows/*` → n8n API
- `/api/integration/execute-with-agent` - Orchestrated operations

### 4. Integration Patterns

#### Pattern 1: Agent-Triggered Workflow
```
User Message → Goose Agent → Workflow Adapter → n8n API → Workflow Execution
                     ↓                                            ↓
              Event: AGENT_TRIGGERED_WORKFLOW          Event: WORKFLOW_EXECUTION_COMPLETED
                     ↓                                            ↓
                Database: Log execution mapping
```

#### Pattern 2: Workflow-Triggered Agent
```
Workflow Node → Goose Agent Adapter → Goose API → Agent Response
        ↓                                              ↓
Event: WORKFLOW_TRIGGERED_AGENT          Event: AGENT_MESSAGE_SENT
        ↓                                              ↓
   Database: Log action mapping
```

#### Pattern 3: Recipe-Workflow Orchestration
```
Goose Recipe:
  Step 1: Execute n8n "build" workflow
  Step 2: Execute n8n "test" workflow
  Step 3: Execute n8n "deploy" workflow

Each step:
- Calls workflow via adapter
- Waits for completion
- Logs to database
- Publishes events
- Passes data to next step
```

#### Pattern 4: Event-Driven Automation
```
n8n Workflow Completes → DAPR Pub/Sub → Goose Event Subscriber → Recipe Triggered
Goose Recipe Completes → DAPR Pub/Sub → n8n Event Subscriber → Workflow Triggered
```

## Benefits of Multi-Layer Integration

### 1. Flexibility
- MCP for tool-based integration
- Direct API for performance-critical operations
- Events for decoupled automation
- Database for analytics and correlation

### 2. Performance
- Direct API calls bypass MCP overhead
- Event-driven reduces polling
- Database enables batch queries
- Caching at multiple levels

### 3. Reliability
- Multiple fallback mechanisms
- Event replay for failed operations
- Database provides audit trail
- Graceful degradation

### 4. Observability
- Centralized event logging
- Cross-system execution tracking
- Performance metrics
- Error correlation

### 5. Scalability
- Event-driven architecture scales horizontally
- Database sharding possible
- Independent service scaling
- Load balancing at gateway

## Implementation Status

### ✅ Completed
- [x] Integration architecture documentation
- [x] Workflow-agent types library
- [x] System-level integration design
- [x] MCP integration documentation
- [x] n8n integration manifest
- [x] Goose-n8n integration guide

### 🚧 In Progress
- [ ] Integration adapters library (partial)
- [ ] Database schemas
- [ ] DAPR components
- [ ] Custom n8n nodes
- [ ] Goose Rust extensions

### 📋 Planned
- [ ] Event publishers/subscribers
- [ ] API gateway implementation
- [ ] Integration testing suite
- [ ] Monitoring and metrics
- [ ] Example workflows and recipes
- [ ] Production deployment guide

## Next Steps

1. **Complete Libraries**:
   - Finish integration-adapters library
   - Create event publisher/subscriber
   - Implement repository layer

2. **Database Setup**:
   - Create PostgreSQL schemas
   - Add migration scripts
   - Implement repository classes

3. **DAPR Integration**:
   - Create DAPR components
   - Implement event publishers
   - Create event subscribers

4. **Code Integration**:
   - Build n8n custom Goose node
   - Create Goose n8n extension
   - Implement API gateway

5. **Testing**:
   - Unit tests for adapters
   - Integration tests for event flow
   - End-to-end workflow tests
   - Performance benchmarks

6. **Documentation**:
   - Usage examples for each pattern
   - Deployment guides
   - Troubleshooting guides
   - Best practices

## Resources

- **Main Integration Guide**: `docs/n8n-goose-integration.md`
- **System Architecture**: `docs/system-level-integration-architecture.md`
- **n8n Manifest**: `docs/n8n-integration-manifest.md`
- **Goose Integration**: `docs/goose-integration.md`
- **Workflow-Agent Types**: `libs/ai/workflow-agent-types/`
- **Integration Adapters**: `libs/ai/integration-adapters/`

## Related Systems

These integration patterns can be extended to other systems:

- **Goose ↔ Other AI Tools**: Similar adapter pattern
- **n8n ↔ Other Automation**: Workflow orchestration
- **DAPR ↔ Microservices**: Event-driven architecture
- **Database ↔ Analytics**: Cross-system insights

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Status**: In Progress
