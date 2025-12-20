#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 4: Move Productivity Domain
# ════════════════════════════════════════════════════════════════════════════════
# Migrates all productivity-focused projects from features/ to modules/productivity/
# and updates docker-compose references
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 4: Moving Productivity Domain"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Check if modules/productivity exists
if [ ! -d "modules/productivity" ]; then
    echo "Error: modules/productivity/ does not exist. Run phase1-create-domain-structure.sh first."
    exit 1
fi

# Backup docker-compose files
echo "Backing up docker-compose files..."
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.phase4
fi
if [ -f "docker-compose.productivity.yml" ]; then
    cp docker-compose.productivity.yml docker-compose.productivity.yml.backup.phase4
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

echo "Moving productivity modules..."

# Move Mealie
safe_move "features/mealie" "modules/productivity/mealie"

# Move Actual Budget
safe_move "features/actual" "modules/productivity/actual"

# Move IT Tools
safe_move "features/it-tools" "modules/productivity/it-tools"

# Create docker-compose.productivity.yml if it doesn't exist
if [ ! -f "docker-compose.productivity.yml" ]; then
    echo "Creating docker-compose.productivity.yml..."
    cat > docker-compose.productivity.yml << 'EOF'
# Productivity Domain Services
# All productivity-focused modules and their dependencies

version: '3.8'

services:
  # ════════════════════════════════════════════════════════════════════════════════
  # Mealie - Recipe & Meal Planning
  # ════════════════════════════════════════════════════════════════════════════════
  mealie-backend:
    build:
      context: ./modules/productivity/mealie/backend
      dockerfile: Dockerfile
    container_name: mealie-backend
    ports:
      - "9000:9000"
    environment:
      - ALLOW_SIGNUP=true
      - DB_ENGINE=postgres
      - POSTGRES_USER=mealie
      - POSTGRES_PASSWORD=mealie
      - POSTGRES_SERVER=mealie-db
      - POSTGRES_PORT=5432
      - POSTGRES_DB=mealie
    volumes:
      - mealie-data:/app/data
    depends_on:
      - mealie-db
    networks:
      - productivity-network

  mealie-frontend:
    build:
      context: ./modules/productivity/mealie/frontend
      dockerfile: Dockerfile
    container_name: mealie-frontend
    ports:
      - "3020:3000"
    environment:
      - API_URL=http://mealie-backend:9000
    depends_on:
      - mealie-backend
    networks:
      - productivity-network

  mealie-db:
    image: postgres:15-alpine
    container_name: mealie-db
    environment:
      - POSTGRES_DB=mealie
      - POSTGRES_USER=mealie
      - POSTGRES_PASSWORD=mealie
    volumes:
      - mealie-db-data:/var/lib/postgresql/data
    networks:
      - productivity-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Actual Budget - Personal Finance
  # ════════════════════════════════════════════════════════════════════════════════
  actual-budget:
    build:
      context: ./modules/productivity/actual
      dockerfile: Dockerfile
    container_name: actual-budget
    ports:
      - "5006:5006"
    volumes:
      - actual-data:/data
    networks:
      - productivity-network

  # ════════════════════════════════════════════════════════════════════════════════
  # IT Tools - Developer Utilities
  # ════════════════════════════════════════════════════════════════════════════════
  it-tools:
    build:
      context: ./modules/productivity/it-tools
      dockerfile: Dockerfile
    container_name: it-tools
    ports:
      - "3021:3000"
    networks:
      - productivity-network

volumes:
  mealie-db-data:
  mealie-data:
  actual-data:

networks:
  productivity-network:
    driver: bridge
EOF
fi

# Update path references in docker-compose files
echo "Updating docker-compose path references..."

# Create a temporary sed script for updates
cat > /tmp/update-productivity-paths.sed << 'EOF'
s|features/mealie|modules/productivity/mealie|g
s|features/actual|modules/productivity/actual|g
s|features/it-tools|modules/productivity/it-tools|g
EOF

# Update docker-compose files
if [ -f "docker-compose.yml" ]; then
    sed -i.bak -f /tmp/update-productivity-paths.sed docker-compose.yml
fi

if [ -f "docker-compose.productivity.yml" ]; then
    sed -i.bak -f /tmp/update-productivity-paths.sed docker-compose.productivity.yml
fi

# Clean up
rm /tmp/update-productivity-paths.sed

# Create a migration log
cat > modules/productivity/MIGRATION.md << 'EOF'
# Productivity Domain Migration Log

## Phase 4: Completed

### Migrated Modules

- ✓ Mealie (from features/mealie)
- ✓ Actual Budget (from features/actual)
- ✓ IT Tools (from features/it-tools)

### Updated Files

- ✓ docker-compose.yml (path references updated)
- ✓ docker-compose.productivity.yml (created/updated)

### Backups Created

- docker-compose.yml.backup.phase4
- docker-compose.productivity.yml.backup.phase4

## Testing

Before committing, verify:

```bash
# Test productivity domain services can build
docker-compose -f docker-compose.productivity.yml build

# Test productivity domain services can start
docker-compose -f docker-compose.productivity.yml up -d

# Check service health
docker-compose -f docker-compose.productivity.yml ps
```

## Rollback

If issues occur, rollback with:

```bash
git restore modules/productivity/
mv docker-compose.yml.backup.phase4 docker-compose.yml
mv docker-compose.productivity.yml.backup.phase4 docker-compose.productivity.yml
```
EOF

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 4 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Migrated modules to modules/productivity/:"
echo "  - mealie"
echo "  - actual"
echo "  - it-tools"
echo ""
echo "Updated files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.productivity.yml"
echo ""
echo "Backups created:"
echo "  - docker-compose.yml.backup.phase4"
echo "  - docker-compose.productivity.yml.backup.phase4"
echo ""
echo "Next step: Run phase5-move-workflow-domain.sh"
echo ""
