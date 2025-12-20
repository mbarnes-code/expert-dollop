# Node.js/TypeScript Infrastructure

This directory contains infrastructure documentation and common configuration patterns for Node.js/TypeScript projects in the AI module.

## Projects Using This Stack

### 1. **analytics** (`/modules/ai/analytics`)
- **Framework**: Next.js 14
- **Package Manager**: npm
- **Purpose**: AI analytics dashboard
- **Common Files**:
  - `package.json`
  - `tsconfig.json`
  - `next.config.mjs`
  - `next-env.d.ts`
  - `project.json` (Nx config)

### 2. **filescope-mcp** (`/modules/ai/filescope-mcp`)
- **Framework**: MCP Server with Node.js
- **Package Manager**: npm
- **Purpose**: File hierarchy and dependency tracking MCP server
- **Common Files**:
  - `package.json`
  - `tsconfig.json`
  - `vitest.config.ts`
  - `mcp.json` (config files for different platforms)
  - Build scripts (`build.sh`, `build.bat`)

### 3. **firecrawl-mcp** (`/modules/ai/firecrawl-mcp`)
- **Framework**: MCP Server
- **Package Manager**: npm/pnpm
- **Purpose**: Web scraping integration via MCP
- **Docker**: Multi-stage build with Node 22
- **Common Files**:
  - `package.json`
  - `pnpm-lock.yaml`
  - `tsconfig.json`
  - `Dockerfile`
  - `Dockerfile.service`
  - `server.json`
  - `smithery.yaml`
  - `.eslintrc.json`
  - `.prettierrc`
  - `jest.config.js`
  - `jest.setup.ts`

### 4. **playwright-service** (`/modules/ai/playwright-service`)
- **Framework**: Express + Playwright
- **Package Manager**: npm
- **Purpose**: Scraper API with Playwright
- **Common Files**:
  - `package.json`
  - `tsconfig.json`
  - `.env` (dotenv)
  - `api.ts`

### 5. **inspector** (`/modules/ai/inspector`)
- **Framework**: Monorepo with client/server/CLI
- **Package Manager**: npm workspaces
- **Purpose**: MCP inspector tool
- **Common Files**:
  - `package.json` (root + workspaces)
  - `tsconfig.json`
  - Workspace structure: `client/`, `server/`, `cli/`

### 6. **firecrawl** (`/modules/ai/firecrawl/apps/`)
Multiple sub-projects:
- **api** - Firecrawl API server (TypeScript)
- **js-sdk** - JavaScript SDK
- **test-suite** - Test automation
- **playwright-service-ts** - TypeScript Playwright service
- **Common Files**: `package.json`, `tsconfig.json`, test configs

### 7. **goose** (`/modules/ai/goose/`)
- **UI Components**: Desktop UI and Documentation site (TypeScript/React)
- **Locations**: `ui/desktop/`, `goose/desktop/`, `documentation/`
- **Common Files**: `package.json`, `tsconfig.json`

### 8. **NVIDIA Examples** (`/modules/ai/NVIDIA/`)
- **txt2kg frontend** - Text to Knowledge Graph UI
- **multi-agent-chatbot frontend** - Multi-agent chat interface
- **Framework**: React/Next.js
- **Common Files**: `package.json`

## Common Configuration Files

### package.json
Standard structure for Node.js projects:
```json
{
  "name": "@expert-dollop/ai-<project>",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "...",
    "build": "tsc",
    "start": "...",
    "test": "jest|vitest"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### tsconfig.json
TypeScript compiler configuration:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Dockerfile (Multi-stage)
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build

FROM node:22-slim AS release
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
ENTRYPOINT ["node", "dist/index.js"]
```

## Test Frameworks

### Jest
- Used in: firecrawl-mcp
- Config: `jest.config.js`, `jest.setup.ts`

### Vitest
- Used in: filescope-mcp
- Config: `vitest.config.ts`
- Coverage: `@vitest/coverage-v8`

## Build Tools

### TypeScript Compiler (tsc)
- All projects use `tsc` for compilation
- Some use `tsc-watch` for development

### Next.js
- Used in: analytics
- Config: `next.config.mjs`

## Package Managers

### npm
- Most projects (default)

### pnpm
- Used in: firecrawl-mcp
- Faster, more efficient than npm

## Common Dependencies

### Runtime
- `@modelcontextprotocol/sdk` - MCP servers
- `express` - Web servers
- `playwright` - Browser automation
- `next` - Next.js framework
- `react` - UI framework

### Development
- `typescript` - Type checking
- `@types/node` - Node.js types
- `tsx` - TypeScript execution
- `ts-node` - TypeScript execution
- `vitest` / `jest` - Testing
- `eslint` - Linting
- `prettier` - Code formatting

## Environment Variables

Common patterns:
```bash
# API Keys
FIRECRAWL_API_KEY=
OPENAI_API_KEY=

# Service URLs
API_URL=http://localhost:3000
DATABASE_URL=

# Ports
PORT=3000
```

## Docker Compose Patterns

```yaml
services:
  service-name:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./:/app
      - /app/node_modules
```

## Best Practices

1. **Use TypeScript** - All projects should use TypeScript for type safety
2. **Multi-stage Docker builds** - Optimize container size
3. **Module type** - Set `"type": "module"` for ESM support
4. **Strict mode** - Enable strict TypeScript checking
5. **Test coverage** - Aim for >80% code coverage
6. **Linting** - Use ESLint + Prettier
7. **CI/CD** - GitHub Actions for automated testing/deployment
