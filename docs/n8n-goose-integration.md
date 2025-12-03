# Goose and n8n Integration Guide

## Overview

This guide provides detailed instructions for integrating the Goose AI agent with n8n workflow automation platform using the Model Context Protocol (MCP). This integration enables AI-powered workflow management, creation, and execution through natural language.

## Architecture

### Integration Pattern

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │   MCP   │                  │   REST  │                 │
│  Goose Agent    │◄───────►│ n8n MCP Server   │◄───────►│   n8n Server    │
│  (AI Client)    │  stdio  │  (Protocol       │   API   │   (Workflows)   │
│                 │         │   Adapter)       │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            │                            │
       │                            │                            │
       ▼                            ▼                            ▼
 Conversation               MCP Tools/Resources           Workflow Engine
 Management                 - execute_workflow            - Node Execution
 Recipe System              - create_workflow             - Data Transform
 Tool Execution             - list_workflows              - Error Handling
```

### Component Responsibilities

**Goose Agent**:
- Natural language understanding
- Conversation context management
- MCP client implementation
- Tool orchestration
- Recipe execution

**n8n MCP Server**:
- MCP protocol implementation
- Tool exposure (workflow operations)
- Resource exposure (workflow data)
- API authentication
- Request/response translation

**n8n Server**:
- Workflow storage and execution
- Node type registry
- Credential management
- Webhook handling
- Execution history

## Prerequisites

### System Requirements

- **Node.js**: 20.x or later
- **pnpm**: 8.x or later (for n8n)
- **Rust**: 1.75+ (for Goose)
- **Docker** (optional, for n8n)

### Required Services

1. **n8n Server**: Running and accessible
2. **n8n API**: Enabled with API key
3. **Goose**: Installed and configured
4. **n8n MCP Server**: Installed globally or locally

## Installation

### Step 1: Install n8n

#### Option A: Docker (Recommended)

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-changeme}
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-config:/etc/n8n

volumes:
  n8n_data:
    driver: local
EOF

# Start n8n
docker-compose up -d

# Verify n8n is running
curl http://localhost:5678/healthz
```

#### Option B: Local Installation

```bash
# Install n8n globally
npm install -g n8n

# Or using pnpm
pnpm install -g n8n

# Start n8n
n8n start

# Access UI at http://localhost:5678
```

### Step 2: Configure n8n API

1. **Access n8n UI**: http://localhost:5678
2. **Create Account**: Complete initial setup
3. **Generate API Key**:
   - Go to Settings → API
   - Click "Create API Key"
   - Copy the key (save securely)

```bash
# Save API key to environment
export N8N_API_KEY="n8n_api_<your_key>"
echo "export N8N_API_KEY=\"$N8N_API_KEY\"" >> ~/.bashrc
```

### Step 3: Install n8n MCP Server

#### Option A: From npm (Recommended)

```bash
# Install globally
npm install -g @leonardsellem/n8n-mcp-server

# Verify installation
which n8n-mcp-server
```

#### Option B: From Source

```bash
# Clone repository
cd features/n8n-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Link globally (optional)
npm link

# Or use directly
node build/index.js
```

### Step 4: Configure Goose

```bash
# Create Goose config directory if it doesn't exist
mkdir -p ~/.config/goose

# Create or edit profiles.yaml
cat > ~/.config/goose/profiles.yaml << 'EOF'
default:
  provider: openai
  model: gpt-4
  
  mcp_servers:
    n8n:
      command: "npx"
      args: ["@leonardsellem/n8n-mcp-server"]
      env:
        N8N_API_URL: "http://localhost:5678/api/v1"
        N8N_API_KEY: "${N8N_API_KEY}"
      description: "n8n workflow automation platform"
      
    # Optional: n8n webhook server for triggers
    n8n-webhooks:
      command: "npx"
      args: ["@leonardsellem/n8n-mcp-server"]
      env:
        N8N_API_URL: "http://localhost:5678/api/v1"
        N8N_API_KEY: "${N8N_API_KEY}"
        N8N_WEBHOOK_USERNAME: "admin"
        N8N_WEBHOOK_PASSWORD: "${N8N_WEBHOOK_PASSWORD}"
      description: "n8n webhook triggers"
EOF
```

