# Shared Authentication Module

This module provides a unified authentication abstraction layer supporting multiple enterprise authentication methods.

## Overview

The authentication module follows DDD modular monolith best practices with class abstraction to provide:

- **LDAP** (Enterprise) - Directory-based authentication
- **SAML** (Enterprise) - Security Assertion Markup Language SSO
- **OAuth2/OIDC** (Enterprise) - OpenID Connect SSO

## Architecture

```
backend/auth/
├── core/                          # Core abstractions
│   ├── auth-provider.interface.ts # Provider interfaces
│   ├── abstract-auth-provider.ts  # Base provider class
│   ├── abstract-sso-provider.ts   # SSO provider base
│   ├── abstract-directory-provider.ts # Directory provider base
│   └── auth-service.ts            # Authentication service
└── providers/                     # Provider implementations
    ├── ldap/                      # LDAP provider
    ├── saml/                      # SAML provider
    └── oidc/                      # OIDC provider
```

## Class Hierarchy

```
IAuthProvider (Interface)
    │
    ├── ISsoProvider (Interface)
    │       └── AbstractSsoProvider
    │               ├── SamlProvider
    │               └── OidcProvider
    │
    └── IDirectoryProvider (Interface)
            └── AbstractDirectoryProvider
                    └── LdapProvider
```

## Usage

### Initialize Auth Service

```typescript
import { getAuthService, LdapProvider, SamlProvider, OidcProvider } from '@backend/auth';

const authService = getAuthService();

// Register providers
authService.registerProvider(new LdapProvider(ldapConfig));
authService.registerProvider(new SamlProvider(samlConfig));
authService.registerProvider(new OidcProvider(oidcConfig));

// Initialize all providers
await authService.initializeProviders();
```

### Authenticate User

```typescript
// Authenticate with specific provider
const result = await authService.authenticate(
  { username: 'user', password: 'pass' },
  'ldap'
);

if (result.success) {
  console.log('User authenticated:', result.user);
} else {
  console.error('Authentication failed:', result.error);
}
```

### SSO Flow

```typescript
// Generate SSO login URL
const oidcProvider = authService.getProvider('oidc') as OidcProvider;
const { url, state, nonce } = await oidcProvider.generateLoginUrl();

// Redirect user to url...

// Handle callback
const result = await oidcProvider.handleCallback({
  code: authorizationCode,
  state: storedState,
  storedState,
  storedNonce,
});
```

## Provider Configuration

### LDAP Configuration

```typescript
const ldapConfig = {
  enabled: true,
  loginLabel: 'LDAP Login',
  connectionUrl: 'ldap.example.com',
  connectionPort: 389,
  connectionSecurity: 'tls',
  baseDn: 'dc=example,dc=com',
  bindingAdminDn: 'cn=admin,dc=example,dc=com',
  bindingAdminPassword: 'secret',
  loginIdAttribute: 'uid',
  emailAttribute: 'mail',
  // ...
};
```

### SAML Configuration

```typescript
const samlConfig = {
  enabled: true,
  loginLabel: 'SAML Login',
  metadata: '<EntityDescriptor>...</EntityDescriptor>',
  loginBinding: 'redirect',
  wantAssertionsSigned: true,
  mapping: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    // ...
  },
};
```

### OIDC Configuration

```typescript
const oidcConfig = {
  enabled: true,
  loginLabel: 'Sign in with SSO',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  discoveryEndpoint: 'https://idp.example.com/.well-known/openid-configuration',
  scopes: ['openid', 'email', 'profile'],
  // ...
};
```

## Extending Providers

Create a new provider by extending the appropriate base class:

```typescript
import { AbstractSsoProvider } from '@backend/auth/core';

export class CustomSsoProvider extends AbstractSsoProvider {
  readonly name = 'custom-sso';

  async generateLoginUrl() {
    // Custom implementation
  }

  async handleCallback(params: Record<string, unknown>) {
    // Custom implementation
  }

  getCallbackUrl() {
    return '/api/sso/custom/callback';
  }
}
```

## Database Support

The authentication module is designed to work with multiple database backends:
- PostgreSQL
- MySQL
- MariaDB
- SQLite

User data and authentication identities are stored using the entities defined in `apps/ai/n8n/db/entities/`.
