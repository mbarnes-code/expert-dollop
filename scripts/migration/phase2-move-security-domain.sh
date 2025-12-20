#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Phase 2: Move Security Domain
# ════════════════════════════════════════════════════════════════════════════════
# Migrates all security-focused projects from features/security/ to modules/security/
# and updates docker-compose references
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 2: Moving Security Domain"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

cd "${ROOT_DIR}"

# Check if modules/security exists
if [ ! -d "modules/security" ]; then
    echo "Error: modules/security/ does not exist. Run phase1-create-domain-structure.sh first."
    exit 1
fi

# Backup docker-compose files
echo "Backing up docker-compose files..."
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.phase2
fi
if [ -f "docker-compose.security.yml" ]; then
    cp docker-compose.security.yml docker-compose.security.yml.backup.phase2
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

echo "Moving security modules..."

# Move Ghostwriter
safe_move "features/security/Ghostwriter" "modules/security/ghostwriter"

# Move Nemesis
safe_move "features/security/Nemesis" "modules/security/nemesis"

# Move MISP
safe_move "features/security/MISP" "modules/security/misp"

# Move Dispatch
safe_move "features/security/dispatch" "modules/security/dispatch"

# Move YARA-X
safe_move "features/security/yara-x" "modules/security/yara-x"

# Move Maltrail
safe_move "features/security/maltrail" "modules/security/maltrail"

# Move RITA
safe_move "features/security/rita" "modules/security/rita"

# Move HELK
safe_move "features/security/HELK" "modules/security/helk"

# Move CyberChef
safe_move "features/security/CyberChef" "modules/security/cyberchef"

# Move MalwareBazaar MCP
safe_move "features/security/MalwareBazaar_MCP" "modules/security/malwarebazaar-mcp"

# Move VirusTotal MCP
safe_move "features/security/mcp-virustotal" "modules/security/virustotal-mcp"

# Create docker-compose.security.yml if it doesn't exist
if [ ! -f "docker-compose.security.yml" ]; then
    echo "Creating docker-compose.security.yml..."
    cat > docker-compose.security.yml << 'EOF'
# Security Domain Services
# All security-focused modules and their dependencies

version: '3.8'

services:
  # ════════════════════════════════════════════════════════════════════════════════
  # Ghostwriter - Red Team C2 & Reporting
  # ════════════════════════════════════════════════════════════════════════════════
  ghostwriter:
    build:
      context: ./modules/security/ghostwriter
      dockerfile: Dockerfile
    container_name: ghostwriter
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
      - DATABASE_URL=postgresql://ghostwriter:ghostwriter@ghostwriter-db:5432/ghostwriter
    volumes:
      - ghostwriter-media:/app/media
      - ghostwriter-static:/app/static
    depends_on:
      - ghostwriter-db
    networks:
      - security-network

  ghostwriter-db:
    image: postgres:15-alpine
    container_name: ghostwriter-db
    environment:
      - POSTGRES_DB=ghostwriter
      - POSTGRES_USER=ghostwriter
      - POSTGRES_PASSWORD=ghostwriter
    volumes:
      - ghostwriter-db-data:/var/lib/postgresql/data
    networks:
      - security-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Nemesis - Offensive Security Platform
  # ════════════════════════════════════════════════════════════════════════════════
  nemesis-enrichment:
    build:
      context: ./modules/security/nemesis/projects/enrichment
      dockerfile: Dockerfile
    container_name: nemesis-enrichment
    environment:
      - POSTGRES_CONNECTION_URI=postgresql://nemesis:nemesis@nemesis-db:5432/nemesis
      - RABBITMQ_CONNECTION_URI=amqp://nemesis:nemesis@rabbitmq:5672
    depends_on:
      - nemesis-db
      - rabbitmq
    networks:
      - security-network

  nemesis-web-api:
    build:
      context: ./modules/security/nemesis/projects/web_api
      dockerfile: Dockerfile
    container_name: nemesis-web-api
    ports:
      - "8001:8000"
    environment:
      - POSTGRES_CONNECTION_URI=postgresql://nemesis:nemesis@nemesis-db:5432/nemesis
    depends_on:
      - nemesis-db
    networks:
      - security-network

  nemesis-db:
    image: postgres:15-alpine
    container_name: nemesis-db
    environment:
      - POSTGRES_DB=nemesis
      - POSTGRES_USER=nemesis
      - POSTGRES_PASSWORD=nemesis
    volumes:
      - nemesis-db-data:/var/lib/postgresql/data
    networks:
      - security-network

  # ════════════════════════════════════════════════════════════════════════════════
  # Dispatch - Incident Management
  # ════════════════════════════════════════════════════════════════════════════════
  dispatch:
    build:
      context: ./modules/security/dispatch
      dockerfile: Dockerfile
    container_name: dispatch
    ports:
      - "8002:8000"
    environment:
      - DATABASE_URL=postgresql://dispatch:dispatch@dispatch-db:5432/dispatch
    depends_on:
      - dispatch-db
    networks:
      - security-network

  dispatch-db:
    image: postgres:15-alpine
    container_name: dispatch-db
    environment:
      - POSTGRES_DB=dispatch
      - POSTGRES_USER=dispatch
      - POSTGRES_PASSWORD=dispatch
    volumes:
      - dispatch-db-data:/var/lib/postgresql/data
    networks:
      - security-network

  # ════════════════════════════════════════════════════════════════════════════════
  # MalwareBazaar MCP Server
  # ════════════════════════════════════════════════════════════════════════════════
  malwarebazaar-mcp:
    build:
      context: ./modules/security/malwarebazaar-mcp
      dockerfile: Dockerfile
    container_name: malwarebazaar-mcp
    ports:
      - "3100:3000"
    networks:
      - security-network

  # ════════════════════════════════════════════════════════════════════════════════
  # VirusTotal MCP Server
  # ════════════════════════════════════════════════════════════════════════════════
  virustotal-mcp:
    build:
      context: ./modules/security/virustotal-mcp
      dockerfile: Dockerfile
    container_name: virustotal-mcp
    ports:
      - "3101:3000"
    environment:
      - VIRUSTOTAL_API_KEY=${VIRUSTOTAL_API_KEY}
    networks:
      - security-network

