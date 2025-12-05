# n8n Workflow Automation Integration Manifest

## Integration Summary

This manifest documents the integration of the n8n workflow automation platform into the Expert-Dollop platform using the Strangler Fig Pattern.

**Integration Date**: 2025-12-03  
**Integration Method**: Strangler Fig Pattern  
**Status**: Phase 3 Complete ✅  
**Last Updated**: 2025-12-03

## Project Overview

**n8n** is a fair-code licensed workflow automation tool that allows you to connect anything to everything via a visual interface.

- **Repository**: https://github.com/n8n-io/n8n
- **License**: Sustainable Use License
- **Version**: Latest
- **Primary Languages**: TypeScript, Node.js

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL, MySQL, MariaDB, SQLite
- **ORM**: TypeORM
- **API**: REST + Webhooks
- **Queue**: Bull (Redis-based)

### Frontend
- **Framework**: Vue.js 3
- **Build**: Vite
- **UI**: Custom component library
- **State**: Pinia

## Integration Structure

### Directory Layout

```
expert-dollop/
│
├── features/n8n/                        # Original project
│   └── packages/                        # n8n packages
│       ├── core/                        # Core execution engine
│       ├── workflow/                    # Workflow structures
│       ├── cli/                         # CLI and server
│       └── ...
│
├── features/n8n-mcp-server/             # n8n MCP Server
│   ├── src/                             # MCP server implementation
│   │   ├── tools/                       # Workflow and execution tools
│   │   ├── resources/                   # Workflow resources
│   │   └── index.ts                     # Server entry point
│   └── package.json
│
├── apps/ai/n8n/                         # New AI location
│   ├── db/                              # Database entities
│   │   └── entities/                    # TypeORM entities
│   ├── core/                            # Core functionality
│   │   └── execution-engine/            # Workflow execution
│   ├── workflow/                        # Workflow processing
│   │   ├── expressions/                 # Expression evaluation
│   │   └── graph/                       # Graph processing
│   ├── index.ts                         # Module exports
│   └── README.md                        # Integration guide
│
├── backend/api/n8n/                     # API endpoints
│   └── (API route handlers)
│
├── backend/services/n8n/                # Backend services
│   └── auth/                            # Authentication services
│
└── docs/                                # Integration docs
    ├── n8n-integration-manifest.md      # This document
    └── n8n-goose-integration.md         # Goose integration guide
```

## Critical Components

### 1. Database Entities (`apps/ai/n8n/db/entities/`)

TypeORM entities supporting multiple database backends:

**Key Entities**:
- `User` - User accounts and authentication
- `Workflow` - Workflow definitions and metadata
- `WorkflowEntity` - Workflow storage and versioning
- `Execution` - Workflow execution records
- `Credentials` - Encrypted credential storage
- `AuthIdentity` - OAuth and SSO identities
- `SharedWorkflow` - Workflow sharing and permissions
- `Tag` - Workflow organization

**Database Support**:
- PostgreSQL (Production recommended)
- MySQL/MariaDB
- SQLite (Development/Testing)

**Status**: ✅ Complete

### 2. Execution Engine (`apps/ai/n8n/core/execution-engine/`)

Core workflow execution capabilities:

**Key Components**:
- `WorkflowExecute` - Main execution orchestrator
- `TaskRunner` - Task execution and coordination
- `ExecutionContext` - Execution state management
- `NodeExecutor` - Individual node execution
- `DataTransformation` - Data mapping and transformation

**Features**:
- Parallel execution support
- Error handling and retry logic
- Webhook triggers
- Scheduled executions
- Manual executions

**Status**: ✅ Complete

### 3. Workflow Module (`apps/ai/n8n/workflow/`)

Workflow structure and expression evaluation:

**Key Components**:
- `Workflow` class - Workflow definition and validation
- `Expression` - Expression parser and evaluator
- `WorkflowGraph` - Workflow graph analysis
- `NodeTypes` - Node type registry