## Configuration

### Environment Variables

Create a `.env` file for centralized configuration:

```bash
# .env file
# n8n Server Configuration
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=n8n_api_your_actual_key_here
N8N_WEBHOOK_USERNAME=admin
N8N_WEBHOOK_PASSWORD=secure_password_here

# Goose Configuration
GOOSE_PROFILE=default
OPENAI_API_KEY=sk-your-openai-key

# Optional: Database (if using PostgreSQL for n8n)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=n8n
```

Load environment:

```bash
# Add to ~/.bashrc or ~/.zshrc
set -a
source ~/path/to/.env
set +a
```

### Goose MCP Server Configuration

The MCP server configuration in Goose profiles supports several options:

```yaml
mcp_servers:
  n8n:
    # Command to execute (can be full path or command in PATH)
    command: "npx"
    
    # Arguments to pass to command
    args: 
      - "@leonardsellem/n8n-mcp-server"
    
    # Environment variables (supports ${VAR} substitution)
    env:
      N8N_API_URL: "${N8N_API_URL}"
      N8N_API_KEY: "${N8N_API_KEY}"
      # Optional: Enable debug logging
      DEBUG: "n8n:*"
      # Optional: Set log level
      LOG_LEVEL: "info"
    
    # Human-readable description
    description: "n8n workflow automation"
    
    # Optional: Auto-start server with Goose
    auto_start: true
    
    # Optional: Restart on failure
    restart_on_failure: true
```

## Usage

### Starting Services

```bash
# Terminal 1: Start n8n
docker-compose up n8n
# Or: n8n start

# Terminal 2: Verify n8n MCP server can connect
N8N_API_URL=http://localhost:5678/api/v1 \
N8N_API_KEY=$N8N_API_KEY \
npx @leonardsellem/n8n-mcp-server

# Terminal 3: Start Goose Desktop
cd apps/ai/goose/desktop
npm run start-gui

# Or: Start Goose CLI
cd backend/services/goose
cargo run -p goose-cli
```

### Basic Commands

Once Goose is running, you can interact with n8n through natural language:

#### List Workflows

```
User: List my n8n workflows

Goose: I'll check your n8n workflows...
[Calls MCP tool: list_workflows]

You have 3 workflows:
1. Customer Onboarding (active)
2. Daily Backup (active)
3. Email Digest (inactive)
```

#### Execute Workflow

```
User: Run the customer onboarding workflow for john@example.com

Goose: I'll execute the customer onboarding workflow with that email...
[Calls MCP tool: execute_workflow]

Workflow executed successfully!
Execution ID: abc123
Status: running
Started: 2025-12-03 10:30:00
```

#### Check Execution Status

```
User: Check the status of execution abc123

Goose: Let me get the execution details...
[Calls MCP tool: get_execution_data]

Execution abc123:
Status: success
Duration: 2.3 seconds
Nodes executed: 4
Output: {
  "user_created": true,
  "welcome_email_sent": true
}
```

#### Create Workflow

```
User: Create a workflow that sends me a Slack message every day at 9am

Goose: I'll create a scheduled workflow for you...
[Calls MCP tool: create_workflow]

Created workflow "Daily Slack Reminder":
ID: workflow_xyz
Nodes:
- Schedule Trigger (9:00 AM daily)
- Slack Node (Post message)

Would you like me to activate it?
```

## Advanced Integration

### Recipe-Based Automation

Create Goose recipes that orchestrate n8n workflows:

```yaml
# ~/.config/goose/recipes/deploy-pipeline.yaml
name: "Deployment Pipeline"
description: "Automated deployment with testing and notifications"

steps:
  # Step 1: Run tests
  - name: "run_tests"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "test-suite"
      waitForCompletion: true
    on_error: "abort"
  
  # Step 2: Deploy if tests pass
  - name: "deploy"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "deploy-to-production"
      data:
        version: "${input.version}"
        environment: "production"
    condition: "steps.run_tests.success"
  
  # Step 3: Send notification
  - name: "notify"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "slack-notification"
      data:
        message: "Deployment ${steps.deploy.status}"
        channel: "#deployments"
```

