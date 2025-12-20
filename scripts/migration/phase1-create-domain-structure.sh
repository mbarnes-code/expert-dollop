#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 1: Create Domain Structure
# ════════════════════════════════════════════════════════════════════════════════
# Creates the foundational directory structure for the domain-based modular monolith
# - modules/ for domain-based bounded contexts
# - libs/ for minimal shared code (only when used by 3+ modules)
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 1: Creating Domain Structure"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Create modules directory structure
echo "Creating modules/ directory with domain-based structure..."
mkdir -p modules/{security,tcg,productivity,workflow,ai}

# Create libs directory with language-specific shared code
echo "Creating libs/ directory for minimal shared code..."
mkdir -p libs/{typescript,python,rust,go}

# Create language-specific subdirectories
mkdir -p libs/typescript/{common,ui-components,utils}
mkdir -p libs/python/{common,utils}
mkdir -p libs/rust/{common,utils}
mkdir -p libs/go/{common,utils}

# Create README files for each domain
cat > modules/security/README.md << 'EOF'
# Security Domain

This domain contains all security-focused modules including:
- Ghostwriter (Red Team C2 & Reporting)
- Nemesis (Offensive Security Platform)
- MISP (Threat Intelligence Platform)
- Dispatch (Incident Management)
- YARA-X (Malware Pattern Matching)
- Maltrail (Malicious Traffic Detection)
- RITA (Beacon Detection)
- HELK (Hunting ELK Stack)
- CyberChef (Data Analysis)
- MalwareBazaar MCP Server
- VirusTotal MCP Server

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
EOF

cat > modules/tcg/README.md << 'EOF'
# Trading Card Game Domain

This domain contains all TCG-focused modules including:
- Commander Spellbook (MTG Combo Database)
- Commander Map (MTG Commander Visualization)
- MTG Scripting Toolkit

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
EOF

cat > modules/productivity/README.md << 'EOF'
# Productivity Domain

This domain contains all productivity-focused modules including:
- Mealie (Recipe & Meal Planning)
- Actual Budget (Personal Finance)
- IT Tools (Developer Utilities)

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
EOF

cat > modules/workflow/README.md << 'EOF'
# Workflow Automation Domain

This domain contains all workflow automation modules including:
- n8n (Workflow Automation Platform)
- n8n MCP Server

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
EOF

cat > modules/ai/README.md << 'EOF'
# AI/ML Domain

This domain contains all AI and ML-focused modules including:
- Firecrawl (Web Scraping & Crawling)
- Firecrawl MCP Server
- Goose (AI Agent)
- Chroma MCP (Vector Database)
- FileScope MCP Server
- MCP Inspector
- Analytics Service
- Playwright Service
- HTML to Markdown Service
- PostgreSQL for AI
- KasmVNC (Remote Desktop)

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
EOF

# Create libs README files
cat > libs/README.md << 'EOF'
# Shared Libraries

This directory contains MINIMAL shared code that is used across multiple domains.

## Principle: Prefer Duplication Over Premature Abstraction

Only extract code to libs/ when:
1. The code is used by 3+ modules across DIFFERENT domains
2. The code has a clear, single purpose
3. The code is stable and unlikely to change frequently

## Structure

- `typescript/` - Shared TypeScript utilities and components
- `python/` - Shared Python utilities and modules
- `rust/` - Shared Rust crates and utilities
- `go/` - Shared Go packages and utilities

## Guidelines

- Each lib should have its own package.json/requirements.txt/Cargo.toml/go.mod
- Each lib should be independently versioned
- Each lib should have comprehensive tests
- Libs should NOT depend on other libs unless absolutely necessary
EOF

cat > libs/typescript/README.md << 'EOF'
# TypeScript Shared Libraries

Minimal shared TypeScript code used across multiple domains.

## Packages

- `common/` - Common utilities (logging, config, etc.)
- `ui-components/` - Shared UI components (only if used by 3+ frontends)
- `utils/` - Utility functions

## Usage

Each package is independently versioned and can be imported by modules:

```typescript
import { logger } from '@expert-dollop/typescript-common';
```
EOF

cat > libs/python/README.md << 'EOF'
# Python Shared Libraries

Minimal shared Python code used across multiple domains.

## Packages

- `common/` - Common utilities (logging, config, etc.)
- `utils/` - Utility functions

## Usage

Each package is independently versioned and can be imported by modules:

```python
from expert_dollop.python_common import logger
```
EOF

cat > libs/rust/README.md << 'EOF'
# Rust Shared Libraries

Minimal shared Rust code used across multiple domains.

## Packages

- `common/` - Common utilities
- `utils/` - Utility functions

## Usage

Each crate is independently versioned and can be imported by modules:

```toml
[dependencies]
expert-dollop-rust-common = { path = "../../libs/rust/common" }
```
EOF

cat > libs/go/README.md << 'EOF'
# Go Shared Libraries

Minimal shared Go code used across multiple domains.

## Packages

- `common/` - Common utilities
- `utils/` - Utility functions

## Usage

Each package is independently versioned and can be imported by modules:

```go
import "github.com/mbarnes-code/expert-dollop/libs/go/common"
```
EOF

# Create .gitkeep files to ensure empty directories are tracked
find modules -type d -empty -exec touch {}/.gitkeep \;
find libs -type d -empty -exec touch {}/.gitkeep \;

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 1 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Created structure:"
echo "  - modules/security/"
echo "  - modules/tcg/"
echo "  - modules/productivity/"
echo "  - modules/workflow/"
echo "  - modules/ai/"
echo "  - libs/typescript/"
echo "  - libs/python/"
echo "  - libs/rust/"
echo "  - libs/go/"
echo ""
echo "Next step: Run phase2-move-security-domain.sh"
echo ""
