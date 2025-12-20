# n8n Database Entities

This directory contains the database entity definitions migrated from the n8n project.

## Overview

These entities define the data model for the n8n workflow automation platform, supporting multiple database backends:

- PostgreSQL
- MySQL
- MariaDB
- SQLite

## Critical Components

The entities in this directory are critical for the n8n platform and include:

### Core Entities
- `user.ts` - User account management
- `workflow-entity.ts` - Workflow definitions
- `credentials-entity.ts` - Credential storage
- `execution-entity.ts` - Workflow execution records

### Authentication
- `auth-identity.ts` - Authentication identities (LDAP, SAML, OIDC)
- `api-key.ts` - API key management
- `invalid-auth-token.ts` - Token invalidation tracking

### Workflow Components
- `tag-entity.ts` - Workflow tagging
- `webhook-entity.ts` - Webhook configurations
- `execution-data.ts` - Execution data storage

### Enterprise Features (*.ee.ts)
- `annotation-tag-entity.ee.ts` - Execution annotations
- `test-run.ee.ts` - Test execution tracking

## Database Support

All entities are designed to work with TypeORM and support:
- Automatic schema migrations
- Cross-database compatibility
- Relationship management

## Usage

```typescript
import { User, Workflow, Credentials } from '@apps/ai/n8n/db/entities';
```