Use the recipe:

```
User: Run the deployment pipeline for version 2.5.0

Goose: I'll run the deployment pipeline recipe...
[Executes recipe steps sequentially]

Pipeline Results:
✅ Tests passed (23/23)
✅ Deployed to production
✅ Notification sent to #deployments
```

### Workflow Templates

Create reusable workflow templates that Goose can instantiate:

```typescript
// features/n8n-mcp-server/templates/email-digest.json
{
  "name": "Email Digest Template",
  "nodes": [
    {
      "type": "n8n-nodes-base.scheduleTrigger",
      "name": "Schedule",
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "value": 24 }]
        }
      }
    },
    {
      "type": "n8n-nodes-base.emailReadImap",
      "name": "Read Emails",
      "parameters": {
        "mailbox": "INBOX",
        "filters": {
          "since": "{{ $yesterday }}"
        }
      }
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Send Digest",
      "parameters": {
        "toEmail": "{{ $parameter.userEmail }}",
        "subject": "Daily Email Digest"
      }
    }
  ]
}
```

Use template via Goose:

```
User: Create an email digest workflow for sarah@example.com

Goose: I'll create an email digest workflow for Sarah...
[Uses template and customizes parameters]

Created workflow "Sarah's Email Digest"
Schedule: Daily at 8:00 AM
Source: INBOX
Destination: sarah@example.com
```

### Event-Driven Integration

Configure n8n webhooks to trigger Goose actions:

```yaml
# n8n Webhook Workflow
name: "Alert on Critical Error"
nodes:
  - type: webhook
    name: "Error Webhook"
    path: "critical-error"
    method: "POST"
  
  - type: http-request
    name: "Notify Goose"
    url: "http://localhost:8000/api/goose/trigger"
    method: "POST"
    body:
      action: "investigate_error"
      error_data: "{{ $json.error }}"
```

Goose receives webhook and responds:

```
Goose: I detected a critical error notification from n8n.
Analyzing error: Database connection timeout

Recommended actions:
1. Check database server status
2. Review connection pool settings
3. Check for long-running queries

Should I create a support ticket?
```

### Multi-Workflow Orchestration

Goose can orchestrate complex multi-workflow processes:

```
User: Process the monthly report: gather data, generate charts, create PDF, and email to executives

Goose: I'll orchestrate the monthly report workflow...

Step 1: Data Collection
[Executes: data-collection workflow]
✅ Collected 5,234 records

Step 2: Chart Generation
[Executes: chart-generation workflow]
✅ Created 8 visualizations

Step 3: PDF Generation
[Executes: pdf-report workflow]
✅ Generated 12-page report

Step 4: Email Distribution
[Executes: email-executives workflow]
✅ Sent to 5 recipients

Monthly report completed successfully!
Report ID: report_2025_12
```

## Integration Patterns

### Pattern 1: Workflow Discovery

Goose helps users discover and understand workflows:

```
User: What workflows do I have for customer management?

Goose: 
[Calls: list_workflows, filters by tag "customer"]

I found 4 customer management workflows:

1. **Customer Onboarding** (Active)
   - Triggers: Manual, Webhook
   - Actions: Create account, Send welcome email, Add to CRM
   
2. **Customer Support Ticket** (Active)
   - Triggers: Email, API
   - Actions: Create ticket, Assign to team, Send confirmation
   
3. **Customer Feedback Survey** (Inactive)
   - Triggers: Schedule (monthly)
   - Actions: Generate survey, Send email, Collect responses
   
4. **Customer Churn Detection** (Active)
   - Triggers: Schedule (daily)
   - Actions: Analyze usage, Flag at-risk, Notify account manager

Would you like details on any of these?
```

### Pattern 2: Workflow Creation Assistant

Goose assists in creating workflows through conversation:

