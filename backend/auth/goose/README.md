# Goose Authentication Components

This directory contains authentication and authorization components extracted from the Goose project for integration into the Expert-Dollop platform's unified authentication system.

## Overview

Goose uses multiple authentication mechanisms:

1. **API Key Authentication** (server-level)
2. **OAuth 2.0 Flows** (provider-level)
3. **Cloud Provider Authentication** (Azure, GCP)

## Components

### Server Authentication (`server_auth.rs`)

**Source**: `features/goose/crates/goose-server/src/auth.rs`

Simple secret-based API key authentication for the Goose HTTP API.

**Features:**
- API key validation
- HTTP middleware for auth
- Request authentication
- Protection for web UI communication

**Usage:**
```rust
// Validate API key in request headers
let is_valid = validate_api_key(&request_headers);
```

### OAuth 2.0 Core (`oauth/`)

**Source**: `features/goose/crates/goose/src/oauth/`

Generic OAuth 2.0 implementation for various providers.

**Features:**
- Authorization code flow
- Token refresh
- Token persistence (via keyring)
- Callback server for redirect handling

**Files:**
- `mod.rs` - Core OAuth logic
- `persist.rs` - Token storage
- `oauth_callback.html` - Redirect page template

**Usage:**
```rust
// Initiate OAuth flow
let auth_url = start_oauth_flow(provider_config)?;
// Handle callback
let tokens = handle_oauth_callback(code, state)?;
```

### Provider OAuth (`provider_oauth.rs`)

**Source**: `features/goose/crates/goose/src/providers/oauth.rs`

Provider-specific OAuth implementations and configurations.

**Supported Providers:**
- Databricks
- Tetrate
- Generic OAuth providers

**Features:**
- Provider-specific endpoint configuration
- Scope management
- Token exchange
- Refresh token handling

### Azure Authentication (`azureauth.rs`)

**Source**: `features/goose/crates/goose/src/providers/azureauth.rs`

Microsoft Azure AD / Entra ID authentication.

**Features:**
- Azure AD OAuth 2.0
- Managed Identity support
- Azure OpenAI authentication
- Token caching and refresh

**Integration:**
```rust
// Authenticate with Azure
let azure_client = AzureAuthProvider::new(config).await?;
let token = azure_client.get_token().await?;
```

### GCP Authentication (`gcpauth.rs`)

**Source**: `features/goose/crates/goose/src/providers/gcpauth.rs`

Google Cloud Platform service account authentication.

**Features:**
- Service account JWT signing
- Application Default Credentials (ADC)
- GCP Vertex AI authentication
- Token generation and caching

**Integration:**
```rust
// Authenticate with GCP
let gcp_client = GcpAuthProvider::new(credentials)?;
let token = gcp_client.get_access_token().await?;
```

## Architecture

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ API Request + API Key
       ▼
┌─────────────────┐
│  Server Auth    │◄── server_auth.rs
│  (Middleware)   │
└──────┬──────────┘
       │ Validated
       ▼
┌─────────────────┐
│  Goose Server   │
│   (Handler)     │
└──────┬──────────┘
       │ LLM Request
       ▼
┌─────────────────┐
│ Provider Auth   │◄── provider_oauth.rs
│  (OAuth/Cloud)  │◄── azureauth.rs
│                 │◄── gcpauth.rs
└──────┬──────────┘
       │ Authenticated Request
       ▼
┌─────────────────┐
│  LLM Provider   │
│ (OpenAI, etc.)  │
└─────────────────┘
```

### Integration with Expert-Dollop Auth

The Goose auth components can integrate with the platform's authentication system:

#### Option 1: Standalone (Current)
- Goose maintains its own API key auth
- Provider auth handled independently
- Minimal integration

#### Option 2: Unified Auth (Future)
- Use Expert-Dollop's auth service (`backend/auth/`)
- JWT tokens instead of API keys
- Centralized user management
- DAPR secret stores for credentials

## Security Features

### API Key Security
- Secret-based authentication
- Secure key storage (keyring)
- Key rotation support
- Environment variable configuration

### OAuth Security
- State parameter for CSRF protection
- PKCE support (where applicable)
- Secure token storage
- Automatic token refresh

### Cloud Provider Security
- Credential encryption
- Token expiration handling
- Scope minimization
- Audit logging

## Configuration

### API Key Setup

```bash
# Set API key
export GOOSE_API_KEY="your-secret-key"

# Or in config file
api_key = "your-secret-key"
```

### OAuth Configuration

```yaml
# config.yaml
oauth:
  databricks:
    client_id: "your-client-id"
    client_secret: "your-client-secret"
    redirect_uri: "http://localhost:8080/callback"
```

### Azure Configuration

```bash
# Azure AD
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

### GCP Configuration

```bash
# Service account key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Or ADC
gcloud auth application-default login
```

## Dependencies

### Rust Crates
- `oauth2` (5.0.0) - OAuth 2.0 client
- `keyring` (3.6.2) - Secure credential storage
- `jsonwebtoken` (9.3.1) - JWT handling (GCP)
- `aws-config` - AWS authentication
- `base64` (0.21) - Encoding
- `serde` (1.0) - Serialization

## DDD Alignment

### Authentication Domain
- **Aggregate**: `AuthSession`
- **Entities**: `ApiKey`, `OAuthToken`, `CloudCredential`
- **Value Objects**: `TokenScope`, `AuthProvider`
- **Services**: `AuthService`, `TokenRefreshService`

### Repositories
- `ApiKeyRepository` - API key management
- `TokenRepository` - OAuth token storage
- `CredentialRepository` - Cloud credentials

## Best Practices

1. **Never commit secrets** - Use environment variables or secret stores
2. **Rotate keys regularly** - Implement key rotation policies
3. **Use least privilege** - Minimize OAuth scopes
4. **Monitor auth events** - Log authentication attempts
5. **Encrypt at rest** - Use keyring for token storage
6. **Validate tokens** - Check expiration and signatures

## Future Enhancements

### Integration Tasks
- [ ] Migrate to JWT-based authentication
- [ ] Integrate with DAPR secret stores
- [ ] Centralize user management
- [ ] Add multi-tenancy support
- [ ] Implement SSO integration
- [ ] Add audit logging

### Security Improvements
- [ ] Implement MFA
- [ ] Add rate limiting
- [ ] Enhance token encryption
- [ ] Add certificate-based auth
- [ ] Implement secret rotation

## Reference

Original implementations in `features/goose/crates/`:
- `goose-server/src/auth.rs`
- `goose/src/oauth/`
- `goose/src/providers/oauth.rs`
- `goose/src/providers/azureauth.rs`
- `goose/src/providers/gcpauth.rs`

## License

Apache-2.0 (inherited from original Goose project)
