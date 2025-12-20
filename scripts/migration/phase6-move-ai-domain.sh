#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 6: Move AI Domain
# ════════════════════════════════════════════════════════════════════════════════
# Migrates all AI/ML projects from features/AI core/ and apps/ai/ to modules/ai/
# and updates docker-compose references
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 6: Moving AI Domain"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Check if modules/ai exists
if [ ! -d "modules/ai" ]; then
    echo "Error: modules/ai/ does not exist. Run phase1-create-domain-structure.sh first."
    exit 1
fi

# Backup docker-compose files
echo "Backing up docker-compose files..."
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.phase6
fi
if [ -f "docker-compose.ai.yml" ]; then
    cp docker-compose.ai.yml docker-compose.ai.yml.backup.phase6
fi

# Function to safely move directory
safe_move() {
    local source="$1"
    local dest="$2"
    
    if [ -d "$source" ]; then
        echo "  Moving $source -> $dest"
        # Create parent directory if needed
        mkdir -p "$(dirname "$dest")"
        # Move the directory
        mv "$source" "$dest"
    else
        echo "  ⚠ Skipping $source (not found)"
    fi
}

echo "Moving AI modules from features/AI core/..."

# Move Firecrawl (checking different possible locations)
if [ -d "features/AI core/firecrawl" ]; then
    safe_move "features/AI core/firecrawl" "modules/ai/firecrawl"
elif [ -d "features/AI\ core/firecrawl" ]; then
    safe_move "features/AI\ core/firecrawl" "modules/ai/firecrawl"
elif [ -d "apps/ai/firecrawl-api" ]; then
    safe_move "apps/ai/firecrawl-api" "modules/ai/firecrawl"
fi

# Move Firecrawl MCP server
if [ -d "features/AI core/firecrawl-mcp-server" ]; then
    safe_move "features/AI core/firecrawl-mcp-server" "modules/ai/firecrawl-mcp"
elif [ -d "features/AI\ core/firecrawl-mcp-server" ]; then
    safe_move "features/AI\ core/firecrawl-mcp-server" "modules/ai/firecrawl-mcp"
fi

# Move Goose
if [ -d "features/AI core/goose" ]; then
    safe_move "features/AI core/goose" "modules/ai/goose"
elif [ -d "features/AI\ core/goose" ]; then
    safe_move "features/AI\ core/goose" "modules/ai/goose"
elif [ -d "apps/ai/goose" ]; then
    safe_move "apps/ai/goose" "modules/ai/goose"
fi

# Move Chroma MCP
safe_move "features/chroma-mcp" "modules/ai/chroma-mcp"

# Move FileScope MCP
safe_move "features/FileScopeMCP" "modules/ai/filescope-mcp"

# Move Inspector
if [ -d "features/AI core/inspector" ]; then
    safe_move "features/AI core/inspector" "modules/ai/inspector"
elif [ -d "features/AI\ core/inspector" ]; then
    safe_move "features/AI\ core/inspector" "modules/ai/inspector"
fi

# Move KasmVNC
if [ -d "features/AI core/KasmVNC" ]; then
    safe_move "features/AI core/KasmVNC" "modules/ai/kasmvnc"
elif [ -d "features/AI\ core/KasmVNC" ]; then
    safe_move "features/AI\ core/KasmVNC" "modules/ai/kasmvnc"
fi

echo "Moving AI modules from apps/ai/..."

# Move Analytics
safe_move "apps/ai/analytics" "modules/ai/analytics"

# Move Playwright service
safe_move "apps/ai/playwright-service" "modules/ai/playwright-service"

# Move HTML to Markdown service
safe_move "apps/ai/go-html-to-md-service" "modules/ai/html-to-md-service"

# Move PostgreSQL for AI
safe_move "apps/ai/nuq-postgres" "modules/ai/nuq-postgres"

# Create docker-compose.ai.yml if it doesn't exist
if [ ! -f "docker-compose.ai.yml" ]; then
    echo "Creating docker-compose.ai.yml..."
    cat > docker-compose.ai.yml << 'EOF'
# AI/ML Domain Services
# All AI and ML-focused modules and their dependencies

version: '3.8'