```
User: I want to automate our invoice processing

Goose: I can help create an invoice processing workflow. Let me ask a few questions:

1. How do invoices arrive? (Email, Upload, API)
User: Email attachments

Goose: 2. What should happen after receiving an invoice?
User: Extract data, validate against purchase orders, and save to accounting system

Goose: 3. Who should be notified?
User: Finance team and the requester

Goose: Creating workflow "Automated Invoice Processing"...
[Calls: create_workflow with generated structure]

Created workflow with these components:
- Email Trigger (monitors invoices@company.com)
- PDF Text Extraction
- Data Validation (checks against PO database)
- QuickBooks Integration (saves invoice)
- Email Notification (to finance team & requester)

Should I activate this workflow?
```

### Pattern 3: Execution Monitoring

Goose monitors workflow executions and provides insights:

```
User: How are my workflows performing today?

Goose: 
[Calls: list_workflows, get_execution_data for each]

Workflow Performance (Today):

✅ Customer Onboarding: 12 runs, 100% success
✅ Daily Backup: 1 run, success
⚠️  Email Digest: 3 runs, 2 success, 1 failed
❌ Data Sync: 5 runs, 0 success (all failed)

Issue detected with "Data Sync":
- Error: Connection timeout to external API
- Last success: 2 days ago
- Recommendation: Check API credentials and endpoint

Should I investigate the "Data Sync" failures?
```

### Pattern 4: Intelligent Debugging

Goose helps debug workflow issues:

```
User: My "Send Daily Report" workflow isn't working

Goose: I'll investigate the "Send Daily Report" workflow...

[Calls: list_workflows, get_execution_data]

Found the issue. Recent executions show:

Last 3 runs:
1. Failed - Email node error: "Invalid recipient"
2. Failed - Email node error: "Invalid recipient"  
3. Success - 3 days ago

The workflow is failing because:
- Email address "old-manager@company.com" is no longer valid
- Error started after the manager change

Would you like me to:
1. Update the recipient email address
2. Deactivate this workflow
3. Create a new workflow with updated settings
```

### Pattern 5: Workflow Evolution

Goose helps evolve workflows based on usage:

```
User: Can you improve my customer onboarding workflow?

Goose: Analyzing "Customer Onboarding" workflow...

[Analyzes execution history, node performance, error rates]

Recommendations:

1. **Add Error Handling**: 
   - 5% of executions fail at "Create CRM Entry"
   - Add retry logic with exponential backoff

2. **Optimize Performance**:
   - "Send Welcome Email" takes 3-5 seconds
   - Switch to bulk email API for faster processing

3. **Add Notification**:
   - No notification on completion
   - Add Slack message to #customer-success

4. **Data Enrichment**:
   - Detected missing: company size, industry
   - Add Clearbit enrichment node

Should I implement these improvements?
```

## Troubleshooting

### Common Issues

#### Issue 1: MCP Server Not Connecting

**Symptoms**: Goose doesn't see n8n tools

**Solutions**:

```bash
# 1. Verify n8n is running
curl http://localhost:5678/healthz

# 2. Test API key
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     http://localhost:5678/api/v1/workflows

# 3. Check MCP server manually
N8N_API_URL=http://localhost:5678/api/v1 \
N8N_API_KEY=$N8N_API_KEY \
npx @leonardsellem/n8n-mcp-server

# 4. Verify Goose config
cat ~/.config/goose/profiles.yaml | grep -A 10 n8n

# 5. Check Goose logs
tail -f ~/.goose/logs/goose.log | grep n8n
```

#### Issue 2: Workflow Execution Fails

**Symptoms**: Workflow starts but doesn't complete

**Solutions**:

```bash
# 1. Check execution in n8n UI
# http://localhost:5678/executions

# 2. Get execution details via API
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     http://localhost:5678/api/v1/executions/{execution_id}

# 3. Check workflow is active
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     http://localhost:5678/api/v1/workflows/{workflow_id}

# 4. Review error logs
docker logs n8n | tail -n 100
```

#### Issue 3: Authentication Errors

**Symptoms**: "Unauthorized" or "Forbidden" errors

**Solutions**:

```bash
# 1. Verify API key is correct
echo $N8N_API_KEY

# 2. Regenerate API key in n8n UI
# Settings → API → Create New Key

# 3. Update environment variable
export N8N_API_KEY="new_key"

# 4. Update Goose config
vi ~/.config/goose/profiles.yaml
# Update N8N_API_KEY value

# 5. Restart Goose
```

