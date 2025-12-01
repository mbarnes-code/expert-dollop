# n8n API v1

This directory contains the n8n public API v1 endpoints migrated from the n8n project.

## Overview

The API provides RESTful endpoints for:
- Workflow management
- Execution control
- Credential management
- Project management
- Variable management
- Source control integration

## Endpoints

### Workflows
- `GET /workflows` - List workflows
- `POST /workflows` - Create workflow
- `GET /workflows/:id` - Get workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow

### Executions
- `GET /executions` - List executions
- `GET /executions/:id` - Get execution
- `DELETE /executions/:id` - Delete execution

### Credentials
- `GET /credentials` - List credentials
- `POST /credentials` - Create credential
- `GET /credentials/:id` - Get credential
- `DELETE /credentials/:id` - Delete credential

### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Variables
- `GET /variables` - List variables
- `POST /variables` - Create variable
- `GET /variables/:key` - Get variable
- `PUT /variables/:key` - Update variable
- `DELETE /variables/:key` - Delete variable

### Source Control
- `GET /source-control/preferences` - Get source control preferences
- `PUT /source-control/preferences` - Update preferences

## Authentication

All endpoints require authentication via:
- API Key (X-N8N-API-KEY header)
- JWT Token (Cookie-based)

Enterprise authentication methods:
- LDAP
- SAML
- OAuth2/OIDC

## OpenAPI Specification

See `openapi.yml` for the complete API specification.

## Directory Structure

```
handlers/
├── workflows/       # Workflow endpoints
├── projects/        # Project endpoints
├── variables/       # Variable endpoints
└── source-control/  # Source control endpoints
shared/              # Shared utilities
```

## Usage

```typescript
// Example API call
const response = await fetch('/api/v1/workflows', {
  headers: {
    'X-N8N-API-KEY': 'your-api-key'
  }
});
```