services:
  # ════════════════════════════════════════════════════════════════════════════════
  # Firecrawl - Web Scraping & Crawling
  # ════════════════════════════════════════════════════════════════════════════════
  firecrawl-api:
    build:
      context: ./modules/ai/firecrawl/api
      dockerfile: Dockerfile
    container_name: firecrawl-api
    ports:
      - "3002:3002"
    environment:
      - REDIS_URL=redis://firecrawl-redis:6379
      - NUM_WORKERS_PER_QUEUE=8
    depends_on:
      - firecrawl-redis
    networks:
      - ai-network

  firecrawl-ui:
    build:
      context: ./modules/ai/firecrawl/ui
      dockerfile: Dockerfile
    container_name: firecrawl-ui
    ports:
      - "3030:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://firecrawl-api:3002
    depends_on:
      - firecrawl-api
    networks:
      - ai-network

  firecrawl-redis:
    image: redis:7-alpine
    container_name: firecrawl-redis
    ports:
      - "6379:6379"
    volumes:
      - firecrawl-redis-data:/data
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Firecrawl MCP Server
  # ════════════════════════════════════════════════════════════════════════════════
  firecrawl-mcp:
    build:
      context: ./modules/ai/firecrawl-mcp
      dockerfile: Dockerfile
    container_name: firecrawl-mcp
    ports:
      - "3201:3000"
    environment:
      - FIRECRAWL_API_URL=http://firecrawl-api:3002
    depends_on:
      - firecrawl-api
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Goose - AI Agent
  # ════════════════════════════════════════════════════════════════════════════════
  goose:
    build:
      context: ./modules/ai/goose
      dockerfile: Dockerfile
    container_name: goose
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Chroma MCP - Vector Database
  # ════════════════════════════════════════════════════════════════════════════════
  chroma-mcp:
    build:
      context: ./modules/ai/chroma-mcp
      dockerfile: Dockerfile
    container_name: chroma-mcp
    ports:
      - "3202:3000"
    volumes:
      - chroma-data:/chroma/data
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # FileScope MCP Server
  # ════════════════════════════════════════════════════════════════════════════════
  filescope-mcp:
    build:
      context: ./modules/ai/filescope-mcp
      dockerfile: Dockerfile
    container_name: filescope-mcp
    ports:
      - "3203:3000"
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # MCP Inspector
  # ════════════════════════════════════════════════════════════════════════════════
  mcp-inspector:
    build:
      context: ./modules/ai/inspector
      dockerfile: Dockerfile
    container_name: mcp-inspector
    ports:
      - "3031:3000"
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Analytics Service
  # ════════════════════════════════════════════════════════════════════════════════
  analytics:
    build:
      context: ./modules/ai/analytics
      dockerfile: Dockerfile
    container_name: analytics
    ports:
      - "8003:8000"
    environment:
      - POSTGRES_URL=postgresql://analytics:analytics@analytics-db:5432/analytics
    depends_on:
      - analytics-db
    networks:
      - ai-network

  analytics-db:
    image: postgres:15-alpine
    container_name: analytics-db
    environment:
      - POSTGRES_DB=analytics
      - POSTGRES_USER=analytics
      - POSTGRES_PASSWORD=analytics
    volumes:
      - analytics-db-data:/var/lib/postgresql/data
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Playwright Service - Browser Automation
  # ════════════════════════════════════════════════════════════════════════════════
  playwright:
    build:
      context: ./modules/ai/playwright-service
      dockerfile: Dockerfile
    container_name: playwright
    ports:
      - "8004:8000"
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # HTML to Markdown Service
  # ════════════════════════════════════════════════════════════════════════════════
  html-to-md:
    build:
      context: ./modules/ai/html-to-md-service
      dockerfile: Dockerfile
    container_name: html-to-md
    ports:
      - "8005:8080"
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # PostgreSQL for AI (with pgvector)
  # ════════════════════════════════════════════════════════════════════════════════
  ai-postgres:
    build:
      context: ./modules/ai/nuq-postgres
      dockerfile: Dockerfile
    container_name: ai-postgres
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_DB=ai
      - POSTGRES_USER=ai
      - POSTGRES_PASSWORD=ai
    volumes:
      - ai-postgres-data:/var/lib/postgresql/data
    networks:
      - ai-network

  # ════════════════════════════════════════════════════════════════════════════════
  # KasmVNC - Remote Desktop for AI
  # ════════════════════════════════════════════════════════════════════════════════
  kasmvnc:
    build:
      context: ./modules/ai/kasmvnc
      dockerfile: Dockerfile
    container_name: kasmvnc
    ports:
      - "6901:6901"
    environment:
      - VNC_PW=password
    networks:
      - ai-network

volumes:
  firecrawl-redis-data:
  chroma-data:
  analytics-db-data:
  ai-postgres-data:

networks:
  ai-network:
    driver: bridge
EOF
fi

# Update path references in docker-compose files
echo "Updating docker-compose path references..."

