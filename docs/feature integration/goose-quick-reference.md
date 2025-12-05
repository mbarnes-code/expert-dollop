# Goose Integration - Quick Reference

## 🚀 Quick Start

### Run Desktop App
```bash
cd apps/ai/goose/desktop
npm install
npm run start-gui
```

### Run Backend Server
```bash
cd backend/services/goose
cargo run -p goose-server
```

### Run CLI
```bash
cd backend/services/goose
cargo run -p goose-cli
```

## 📁 Directory Structure

| Location | Purpose | Type |
|----------|---------|------|
| `apps/ai/goose/desktop/` | Electron desktop app | Symlink |
| `apps/ai/goose/documentation/` | Docusaurus docs | Symlink |
| `backend/services/goose/crates/` | Rust workspace | Symlink |
| `backend/auth/goose/` | Auth components | Symlinks |
| `features/goose/` | Original project | Source |

## 🔑 Critical Components

| Component | Location | Importance |
|-----------|----------|------------|
| Core Agent | `crates/goose/src/agents/agent.rs` | ⭐⭐⭐⭐⭐ |
| Extension Manager | `crates/goose/src/agents/extension_manager.rs` | ⭐⭐⭐⭐⭐ |
| Recipe System | `crates/goose/src/recipe/mod.rs` | ⭐⭐⭐⭐ |
| Sub-Recipe Manager | `crates/goose/src/agents/sub_recipe_manager.rs` | ⭐⭐⭐⭐⭐ |
| Conversation Manager | `crates/goose/src/conversation/mod.rs` | ⭐⭐⭐⭐ |
| LLM Providers | `crates/goose/src/providers/` | ⭐⭐⭐⭐⭐ |
| Server Auth | `crates/goose-server/src/auth.rs` | ⭐⭐⭐ |

## 🔧 Common Commands

### Backend (Rust)
```bash
# Build all crates
cargo build --workspace --release

# Run tests
cargo test --workspace

# Run specific crate
cargo run -p goose
cargo run -p goose-server
cargo run -p goose-cli

# Check code
cargo clippy --workspace
cargo fmt --workspace
```

### Frontend (TypeScript)
```bash
cd apps/ai/goose/desktop

# Development
npm run start-gui
npm run start-gui-debug

# Testing
npm test                  # Unit tests
npm run test-e2e         # E2E tests
npm run test-e2e:ui      # E2E with UI

# Linting
npm run lint
npm run lint:check
npm run typecheck

# Building
npm run package
npm run make
```

## 🌐 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | GET | List sessions |
| `/api/sessions` | POST | Create session |
| `/api/sessions/{id}` | GET | Get session |
| `/api/sessions/{id}/messages` | POST | Send message |
| `/api/recipes` | GET | List recipes |
| `/api/recipes/execute` | POST | Execute recipe |
| `/ws/sessions/{id}` | WebSocket | Real-time updates |

## 🔐 Authentication

### API Key
```bash
export GOOSE_API_KEY="your-secret-key"
```

### OAuth Providers
```bash
# Azure
export AZURE_TENANT_ID="..."
export AZURE_CLIENT_ID="..."
export AZURE_CLIENT_SECRET="..."

# GCP
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

## 🧪 Testing

### Rust Tests
```bash
cd backend/services/goose

# All tests
cargo test --workspace

# Specific crate
cargo test -p goose
cargo test -p goose-server

# With output
cargo test -- --nocapture

# Specific test
cargo test test_name
```

### Frontend Tests
```bash
cd apps/ai/goose/desktop

# Unit tests
npm test
npm run test:ui         # With UI
npm run test:coverage   # With coverage

# E2E tests
npm run test-e2e
npm run test-e2e:debug
npm run test-e2e:ui
```

## 📊 LLM Providers

### Supported Providers
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Azure OpenAI
- AWS Bedrock
- GCP Vertex AI
- Databricks
- Ollama (local)
- GitHub Copilot
- Google Gemini
- And 30+ more...

### Configuration
```yaml
# config.yaml
provider: openai
model: gpt-4
api_key: ${OPENAI_API_KEY}
```

## 🔄 Integration Points

### With n8n
```yaml
# Trigger n8n from Goose recipe
steps:
  - tool: webhook
    endpoint: "http://n8n:5678/webhook/goose"
    data: ${context}
```

```json
// Trigger Goose from n8n
{
  "url": "http://goose-server:8000/api/recipe/execute",
  "method": "POST",
  "body": {"recipe": "task-name"}
}
```

### With DAPR (Future)
```bash
dapr run --app-id goose-server \
  --app-port 8000 \
  --dapr-http-port 3500 \
  --components-path ./infrastructure/dapr/components \
  -- cargo run -p goose-server
```

## 📝 Recipe Example

```yaml
name: "example-workflow"
description: "Example automation recipe"
version: "1.0.0"

steps:
  - name: "analyze-code"
    tool: "developer"
    action: "analyze"
    parameters:
      path: "./src"
      
  - name: "generate-tests"
    tool: "developer"
    action: "write_tests"
    parameters:
      coverage_target: 80
      
  - name: "run-tests"
    tool: "shell"
    command: "npm test"
```

## 🐛 Troubleshooting

### Symlinks not working
```bash
# Enable Git symlinks
git config core.symlinks true

# On Windows: Enable Developer Mode or run as Admin
```

### Rust build fails
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build
```

### Node build fails
```bash
cd apps/ai/goose/desktop
rm -rf node_modules package-lock.json
npm install
```

### Import errors
```bash
# Regenerate OpenAPI client
cd apps/ai/goose/desktop
npm run generate-api
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `apps/ai/goose/README.md` | Frontend integration |
| `backend/services/goose/README.md` | Backend services |
| `backend/auth/goose/README.md` | Authentication |
| `docs/goose-integration.md` | Migration guide |
| `docs/goose-integration-manifest.md` | Architecture manifest |

## 🆘 Getting Help

- **Original Goose Docs**: `apps/ai/goose/documentation/`
- **Discord**: https://discord.gg/goose-oss
- **GitHub**: https://github.com/block/goose
- **Issues**: Report in Expert-Dollop repo

## ⚡ Performance Tips

### Backend
- Use `--release` for production builds
- Enable LTO in Cargo.toml
- Use connection pooling
- Cache provider responses

### Frontend
- Enable production mode
- Use code splitting
- Lazy load components
- Optimize bundle size

## 🔒 Security Checklist

- [ ] API keys in environment variables
- [ ] OAuth tokens in keyring
- [ ] HTTPS for production
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] CORS configured
- [ ] Secrets not in code
- [ ] Dependencies updated

## 📦 Dependencies

### Rust Key Crates
- tokio: Async runtime
- rmcp: Model Context Protocol
- axum: HTTP server
- serde: Serialization
- sqlx: Database

### Node Key Packages
- react: UI framework
- electron: Desktop platform
- vite: Build tool
- @radix-ui: UI components
- tailwindcss: Styling

## 🎯 Next Steps

1. **Explore the code**: Browse `backend/services/goose/crates/`
2. **Run the app**: Try `cd apps/ai/goose/desktop && npm run start-gui`
3. **Read docs**: Check `apps/ai/goose/documentation/`
4. **Try recipes**: Create custom workflow recipes
5. **Integrate**: Connect with n8n workflows

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-03  
**Pattern**: Strangler Fig  
**Status**: Phase 1 Complete ✅
