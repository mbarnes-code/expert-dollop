# Goose-n8n Integration Quick Reference

## Quick Start

### 1. Start Services

```bash
# PostgreSQL and RabbitMQ
docker-compose up -d postgres rabbitmq

# n8n
docker run -p 5678:5678 --name n8n n8nio/n8n

# Goose Desktop
cd apps/ai/goose/desktop && npm run start-gui
```

### 2. Configure

```bash
# Set environment
export N8N_API_KEY="your_n8n_api_key"
export N8N_API_URL="http://localhost:5678/api/v1"

# Configure Goose profile (~/.config/goose/profiles.yaml)
mcp_servers:
  n8n:
    command: "npx"
    args: ["@leonardsellem/n8n-mcp-server"]
    env:
      N8N_API_URL: "${N8N_API_URL}"
      N8N_API_KEY: "${N8N_API_KEY}"
```

### 3. Test Integration

```bash
# In Goose:
"List my n8n workflows"
"Execute the customer-onboarding workflow for john@example.com"
"Check status of last workflow execution"
```

## Integration Methods

### Method 1: MCP Protocol (High-Level)
- **When**: Natural language interaction
- **How**: Goose → MCP → n8n MCP Server → n8n API
- **Latency**: ~50-100ms
- **Use**: User-facing operations

### Method 2: Direct API (Performance)
- **When**: Programmatic integration
- **How**: Goose → N8nWorkflowAdapter → n8n API directly
- **Latency**: ~20-50ms
- **Use**: Recipe automation, batch operations

### Method 3: Event-Driven (Decoupled)
- **When**: Asynchronous workflows
- **How**: Goose → DAPR Pub/Sub → n8n Event Subscriber
- **Latency**: ~10-30ms (async)
- **Use**: Background processes, notifications

### Method 4: Database (Analytics)
- **When**: Cross-system queries
- **How**: Both systems write to integration schema
- **Latency**: < 10ms
- **Use**: Metrics, audit trail, correlation

## Common Operations

### Execute Workflow (Sync)

```typescript
import { N8nWorkflowAdapter } from '@expert-dollop/integration-adapters';

const adapter = new N8nWorkflowAdapter({
  apiUrl: process.env.N8N_API_URL,
  apiKey: process.env.N8N_API_KEY,
});

const result = await adapter.executeWorkflowSync(
  'customer-onboarding',
  { email: 'user@example.com' },
  30000  // timeout
);

console.log(result.success, result.data);
```

### Execute Workflow (Async)

```typescript
const { executionId } = await adapter.executeWorkflowAsync(
  'data-processing',
  { date: '2025-12-03' }
);

// Later, check status
const status = await adapter.getExecutionStatus(executionId);
```

### Publish Integration Event

```typescript
import { DaprClient } from '@dapr/dapr';
import { IntegrationEvent, IntegrationEventType } from '@expert-dollop/workflow-agent-types';

const dapr = new DaprClient();

const event: IntegrationEvent = {
  id: crypto.randomUUID(),
  type: IntegrationEventType.AGENT_TRIGGERED_WORKFLOW,
  timestamp: new Date(),
  source: 'goose',
  payload: { workflowId, conversationId },
  correlationId: conversationId,
};

await dapr.pubsub.publish('integration-pubsub', 'agent-workflow-events', event);
```

### Query Integration Database

```sql
-- Get execution statistics for conversation
SELECT * FROM integration.get_conversation_stats('conv_abc123');

-- Get workflow performance metrics
SELECT * FROM integration.get_workflow_performance('deploy-pipeline', 7);

-- Get recent executions
SELECT * FROM integration.agent_workflow_executions
WHERE status = 'error'
ORDER BY triggered_at DESC
LIMIT 10;
```

## Integration Patterns

### Pattern: Agent Triggers Workflow

```
User → Goose → Workflow Adapter → n8n API → Execute
                    ↓
            Log to Database
                    ↓
            Publish Event
```

```typescript
// In Goose extension
const request: AgentWorkflowRequest = {
  workflowId: 'process-order',
  conversationId: conversation.id,
  messageId: message.id,
  parameters: { orderId: '12345' },
  waitForCompletion: true,
};

const result = await workflowAdapter.executeFromAgent(request);
```

### Pattern: Workflow Calls Agent

