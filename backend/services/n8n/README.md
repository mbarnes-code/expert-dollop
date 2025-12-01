# n8n Backend Services

This directory contains the n8n backend services migrated from the n8n project.

## Overview

These services provide the backend functionality for the n8n workflow automation platform.

## Components

### Authentication (`auth/`)
Core authentication service handling:
- JWT token management
- Cookie-based sessions
- MFA enforcement
- Password reset flows

### LDAP (`ldap.ee/`)
Enterprise LDAP integration:
- LDAP server connection
- User synchronization
- Directory authentication
- Attribute mapping

### SSO (`sso.ee/`)
Enterprise SSO providers:

#### OIDC (`sso.ee/oidc/`)
- OpenID Connect discovery
- Authorization code flow
- Token verification
- User provisioning

#### SAML (`sso.ee/saml/`)
- SAML 2.0 support
- SP-initiated SSO
- Assertion parsing
- Attribute mapping

## Relationship with Shared Auth Module

These n8n-specific services integrate with the shared authentication abstraction in `backend/auth/`:

```
backend/auth/              (Shared abstraction layer)
    ↑ implements
backend/services/n8n/      (n8n-specific implementations)
```

The shared auth module provides abstract base classes that these services can extend for integration with the broader platform.

## Usage

These services are typically used through the n8n CLI application and are integrated with the Express server for handling authentication routes.