**Features**:
- Expression language (JavaScript-based)
- Dynamic data resolution
- Workflow validation
- Graph traversal and analysis

**Status**: ✅ Complete

### 4. n8n MCP Server (`features/n8n-mcp-server/`)

Model Context Protocol server for n8n integration:

**Key Components**:
- **Tools**:
  - `execute_workflow` - Execute n8n workflows
  - `create_workflow` - Create new workflows
  - `update_workflow` - Modify existing workflows
  - `delete_workflow` - Remove workflows
  - `get_execution_data` - Retrieve execution results
  - `list_workflows` - Browse available workflows
  - `activate_workflow` - Enable/disable workflows

- **Resources**:
  - `workflow://` - Workflow definitions
  - `execution://` - Execution data
  - `credentials://` - Credential schemas

**Protocol**: Model Context Protocol (MCP)
**Transport**: stdio
**Status**: ✅ Complete

## Integration Points

### 1. Goose AI Agent Integration

The n8n MCP Server enables Goose AI agent to interact with n8n workflows:

**Goose → n8n (via MCP)**:
```typescript
// Goose can call n8n MCP server tools
{
  "tool": "execute_workflow",
  "arguments": {
    "workflowId": "workflow-123",
    "data": {
      "input": "process this data"
    }
  }
}
```

**Configuration** (in Goose profile):
```yaml
# .config/goose/profiles.yaml
mcp_servers:
  n8n:
    command: "npx"
    args: ["@leonardsellem/n8n-mcp-server"]
    env:
      N8N_API_URL: "http://localhost:5678/api/v1"
      N8N_API_KEY: "${N8N_API_KEY}"
```

**Use Cases**:
- Goose triggers n8n workflows based on conversation context
- Goose creates workflows from natural language descriptions
- Goose monitors workflow executions and reports results
- Goose manages workflow lifecycle (activate/deactivate)

### 2. Recipe-Based Automation

Goose recipes can orchestrate n8n workflows:

```yaml
# recipe: automate-deployment
name: "Automated Deployment Pipeline"
steps:
  - tool: "n8n.execute_workflow"
    workflow: "build-and-test"
    wait_for_completion: true
  
  - tool: "n8n.execute_workflow"
    workflow: "deploy-to-staging"
    condition: "previous_step.success"
  
  - tool: "n8n.get_execution_data"
    execution_id: "${deploy_execution_id}"
```

### 3. Event-Driven Integration

**n8n → Goose**:
- n8n webhooks can trigger Goose agents
- Workflow completions notify Goose
- Error conditions invoke Goose for resolution

**Goose → n8n**:
- Goose recipes trigger n8n workflows
- Agent decisions activate/deactivate workflows
- Conversation context enriches workflow data

### 4. DAPR Integration (Future)

Both Goose and n8n can integrate via DAPR:

```yaml
# DAPR pub/sub for workflow events
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: workflow-events
spec:
  type: pubsub.rabbitmq
  metadata:
    - name: host
      value: "amqp://rabbitmq:5672"
    - name: topics
      value: "workflow.started,workflow.completed,workflow.failed"
```

## DDD Architecture Alignment

### Bounded Context: Workflow Automation

n8n operates as a distinct bounded context within the automation domain.

**Aggregate Roots**:
- `Workflow` - Workflow definition and configuration
- `Execution` - Workflow execution instance
- `Credentials` - Secure credential storage

**Domain Services**:
- `WorkflowExecutor` - Executes workflows
- `NodeRegistry` - Manages available nodes
- `CredentialService` - Manages credentials
- `WebhookService` - Handles webhook triggers

**Repositories**:
- `WorkflowRepository` - Workflow persistence
- `ExecutionRepository` - Execution history
- `CredentialRepository` - Credential storage