# Create a temporary sed script for updates
cat > /tmp/update-ai-paths.sed << 'EOF'
s|features/AI core/firecrawl|modules/ai/firecrawl|g
s|features/AI\\ core/firecrawl|modules/ai/firecrawl|g
s|apps/ai/firecrawl-api|modules/ai/firecrawl|g
s|features/AI core/firecrawl-mcp-server|modules/ai/firecrawl-mcp|g
s|features/AI\\ core/firecrawl-mcp-server|modules/ai/firecrawl-mcp|g
s|features/AI core/goose|modules/ai/goose|g
s|features/AI\\ core/goose|modules/ai/goose|g
s|apps/ai/goose|modules/ai/goose|g
s|features/chroma-mcp|modules/ai/chroma-mcp|g
s|features/FileScopeMCP|modules/ai/filescope-mcp|g
s|features/AI core/inspector|modules/ai/inspector|g
s|features/AI\\ core/inspector|modules/ai/inspector|g
s|features/AI core/KasmVNC|modules/ai/kasmvnc|g
s|features/AI\\ core/KasmVNC|modules/ai/kasmvnc|g
s|apps/ai/analytics|modules/ai/analytics|g
s|apps/ai/playwright-service|modules/ai/playwright-service|g
s|apps/ai/go-html-to-md-service|modules/ai/html-to-md-service|g
s|apps/ai/nuq-postgres|modules/ai/nuq-postgres|g
EOF

# Update docker-compose files
if [ -f "docker-compose.yml" ]; then
    sed -i.bak -f /tmp/update-ai-paths.sed docker-compose.yml
fi

if [ -f "docker-compose.ai.yml" ]; then
    sed -i.bak -f /tmp/update-ai-paths.sed docker-compose.ai.yml
fi

# Clean up
rm /tmp/update-ai-paths.sed

# Create a migration log
cat > modules/ai/MIGRATION.md << 'EOF'
# AI/ML Domain Migration Log

## Phase 6: Completed

### Migrated Modules (from features/AI core/)

- ✓ Firecrawl (from features/AI core/firecrawl or apps/ai/firecrawl-api)
- ✓ Firecrawl MCP Server (from features/AI core/firecrawl-mcp-server)
- ✓ Goose (from features/AI core/goose or apps/ai/goose)
- ✓ Chroma MCP (from features/chroma-mcp)
- ✓ FileScope MCP (from features/FileScopeMCP)
- ✓ MCP Inspector (from features/AI core/inspector)
- ✓ KasmVNC (from features/AI core/KasmVNC)

### Migrated Modules (from apps/ai/)

- ✓ Analytics (from apps/ai/analytics)
- ✓ Playwright Service (from apps/ai/playwright-service)
- ✓ HTML to Markdown Service (from apps/ai/go-html-to-md-service)
- ✓ PostgreSQL for AI (from apps/ai/nuq-postgres)

### Updated Files

- ✓ docker-compose.yml (path references updated)
- ✓ docker-compose.ai.yml (created/updated)

### Backups Created

- docker-compose.yml.backup.phase6
- docker-compose.ai.yml.backup.phase6

## Testing

Before committing, verify:

```bash
# Test AI domain services can build
docker-compose -f docker-compose.ai.yml build

# Test AI domain services can start
docker-compose -f docker-compose.ai.yml up -d

# Check service health
docker-compose -f docker-compose.ai.yml ps

# Test Firecrawl API
curl http://localhost:3002/health

# Test MCP servers
curl http://localhost:3201/health  # Firecrawl MCP
curl http://localhost:3202/health  # Chroma MCP
curl http://localhost:3203/health  # FileScope MCP
```

## Rollback

If issues occur, rollback with:

```bash
git restore modules/ai/
mv docker-compose.yml.backup.phase6 docker-compose.yml
mv docker-compose.ai.yml.backup.phase6 docker-compose.ai.yml
```
EOF

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 6 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Migrated modules to modules/ai/:"
echo "  - firecrawl"
echo "  - firecrawl-mcp"
echo "  - goose"
echo "  - chroma-mcp"
echo "  - filescope-mcp"
echo "  - inspector"
echo "  - kasmvnc"
echo "  - analytics"
echo "  - playwright-service"
echo "  - html-to-md-service"
echo "  - nuq-postgres"
echo ""
echo "Updated files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.ai.yml"
echo ""
echo "Backups created:"
echo "  - docker-compose.yml.backup.phase6"
echo "  - docker-compose.ai.yml.backup.phase6"
echo ""
echo "═════════════════════════════════════════════════════════════════════════════════"
echo "  All 6 migration phases complete!"
echo "═════════════════════════════════════════════════════════════════════════════════"
echo ""
