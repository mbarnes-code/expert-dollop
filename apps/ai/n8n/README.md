# n8n Workflow Automation Platform

This directory contains the n8n workflow automation platform components migrated using the strangler fig pattern.

## Architecture

The n8n platform has been restructured following DDD modular monolith best practices:

```
apps/ai/n8n/
├── db/                  # Database entities
│   └── entities/        # TypeORM entities (PostgreSQL, MySQL, MariaDB, SQLite)
├── core/                # Core functionality
│   └── execution-engine/# Workflow execution engine
└── workflow/            # Workflow processing
    ├── expressions/     # Expression evaluation
    └── graph/          # Graph processing
```

## Components

### Database Entities (`db/entities/`)
Critical database entities supporting multiple database backends:
- User management
- Workflow definitions
- Credential storage
- Execution tracking
- Authentication identities

### Execution Engine (`core/execution-engine/`)
Core execution engine for:
- Data transformation
- Execution utilities
- Graph processing
- Workflow execution

### Workflow Module (`workflow/`)
Expression evaluation and data transformation:
- Expression evaluator
- Type validation
- Data proxy
- Workflow graph

## Database Support

All database components support:
- **PostgreSQL** - Production-grade relational database
- **MySQL** - Popular open-source database
- **MariaDB** - MySQL-compatible database
- **SQLite** - Lightweight embedded database

## Related Components

- **Frontend**: `apps/n8n-frontend/` - User interface
- **API**: `backend/api/n8n/` - REST API endpoints
- **Authentication**: `backend/auth/` - Shared auth providers (LDAP, SAML, OIDC)

## Usage

```typescript
// Import database entities
import { User, Workflow } from '@apps/ai/n8n/db/entities';

// Import execution engine
import { WorkflowExecute } from '@apps/ai/n8n/core/execution-engine';

// Import workflow utilities
import { Expression, Workflow } from '@apps/ai/n8n/workflow';
```

## Migration Notes

This migration follows the strangler fig pattern:
1. Original source: `features/n8n/packages/`
2. Critical paths preserved during migration
3. Authentication abstracted to shared backend module
4. API endpoints migrated to `backend/api/n8n/`