**Integration Events**:
- `WorkflowExecutionStarted`
- `WorkflowExecutionCompleted`
- `WorkflowExecutionFailed`
- `WorkflowActivated`
- `WorkflowDeactivated`

## Security Considerations

### API Authentication
- API key-based authentication
- JWT tokens for session management
- Webhook authentication (username/password or header-based)

### Credential Storage
- Encrypted at rest (AES-256-CBC)
- Separate encryption key per credential
- Never exposed in execution data
- Credential type validation

### Workflow Permissions
- User-based access control
- Shared workflow permissions
- Team-based collaboration
- Audit logging

## Integration Benefits

### For Goose Users

1. **Workflow Automation**: Trigger complex workflows from natural language
2. **No-Code Integration**: Connect to 400+ services without code
3. **Error Recovery**: Automated retry and error handling
4. **Scheduled Tasks**: Time-based workflow execution
5. **Webhook Support**: Event-driven automation

### For n8n Users

1. **AI-Powered Creation**: Generate workflows from descriptions
2. **Intelligent Monitoring**: AI-driven execution analysis
3. **Natural Language Control**: Manage workflows via conversation
4. **Smart Debugging**: AI assistance for workflow issues
5. **Context-Aware Execution**: Pass conversation context to workflows

## Usage Examples

### Example 1: Execute Workflow from Goose

**User**: "Run the customer onboarding workflow for new user john@example.com"

**Goose Action**:
```typescript
// Goose calls n8n MCP tool
await mcp.callTool('execute_workflow', {
  workflowId: 'customer-onboarding',
  data: {
    email: 'john@example.com',
    source: 'goose-agent'
  }
});
```

### Example 2: Create Workflow via Goose

**User**: "Create a workflow that sends a Slack message when a GitHub PR is merged"

**Goose Action**:
```typescript
// Goose generates workflow definition
await mcp.callTool('create_workflow', {
  name: 'GitHub PR to Slack',
  nodes: [
    {
      type: 'n8n-nodes-base.githubTrigger',
      parameters: { events: ['pull_request.merged'] }
    },
    {
      type: 'n8n-nodes-base.slack',
      parameters: { 
        operation: 'postMessage',
        channel: '#engineering'
      }
    }
  ]
});
```

### Example 3: Monitor Workflow Execution

**User**: "Check the status of the last deployment workflow"

**Goose Action**:
```typescript
// Goose queries workflow executions
const workflows = await mcp.callTool('list_workflows', {
  filter: { name: 'deployment' }
});

const executions = await mcp.callTool('get_execution_data', {
  workflowId: workflows[0].id,
  limit: 1
});
```

## Quick Start

### Running n8n

```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin \
  n8nio/n8n

# Or locally
cd features/n8n
pnpm install
pnpm start
```

### Running n8n MCP Server

```bash
# Install globally
npm install -g @leonardsellem/n8n-mcp-server

# Or from source
cd features/n8n-mcp-server
npm install
npm run build

# Run with environment variables
N8N_API_URL=http://localhost:5678/api/v1 \
N8N_API_KEY=your_api_key \
n8n-mcp-server
```

### Connecting Goose to n8n

```bash
# Edit Goose profile
vi ~/.config/goose/profiles.yaml

# Add n8n MCP server configuration
mcp_servers:
  n8n:
    command: "npx"
    args: ["@leonardsellem/n8n-mcp-server"]
    env:
      N8N_API_URL: "http://localhost:5678/api/v1"
      N8N_API_KEY: "${N8N_API_KEY}"

# Start Goose
cd apps/ai/goose/desktop
npm start
```

## Testing Integration

### Test MCP Server

```bash
cd features/n8n-mcp-server
npm test
```

### Test Workflow Execution

```bash
# Create test workflow in n8n UI
# Then test via MCP server

cd features/n8n-mcp-server
node tests/integration/execute-workflow.test.js
```

### Test Goose Integration