volumes:
  ghostwriter-db-data:
  ghostwriter-media:
  ghostwriter-static:
  nemesis-db-data:
  dispatch-db-data:

networks:
  security-network:
    driver: bridge
EOF
fi

# Update path references in docker-compose files
echo "Updating docker-compose path references..."

# Create a temporary sed script for updates
cat > /tmp/update-security-paths.sed << 'EOF'
s|features/security/Ghostwriter|modules/security/ghostwriter|g
s|features/security/Nemesis|modules/security/nemesis|g
s|features/security/MISP|modules/security/misp|g
s|features/security/dispatch|modules/security/dispatch|g
s|features/security/yara-x|modules/security/yara-x|g
s|features/security/maltrail|modules/security/maltrail|g
s|features/security/rita|modules/security/rita|g
s|features/security/HELK|modules/security/helk|g
s|features/security/CyberChef|modules/security/cyberchef|g
s|features/security/MalwareBazaar_MCP|modules/security/malwarebazaar-mcp|g
s|features/security/mcp-virustotal|modules/security/virustotal-mcp|g
EOF

# Update docker-compose files
if [ -f "docker-compose.yml" ]; then
    sed -i.bak -f /tmp/update-security-paths.sed docker-compose.yml
fi

if [ -f "docker-compose.security.yml" ]; then
    sed -i.bak -f /tmp/update-security-paths.sed docker-compose.security.yml
fi

# Clean up
rm /tmp/update-security-paths.sed

# Create a migration log
cat > modules/security/MIGRATION.md << 'EOF'
# Security Domain Migration Log

## Phase 2: Completed

### Migrated Modules

- ✓ Ghostwriter (from features/security/Ghostwriter)
- ✓ Nemesis (from features/security/Nemesis)
- ✓ MISP (from features/security/MISP)
- ✓ Dispatch (from features/security/dispatch)
- ✓ YARA-X (from features/security/yara-x)
- ✓ Maltrail (from features/security/maltrail)
- ✓ RITA (from features/security/rita)
- ✓ HELK (from features/security/HELK)
- ✓ CyberChef (from features/security/CyberChef)
- ✓ MalwareBazaar MCP (from features/security/MalwareBazaar_MCP)
- ✓ VirusTotal MCP (from features/security/mcp-virustotal)

### Updated Files

- ✓ docker-compose.yml (path references updated)
- ✓ docker-compose.security.yml (created/updated)

### Backups Created

- docker-compose.yml.backup.phase2
- docker-compose.security.yml.backup.phase2

## Testing

Before committing, verify:

```bash
# Test security domain services can build
docker-compose -f docker-compose.security.yml build

# Test security domain services can start
docker-compose -f docker-compose.security.yml up -d

# Check service health
docker-compose -f docker-compose.security.yml ps
```

## Rollback

If issues occur, rollback with:

```bash
git restore modules/security/
mv docker-compose.yml.backup.phase2 docker-compose.yml
mv docker-compose.security.yml.backup.phase2 docker-compose.security.yml
```
EOF

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  Phase 2 Complete! ✓"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Migrated modules to modules/security/:"
echo "  - ghostwriter"
echo "  - nemesis"
echo "  - misp"
echo "  - dispatch"
echo "  - yara-x"
echo "  - maltrail"
echo "  - rita"
echo "  - helk"
echo "  - cyberchef"
echo "  - malwarebazaar-mcp"
echo "  - virustotal-mcp"
echo ""
echo "Updated files:"
echo "  - docker-compose.yml"
echo "  - docker-compose.security.yml"
echo ""
echo "Backups created:"
echo "  - docker-compose.yml.backup.phase2"
echo "  - docker-compose.security.yml.backup.phase2"
echo ""
echo "Next step: Run phase3-move-tcg-domain.sh"
echo ""