```
n8n Node → Agent Adapter → Goose API → Process
              ↓
      Log to Database
              ↓
      Publish Event
```

```typescript
// In n8n Goose Agent node
const request: WorkflowAgentRequest = {
  agentId: 'goose-default',
  action: 'message',
  context: {
    workflowId: this.workflow.id,
    executionId: this.execution.id,
    nodeId: this.node.id,
  },
  payload: {
    message: 'Analyze this data',
    data: inputData,
  },
};

const response = await agentAdapter.execute(request);
```

### Pattern: Recipe Orchestration

```yaml
# Goose recipe
name: "Deploy Pipeline"
steps:
  - tool: "n8n.execute_workflow"
    workflow: "run-tests"
    wait: true
  
  - tool: "n8n.execute_workflow"
    workflow: "build-docker"
    condition: "previous.success"
  
  - tool: "n8n.execute_workflow"
    workflow: "deploy-k8s"
    condition: "previous.success"
```

### Pattern: Event-Driven

```typescript
// Goose publishes recipe completion
await eventPublisher.publish({
  type: IntegrationEventType.AGENT_RECIPE_COMPLETED,
  payload: {
    recipeId: 'deploy-pipeline',
    success: true,
    workflows: ['test', 'build', 'deploy'],
  },
});

// n8n subscribes and triggers follow-up
eventBus.subscribe('agent-events', async (event) => {
  if (event.type === IntegrationEventType.AGENT_RECIPE_COMPLETED) {
    await workflow.execute('post-deployment-checks');
  }
});
```

## Troubleshooting

### MCP Server Not Found

```bash
# Install globally
npm install -g @leonardsellem/n8n-mcp-server

# Or use npx in config
command: "npx"
args: ["@leonardsellem/n8n-mcp-server"]
```

### API Connection Failed

```bash
# Test n8n API
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     $N8N_API_URL/workflows

# Check n8n is running
curl http://localhost:5678/healthz
```

### Database Schema Missing

```bash
# Apply schema
psql -h localhost -U postgres -d expert_dollop \
     -f infrastructure/postgres/schemas/integration.sql
```

### DAPR Not Working

```bash
# Init DAPR
dapr init

# Run with DAPR
dapr run --app-id goose-server --app-port 8000 \
         --components-path ./infrastructure/dapr/components
```

## Performance Tips

1. **Use Direct API** for performance-critical operations
2. **Use Events** for async operations
3. **Batch Queries** in database
4. **Cache** workflow definitions
5. **Index** frequently queried fields

## Security Checklist

- [ ] API keys in environment variables
- [ ] HTTPS for production n8n
- [ ] PostgreSQL SSL enabled
- [ ] DAPR mTLS enabled
- [ ] Webhook authentication
- [ ] Rate limiting configured
- [ ] Audit logging enabled

## Monitoring

```sql
-- Check recent activity
SELECT 
    DATE_TRUNC('hour', triggered_at) as hour,
    COUNT(*) as executions,
    AVG(duration_ms) as avg_duration
FROM integration.agent_workflow_executions
WHERE triggered_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', triggered_at)
ORDER BY hour DESC;

-- Check error rates
SELECT 
    workflow_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'error') as errors,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'error') / COUNT(*), 2) as error_rate
FROM integration.agent_workflow_executions
WHERE triggered_at >= NOW() - INTERVAL '7 days'
GROUP BY workflow_name
ORDER BY error_rate DESC;
```

## File Locations

### Documentation
- `docs/n8n-goose-integration.md` - Main guide
- `docs/system-level-integration-architecture.md` - Architecture
- `docs/integration-implementation-summary.md` - Status
- `docs/additional-integration-points.md` - Overview

### Libraries
- `libs/ai/workflow-agent-types/` - Shared types
- `libs/ai/integration-adapters/` - API adapters

### Infrastructure
- `infrastructure/postgres/schemas/integration.sql` - Database
- `infrastructure/dapr/components/` - DAPR config

### Applications
- `apps/ai/goose/` - Goose integration
- `apps/ai/n8n/` - n8n components
- `features/n8n-mcp-server/` - MCP server

## Resources

- [n8n Docs](https://docs.n8n.io/)
- [Goose Docs](apps/ai/goose/documentation/)
- [DAPR Docs](https://docs.dapr.io/)
- [MCP Spec](https://modelcontextprotocol.io/)

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-03
