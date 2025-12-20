#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 5: Move Workflow Domain
# ════════════════════════════════════════════════════════════════════════════════
# Migrates all workflow automation projects from features/AI core/ to modules/workflow/
# and updates docker-compose references
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 5: Moving Workflow Domain"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Check if modules/workflow exists
if [ ! -d "modules/workflow" ]; then
    echo "Error: modules/workflow/ does not exist. Run phase1-create-domain-structure.sh first."
    exit 1
fi

# Backup docker-compose files
echo "Backing up docker-compose files..."
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.phase5
fi
if [ -f "docker-compose.workflow.yml" ]; then
    cp docker-compose.workflow.yml docker-compose.workflow.yml.backup.phase5
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

echo "Moving workflow modules..."

# Move n8n (checking different possible locations)
if [ -d "features/AI core/n8n" ]; then
    safe_move "features/AI core/n8n" "modules/workflow/n8n"
elif [ -d "features/AI\ core/n8n" ]; then
    safe_move "features/AI\ core/n8n" "modules/workflow/n8n"
elif [ -d "apps/ai/n8n" ]; then
    safe_move "apps/ai/n8n" "modules/workflow/n8n"
fi

# Move n8n MCP server (checking different possible locations)
if [ -d "features/AI core/n8n-mcp-server" ]; then
    safe_move "features/AI core/n8n-mcp-server" "modules/workflow/n8n-mcp"
elif [ -d "features/AI\ core/n8n-mcp-server" ]; then
    safe_move "features/AI\ core/n8n-mcp-server" "modules/workflow/n8n-mcp"
elif [ -d "apps/ai/n8n-mcp-server" ]; then
    safe_move "apps/ai/n8n-mcp-server" "modules/workflow/n8n-mcp"
fi

# Create docker-compose.workflow.yml if it doesn't exist
if [ ! -f "docker-compose.workflow.yml" ]; then
    echo "Creating docker-compose.workflow.yml..."
    cat > docker-compose.workflow.yml << 'EOF'
# Workflow Automation Domain Services
# All workflow automation modules and their dependencies

version: '3.8'

services:
  # ════════════════════════════════════════════════════════════════════════════════
  # n8n - Workflow Automation Platform
  # ════════════════════════════════════════════════════════════════════════════════
  n8n:
    build:
      context: ./modules/workflow/n8n
      dockerfile: Dockerfile
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=n8n-db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-defaultencryptionkey}
    volumes:
      - n8n-data:/home/node/.n8n
      - ./modules/workflow/n8n/custom-nodes:/home/node/.n8n/custom
    depends_on:
      - n8n-db
    networks:
      - workflow-network

  n8n-worker:
    build:
      context: ./modules/workflow/n8n
      dockerfile: Dockerfile.worker
    container_name: n8n-worker
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=n8n-db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-defaultencryptionkey}
      - EXECUTIONS_MODE=queue
    volumes:
      - n8n-data:/home/node/.n8n
      - ./modules/workflow/n8n/custom-nodes:/home/node/.n8n/custom
    depends_on:
      - n8n-db
      - rabbitmq
    networks:
      - workflow-network

  n8n-db:
    image: postgres:15-alpine
    container_name: n8n-db
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
    volumes:
      - n8n-db-data:/var/lib/postgresql/data
    networks:
      - workflow-network

  # ════════════════════════════════════════════════════════════════════════════════
  # n8n MCP Server
  # ════════════════════════════════════════════════════════════════════════════════
  n8n-mcp:
    build:
      context: ./modules/workflow/n8n-mcp
      dockerfile: Dockerfile
    container_name: n8n-mcp
    ports:
      - "3200:3000"
    environment:
      - N8N_API_URL=http://n8n:5678
      - N8N_API_KEY=${N8N_API_KEY}
    depends_on:
      - n8n
    networks:
      - workflow-network

  # ════════════════════════════════════════════════════════════════════════════════
  # RabbitMQ - Message Queue for n8n workers
  # ════════════════════════════════════════════════════════════════════════════════
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=n8n
      - RABBITMQ_DEFAULT_PASS=n8n
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - workflow-network

volumes:
  n8n-db-data:
  n8n-data:
  rabbitmq-data:

networks:
  workflow-network:
    driver: bridge
EOF
fi

# Update path references in docker-compose files
echo "Updating docker-compose path references..."

# Create a temporary sed script for updates
cat > /tmp/update-workflow-paths.sed << 'EOF'
s|features/AI core/n8n|modules/workflow/n8n|g
s|features/AI\\ core/n8n|modules/workflow/n8n|g
s|apps/ai/n8n|modules/workflow/n8n|g
s|features/AI core/n8n-mcp-server|modules/workflow/n8n-mcp|g
s|features/AI\\ core/n8n-mcp-server|modules/workflow/n8n-mcp|g
s|apps/ai/n8n-mcp-server|modules/workflow/n8n-mcp|g
EOF

# Update docker-compose files
if [ -f "docker-compose.yml" ]; then
    sed -i.bak -f /tmp/update-workflow-paths.sed docker-compose.yml
fi

if [ -f "docker-compose.workflow.yml" ]; then
    sed -i.bak -f /tmp/update-workflow-paths.sed docker-compose.workflow.yml
fi

# Clean up
rm /tmp/update-workflow-paths.sed

# Create a migration log
cat > modules/workflow/MIGRATION.md << 'EOF'
# Workflow Automation Domain Migration Log

## Phase 5: Completed

### Migrated Modules

- ✓ n8n (from features/AI core/n8n or apps/ai/n8n)
- ✓ n8n MCP Server (from features/AI core/n8n-mcp-server or apps/ai/n8n-mcp-server)

### Updated Files

- ✓ docker-compose.yml (path references updated)
- ✓ docker-compose.workflow.yml (created/updated)

### Backups Created

- docker-compose.yml.backup.phase5
- docker-compose.workflow.yml.backup.phase5

## Testing

Before committing, verify:

```bash
# Test workflow domain services can build
docker-compose -f docker-compose.workflow.yml build

# Test workflow domain services can start
docker-compose -f docker-compose.workflow.yml up -d

# Check service health
docker-compose -f docker-compose.workflow.yml ps

# Test n8n is accessible
curl http://localhost:5678

# Test RabbitMQ management interface
curl http://localhost:15672
```

## Rollback

If issues occur, rollback with:

```bash
git restore modules/workflow/
mv docker-compose.yml.backup.phase5 docker-compose.yml
mv docker-compose.workflow.yml.backup.phase5 docker-compose.workflow.yml
```
EOF

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 5 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Migrated modules to modules/workflow/:"
echo "  - n8n"
echo "  - n8n-mcp"
echo ""
echo "Updated files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.workflow.yml"
echo ""
echo "Backups created:"
echo "  - docker-compose.yml.backup.phase5"
echo "  - docker-compose.workflow.yml.backup.phase5"
echo ""
echo "Next step: Run phase6-move-ai-domain.sh"
echo ""