#### Issue 4: Slow Workflow Execution

**Symptoms**: Workflows take too long to execute

**Solutions**:

```bash
# 1. Check n8n resource usage
docker stats n8n

# 2. Review workflow complexity
# Open in n8n UI and check node count

# 3. Enable execution logging
# In n8n: Settings → Log → Set to 'debug'

# 4. Optimize workflow
# - Reduce HTTP request timeouts
# - Use batch operations
# - Cache repeated API calls
# - Parallelize independent nodes

# 5. Scale n8n (if using Docker)
docker-compose up --scale n8n=3
```

### Debug Mode

Enable detailed logging:

```yaml
# ~/.config/goose/profiles.yaml
default:
  mcp_servers:
    n8n:
      command: "npx"
      args: ["@leonardsellem/n8n-mcp-server"]
      env:
        N8N_API_URL: "${N8N_API_URL}"
        N8N_API_KEY: "${N8N_API_KEY}"
        DEBUG: "n8n:*,mcp:*"
        LOG_LEVEL: "debug"
```

View logs:

```bash
# Goose logs
tail -f ~/.goose/logs/goose.log

# n8n logs
docker logs -f n8n

# MCP server logs (stderr)
# Shown in Goose console or logs
```

## Best Practices

### 1. Workflow Design

- **Single Responsibility**: Each workflow should do one thing well
- **Error Handling**: Always include error handling nodes
- **Idempotency**: Design workflows to be safely re-runnable
- **Testing**: Test workflows with sample data before activation
- **Documentation**: Use workflow notes to explain logic

### 2. Security

- **API Keys**: Store in environment variables, never in code
- **Credentials**: Use n8n's credential system, don't hardcode
- **Webhooks**: Always use authentication for webhook triggers
- **Permissions**: Use least-privilege access for integrations
- **Audit**: Enable audit logging for compliance

### 3. Performance

- **Batching**: Process items in batches when possible
- **Caching**: Cache API responses to reduce external calls
- **Timeouts**: Set appropriate timeouts for nodes
- **Parallelization**: Use parallel execution for independent tasks
- **Cleanup**: Regularly delete old execution data

### 4. Monitoring

- **Health Checks**: Set up regular workflow health checks
- **Alerts**: Configure alerts for critical workflow failures
- **Metrics**: Track execution time, success rate, error rate
- **Logs**: Maintain logs for troubleshooting
- **Reviews**: Periodically review and optimize workflows

### 5. Integration Patterns

- **Event-Driven**: Use webhooks for real-time triggers
- **Scheduled**: Use schedules for batch processing
- **Manual**: Provide manual trigger option for testing
- **Hybrid**: Combine multiple trigger types as needed
- **Graceful Degradation**: Handle external service failures

## Examples

### Example 1: GitHub CI/CD Pipeline

```yaml
# Goose Recipe: github-cicd.yaml
name: "GitHub CI/CD Pipeline"
description: "Automated build, test, and deploy on PR merge"

trigger:
  tool: "github.webhook"
  event: "pull_request.merged"

steps:
  - name: "run_tests"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "run-test-suite"
      data:
        repo: "{{ trigger.repo }}"
        branch: "{{ trigger.branch }}"
        commit: "{{ trigger.commit }}"
    
  - name: "build_docker"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "build-docker-image"
      data:
        version: "{{ trigger.version }}"
    condition: "steps.run_tests.success"
    
  - name: "deploy_staging"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "deploy-to-k8s"
      data:
        environment: "staging"
        image: "{{ steps.build_docker.output.image }}"
    condition: "steps.build_docker.success"
    
  - name: "notify_team"
    tool: "n8n.execute_workflow"
    arguments:
      workflowId: "slack-notification"
      data:
        channel: "#deployments"
        message: "Deployed {{ trigger.version }} to staging"
```

### Example 2: Customer Support Automation

