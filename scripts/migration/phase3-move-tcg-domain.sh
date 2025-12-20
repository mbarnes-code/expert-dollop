#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 3: Move TCG Domain
# ════════════════════════════════════════════════════════════════════════════════
# Migrates all TCG-focused projects from features/ to modules/tcg/
# and updates docker-compose references
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 3: Moving TCG Domain"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Check if modules/tcg exists
if [ ! -d "modules/tcg" ]; then
    echo "Error: modules/tcg/ does not exist. Run phase1-create-domain-structure.sh first."
    exit 1
fi

# Backup docker-compose files
echo "Backing up docker-compose files..."
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.phase3
fi
if [ -f "docker-compose.tcg.yml" ]; then
    cp docker-compose.tcg.yml docker-compose.tcg.yml.backup.phase3
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

echo "Moving TCG modules..."

# Move Commander Spellbook (backend)
safe_move "features/commander-spellbook-backend" "modules/tcg/commander-spellbook"

# If there's a separate frontend, move it into commander-spellbook
if [ -d "features/commander-spellbook-site" ]; then
    echo "  Moving commander-spellbook-site -> modules/tcg/commander-spellbook/client"
    if [ -d "modules/tcg/commander-spellbook" ]; then
        mv "features/commander-spellbook-site" "modules/tcg/commander-spellbook/client"
    else
        # If backend wasn't found, create the directory structure
        mkdir -p "modules/tcg/commander-spellbook"
        mv "features/commander-spellbook-site" "modules/tcg/commander-spellbook/client"
    fi
fi

# Move MTG Commander Map
safe_move "features/mtg-commander-map" "modules/tcg/commander-map"

# Move MTG Scripting Toolkit
safe_move "features/mtg-scripting-toolkit" "modules/tcg/scripting-toolkit"

# Create docker-compose.tcg.yml if it doesn't exist
if [ ! -f "docker-compose.tcg.yml" ]; then
    echo "Creating docker-compose.tcg.yml..."
    cat > docker-compose.tcg.yml << 'EOF'
# TCG Domain Services
# All Trading Card Game-focused modules and their dependencies

version: '3.8'

services:
  # ════════════════════════════════════════════════════════════════════════════════
  # Commander Spellbook - MTG Combo Database
  # ════════════════════════════════════════════════════════════════════════════════
  commander-spellbook-backend:
    build:
      context: ./modules/tcg/commander-spellbook
      dockerfile: Dockerfile
    container_name: commander-spellbook-backend
    ports:
      - "8010:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=spellbook.settings.production
      - DATABASE_URL=postgresql://spellbook:spellbook@spellbook-db:5432/spellbook
    volumes:
      - spellbook-media:/app/media
      - spellbook-static:/app/static
    depends_on:
      - spellbook-db
    networks:
      - tcg-network

  commander-spellbook-client:
    build:
      context: ./modules/tcg/commander-spellbook/client
      dockerfile: Dockerfile
    container_name: commander-spellbook-client
    ports:
      - "3010:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://commander-spellbook-backend:8000
    depends_on:
      - commander-spellbook-backend
    networks:
      - tcg-network

  spellbook-db:
    image: postgres:15-alpine
    container_name: spellbook-db
    environment:
      - POSTGRES_DB=spellbook
      - POSTGRES_USER=spellbook
      - POSTGRES_PASSWORD=spellbook
    volumes:
      - spellbook-db-data:/var/lib/postgresql/data
    networks:
      - tcg-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Commander Map - MTG Commander Visualization
  # ════════════════════════════════════════════════════════════════════════════════
  commander-map:
    build:
      context: ./modules/tcg/commander-map
      dockerfile: Dockerfile
    container_name: commander-map
    ports:
      - "3011:3000"
    networks:
      - tcg-network

  # ════════════════════════════════════════════════════════════════════════════════
  # MTG Scripting Toolkit
  # ════════════════════════════════════════════════════════════════════════════════
  mtg-scripting-toolkit:
    build:
      context: ./modules/tcg/scripting-toolkit
      dockerfile: Dockerfile
    container_name: mtg-scripting-toolkit
    ports:
      - "3012:3000"
    networks:
      - tcg-network

volumes:
  spellbook-db-data:
  spellbook-media:
  spellbook-static:

networks:
  tcg-network:
    driver: bridge
EOF
fi

# Update path references in docker-compose files
echo "Updating docker-compose path references..."

# Create a temporary sed script for updates
cat > /tmp/update-tcg-paths.sed << 'EOF'
s|features/commander-spellbook-backend|modules/tcg/commander-spellbook|g
s|features/commander-spellbook-site|modules/tcg/commander-spellbook/client|g
s|features/mtg-commander-map|modules/tcg/commander-map|g
s|features/mtg-scripting-toolkit|modules/tcg/scripting-toolkit|g
EOF

# Update docker-compose files
if [ -f "docker-compose.yml" ]; then
    sed -i.bak -f /tmp/update-tcg-paths.sed docker-compose.yml
fi

if [ -f "docker-compose.tcg.yml" ]; then
    sed -i.bak -f /tmp/update-tcg-paths.sed docker-compose.tcg.yml
fi

# Clean up
rm /tmp/update-tcg-paths.sed

# Create a migration log
cat > modules/tcg/MIGRATION.md << 'EOF'
# TCG Domain Migration Log

## Phase 3: Completed

### Migrated Modules

- ✓ Commander Spellbook (from features/commander-spellbook-backend + features/commander-spellbook-site)
- ✓ Commander Map (from features/mtg-commander-map)
- ✓ MTG Scripting Toolkit (from features/mtg-scripting-toolkit)

### Updated Files

- ✓ docker-compose.yml (path references updated)
- ✓ docker-compose.tcg.yml (created/updated)

### Backups Created

- docker-compose.yml.backup.phase3
- docker-compose.tcg.yml.backup.phase3

## Testing

Before committing, verify:

```bash
# Test TCG domain services can build
docker-compose -f docker-compose.tcg.yml build

# Test TCG domain services can start
docker-compose -f docker-compose.tcg.yml up -d

# Check service health
docker-compose -f docker-compose.tcg.yml ps
```

## Rollback

If issues occur, rollback with:

```bash
git restore modules/tcg/
mv docker-compose.yml.backup.phase3 docker-compose.yml
mv docker-compose.tcg.yml.backup.phase3 docker-compose.tcg.yml
```
EOF

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 3 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Migrated modules to modules/tcg/:"
echo "  - commander-spellbook (backend + client)"
echo "  - commander-map"
echo "  - scripting-toolkit"
echo ""
echo "Updated files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.tcg.yml"
echo ""
echo "Backups created:"
echo "  - docker-compose.yml.backup.phase3"
echo "  - docker-compose.tcg.yml.backup.phase3"
echo ""
echo "Next step: Run phase4-move-productivity-domain.sh"
echo ""