```bash
# Start n8n and n8n-mcp-server
# Start Goose
# In Goose chat: "List available n8n workflows"
```

## Migration Phases

### Phase 1: Component Migration ✅ (Complete)

**Goal**: Migrate n8n components to apps/ai/n8n/

**Actions**:
- [x] Migrate database entities
- [x] Migrate execution engine
- [x] Migrate workflow module
- [x] Create module exports
- [x] Document integration

### Phase 2: MCP Server Setup ✅ (Complete)

**Goal**: Set up n8n MCP server in features/

**Actions**:
- [x] Install n8n-mcp-server
- [x] Configure environment
- [x] Test MCP tools and resources
- [x] Document MCP API

### Phase 3: Goose Integration ✅ (Complete)

**Goal**: Connect Goose to n8n via MCP

**Actions**:
- [x] Configure Goose MCP client
- [x] Add n8n server to Goose profile
- [x] Create integration examples
- [x] Document usage patterns
- [x] Test end-to-end flows

### Phase 4: Advanced Features (Future)

**Goal**: Enhanced integration capabilities

**Actions**:
- [ ] DAPR pub/sub for workflow events
- [ ] Shared state stores
- [ ] Workflow templates library
- [ ] AI-powered workflow generation
- [ ] Execution monitoring dashboard

## Documentation Index

### Quick Access

- **This Document**: `docs/n8n-integration-manifest.md`
- **Goose Integration**: `docs/n8n-goose-integration.md`
- **n8n App**: `apps/ai/n8n/README.md`
- **MCP Server**: `features/n8n-mcp-server/README.md`

### API Documentation

- **MCP API**: `features/n8n-mcp-server/docs/api/`
- **n8n API**: https://docs.n8n.io/api/
- **Workflow Schema**: `apps/ai/n8n/workflow/`

## Troubleshooting

### n8n not starting?

```bash
# Check Docker
docker ps | grep n8n

# Check logs
docker logs n8n

# Restart
docker restart n8n
```

### MCP Server connection issues?

```bash
# Verify environment variables
echo $N8N_API_URL
echo $N8N_API_KEY

# Test n8n API directly
curl -H "X-N8N-API-KEY: $N8N_API_KEY" $N8N_API_URL/workflows
```

### Goose not seeing n8n tools?

```bash
# Verify MCP server config in profile
cat ~/.config/goose/profiles.yaml

# Check Goose logs
tail -f ~/.goose/logs/goose.log

# Restart Goose
```

## Contributing

When contributing to the n8n integration:

1. **Understand the pattern** - Read this guide first
2. **Test locally** - Ensure n8n and MCP server work
3. **Document changes** - Update relevant docs
4. **Follow DDD** - Respect bounded contexts
5. **Test integration** - Verify Goose connectivity

## References

### Documentation

- **n8n Docs**: https://docs.n8n.io/
- **MCP Spec**: https://modelcontextprotocol.io/
- **Goose Docs**: `docs/goose-integration.md`

### Original Projects

- **n8n**: https://github.com/n8n-io/n8n
- **n8n MCP Server**: https://github.com/leonardsellem/n8n-mcp-server
- **Goose**: https://github.com/block/goose

## License

- **n8n**: Sustainable Use License
- **n8n MCP Server**: MIT License
- **Goose Integration**: Apache-2.0

---

## Conclusion

The n8n workflow automation platform has been successfully integrated into the Expert-Dollop platform. The integration enables powerful workflow automation capabilities accessible through both the n8n UI and the Goose AI agent via the Model Context Protocol.

**Status**: Ready for use ✅

**Next Steps**:
1. Create example workflows
2. Build integration recipes
3. Develop monitoring dashboard
4. Plan DAPR integration

---

**Integration Lead**: GitHub Copilot  
**Date Completed**: 2025-12-03  
**Version**: 1.0.0  
**Pattern**: Strangler Fig  
**Status**: ✅ Phase 3 Complete