```
User: Set up automated customer support for new tickets

Goose: I'll create a customer support automation workflow...

[Creates workflow with these components:]

1. **Email Trigger**
   - Monitors: support@company.com
   - Filters: New emails only

2. **Ticket Classification** (AI Node)
   - Categories: Bug, Feature Request, Question, Complaint
   - Priority: Low, Medium, High, Critical

3. **Auto-Response**
   - Sends acknowledgment email
   - Includes ticket number
   - Sets expectations

4. **Assignment Logic**
   - High/Critical → Senior Support (immediate)
   - Bug → Engineering Team
   - Feature Request → Product Team
   - Question → Support Team

5. **Create Ticket** (in ticketing system)
   - Captures all details
   - Assigns to appropriate team
   - Sets SLA deadline

6. **Slack Notification**
   - Posts to #support channel
   - Mentions assigned team
   - Links to ticket

Created workflow "Automated Support Triage"
Estimated time savings: 15 minutes per ticket
Should I activate it?
```

### Example 3: Data Pipeline

```typescript
// n8n Workflow: Daily Data Pipeline
{
  "name": "Daily Data Pipeline",
  "nodes": [
    // 1. Schedule trigger
    {
      "type": "n8n-nodes-base.scheduleTrigger",
      "name": "Daily at 2 AM",
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "value": 24 }] },
        "hour": 2
      }
    },
    
    // 2. Extract from database
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Extract Sales Data",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM sales WHERE date >= CURRENT_DATE - INTERVAL '1 day'"
      }
    },
    
    // 3. Transform data
    {
      "type": "n8n-nodes-base.code",
      "name": "Calculate Metrics",
      "parameters": {
        "jsCode": `
          const sales = $input.all();
          return sales.map(sale => ({
            ...sale,
            revenue: sale.quantity * sale.price,
            profit_margin: (sale.price - sale.cost) / sale.price
          }));
        `
      }
    },
    
    // 4. Load to warehouse
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Load to Warehouse",
      "parameters": {
        "operation": "insert",
        "table": "sales_metrics"
      }
    },
    
    // 5. Generate report
    {
      "type": "n8n-nodes-base.spreadsheetFile",
      "name": "Generate Excel Report",
      "parameters": {
        "operation": "create",
        "fileFormat": "xlsx"
      }
    },
    
    // 6. Send report
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Email Report",
      "parameters": {
        "toEmail": "analytics@company.com",
        "subject": "Daily Sales Report - {{ $now.format('YYYY-MM-DD') }}"
      }
    }
  ]
}
```

Goose usage:

```
User: Check if today's data pipeline ran successfully

Goose: Checking "Daily Data Pipeline" execution...

Last Run: Today at 2:00 AM
Status: ✅ Success
Duration: 4.2 minutes
Records Processed: 1,247 sales transactions

Pipeline Steps:
✅ Extract Sales Data - 1,247 records
✅ Calculate Metrics - Added revenue and profit margin
✅ Load to Warehouse - Inserted 1,247 rows
✅ Generate Excel Report - Created 234KB file
✅ Email Report - Sent to analytics@company.com

Total Revenue: $45,678.90
Average Profit Margin: 32.4%
```

## Next Steps

After completing this integration:

1. **Explore Workflows**: Browse n8n's template library
2. **Create Recipes**: Build Goose recipes for common tasks
3. **Monitor Usage**: Track which workflows are most useful
4. **Optimize**: Improve workflow performance
5. **Share**: Document successful patterns for your team
6. **Expand**: Add more integrations via n8n nodes

## Resources

### Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [n8n MCP Server API](features/n8n-mcp-server/docs/api/)
- [Goose Documentation](apps/ai/goose/documentation/)
- [MCP Specification](https://modelcontextprotocol.io/)

### Community

- [n8n Community](https://community.n8n.io/)
- [Goose Discord](https://discord.gg/goose-oss)
- [Expert-Dollop Discussions](https://github.com/mbarnes-code/expert-dollop/discussions)

### Support

- **n8n Issues**: https://github.com/n8n-io/n8n/issues
- **n8n MCP Server**: https://github.com/leonardsellem/n8n-mcp-server/issues
- **Goose Issues**: https://github.com/block/goose/issues

---

**Last Updated**: 2025-12-03  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
