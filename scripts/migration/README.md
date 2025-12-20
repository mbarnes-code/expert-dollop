# Migration Scripts - Domain-Based Modular Monolith

This directory contains migration scripts to transform your codebase from the current structure to a domain-driven modular monolith architecture.

## Overview

The migration is divided into 6 phases that reorganize code by business domain:

1. **Phase 1**: Create domain structure (modules/ and libs/)
2. **Phase 2**: Move Security Domain
3. **Phase 3**: Move TCG Domain
4. **Phase 4**: Move Productivity Domain
5. **Phase 5**: Move Workflow Domain
6. **Phase 6**: Move AI Domain

## Quick Start

### Run All Phases at Once

```bash
# Make the script executable
chmod +x scripts/migration/migrate-all.sh

# Run the complete migration
./scripts/migration/migrate-all.sh
```

### Run Individual Phases

```bash
# Phase 1: Create domain structure
chmod +x scripts/migration/phase1-create-domain-structure.sh
./scripts/migration/phase1-create-domain-structure.sh

# Phase 2: Move security domain
chmod +x scripts/migration/phase2-move-security-domain.sh
./scripts/migration/phase2-move-security-domain.sh

# ... and so on for phases 3-6
```

## Pre-Migration Checklist

Before running the migration, ensure you:

- [ ] Have committed all current changes to git
- [ ] Created a backup branch: `git checkout -b backup/pre-migration`
- [ ] Returned to your working branch: `git checkout main` (or your target branch)
- [ ] Reviewed the [file-directory-layout.md](../../docs/ideal/file-directory-layout.md) document
- [ ] Have sufficient disk space (migration creates backups)

## Migration Phases

### Phase 1: Create Domain Structure

Creates the foundational directory structure:

```
modules/
├── security/
├── tcg/
├── productivity/
├── workflow/
└── ai/

libs/
├── typescript/
├── python/
├── rust/
└── go/
```

**What it does:**
- Creates `modules/` directory with 5 domain subdirectories
- Creates `libs/` directory for minimal shared code
- Generates README files for each domain
- Creates `.gitkeep` files to track empty directories

**Files created:**
- `modules/{domain}/README.md` - Domain documentation
- `libs/{language}/README.md` - Library documentation

### Phase 2: Move Security Domain

Migrates security-focused projects to `modules/security/`:

**Modules migrated:**
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

**What it does:**
- Moves modules from `features/security/` to `modules/security/`
- Creates/updates `docker-compose.security.yml`
- Updates path references in docker-compose files
- Creates migration log and backup files

**Backups created:**
- `docker-compose.yml.backup.phase2`
- `docker-compose.security.yml.backup.phase2`

### Phase 3: Move TCG Domain

Migrates Trading Card Game projects to `modules/tcg/`:

**Modules migrated:**
- Commander Spellbook (backend + frontend)
- MTG Commander Map
- MTG Scripting Toolkit

**What it does:**
- Moves modules from `features/` to `modules/tcg/`
- Consolidates Commander Spellbook backend and frontend
- Creates/updates `docker-compose.tcg.yml`
- Updates path references in docker-compose files

**Backups created:**
- `docker-compose.yml.backup.phase3`
- `docker-compose.tcg.yml.backup.phase3`

### Phase 4: Move Productivity Domain

Migrates productivity tools to `modules/productivity/`:

**Modules migrated:**
- Mealie (Recipe & Meal Planning)
- Actual Budget (Personal Finance)
- IT Tools (Developer Utilities)

**What it does:**
- Moves modules from `features/` to `modules/productivity/`
- Creates/updates `docker-compose.productivity.yml`
- Updates path references in docker-compose files

**Backups created:**
- `docker-compose.yml.backup.phase4`
- `docker-compose.productivity.yml.backup.phase4`

### Phase 5: Move Workflow Domain

Migrates workflow automation to `modules/workflow/`:

**Modules migrated:**
- n8n (Workflow Automation Platform)
- n8n MCP Server

**What it does:**
- Moves modules from `features/AI core/` or `apps/ai/` to `modules/workflow/`
- Creates/updates `docker-compose.workflow.yml`
- Updates path references in docker-compose files
- Includes RabbitMQ configuration for n8n workers

**Backups created:**
- `docker-compose.yml.backup.phase5`
- `docker-compose.workflow.yml.backup.phase5`

### Phase 6: Move AI Domain

Migrates AI/ML projects to `modules/ai/`:

**Modules migrated:**
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

**What it does:**
- Moves modules from `features/AI core/` and `apps/ai/` to `modules/ai/`
- Creates/updates `docker-compose.ai.yml`
- Updates path references in docker-compose files

**Backups created:**
- `docker-compose.yml.backup.phase6`
- `docker-compose.ai.yml.backup.phase6`

## Testing After Migration

After running the migration, test each domain:

```bash
# Test Security Domain
docker-compose -f docker-compose.security.yml build
docker-compose -f docker-compose.security.yml up -d
docker-compose -f docker-compose.security.yml ps

# Test TCG Domain
docker-compose -f docker-compose.tcg.yml build
docker-compose -f docker-compose.tcg.yml up -d
docker-compose -f docker-compose.tcg.yml ps

# Test Productivity Domain
docker-compose -f docker-compose.productivity.yml build
docker-compose -f docker-compose.productivity.yml up -d
docker-compose -f docker-compose.productivity.yml ps

# Test Workflow Domain
docker-compose -f docker-compose.workflow.yml build
docker-compose -f docker-compose.workflow.yml up -d
docker-compose -f docker-compose.workflow.yml ps

# Test AI Domain
docker-compose -f docker-compose.ai.yml build
docker-compose -f docker-compose.ai.yml up -d
docker-compose -f docker-compose.ai.yml ps
```

## Rollback

If something goes wrong, you can rollback the migration:

```bash
# Make the rollback script executable
chmod +x scripts/migration/rollback.sh

# Run the rollback
./scripts/migration/rollback.sh
```

The rollback script will:
1. Remove all `modules/` and `libs/` directories
2. Restore docker-compose files from backups
3. Provide instructions for restoring moved files with git

### Manual Rollback with Git

If you created a backup branch before migration:

```bash
# Switch to backup branch
git checkout backup/pre-migration

# Or restore specific directories
git restore features/
git restore apps/
```

## Post-Migration Tasks

After successfully migrating and testing:

1. **Update CI/CD Pipelines**
   - Update `.github/workflows/ci-security.yml` to reference `modules/security/`
   - Update `.github/workflows/ci-tcg.yml` to reference `modules/tcg/`
   - Update `.github/workflows/ci-productivity.yml` to reference `modules/productivity/`
   - Update `.github/workflows/ci-workflow.yml` to reference `modules/workflow/`
   - Update `.github/workflows/ci-ai.yml` to reference `modules/ai/`

2. **Update Infrastructure References**
   - Update `infrastructure/kong/kong.yml` to point to new module paths
   - Update `infrastructure/graphql-gateway/src/subgraphs/` references
   - Update `infrastructure/mcp-hub/src/servers/` references

3. **Extract Shared Libraries (Phase 7)**
   - Analyze code for truly shared utilities
   - Extract ONLY cross-domain code to `libs/`
   - Follow the principle: "Prefer duplication over premature abstraction"

4. **Clean Up Old Directories**
   - After verifying everything works, remove old directories:
     ```bash
     rm -rf features/
     rm -rf apps/  # if empty after migration
     ```

5. **Commit the Migration**
   ```bash
   git add -A
   git commit -m "feat: Migrate to domain-based modular monolith architecture"
   ```

6. **Clean Up Backup Files** (optional)
   ```bash
   rm docker-compose.*.backup.phase*
   ```

## Directory Structure After Migration

```
expert-dollop/
├── modules/                    # Domain-based modules (bounded contexts)
│   ├── security/              # Security domain
│   ├── tcg/                   # Trading Card Game domain
│   ├── productivity/          # Productivity domain
│   ├── workflow/              # Workflow automation domain
│   └── ai/                    # AI/ML domain
├── libs/                      # Minimal shared libraries
│   ├── typescript/
│   ├── python/
│   ├── rust/
│   └── go/
├── infrastructure/            # Cross-cutting infrastructure (unchanged)
├── docs/                      # Documentation (unchanged)
├── tests/                     # Integration & E2E tests (unchanged)
├── scripts/                   # Build & deployment scripts (unchanged)
└── omninexus/                 # Unified dashboard (unchanged)
```

## Dependency Rules

After migration, follow these rules:

### ✅ Allowed
- `modules/security/ghostwriter/` can use `libs/python/common`
- `modules/tcg/commander-spellbook/` can use `libs/typescript/ui-components`
- Modules can communicate via events, API calls, or GraphQL federation

### ❌ Not Allowed
- `modules/security/ghostwriter/` CANNOT import from `modules/tcg/`
- `modules/productivity/mealie/` CANNOT import from `modules/security/`
- Direct code imports between modules

## Troubleshooting

### Script Permission Errors

If you get "Permission denied" errors:
```bash
chmod +x scripts/migration/*.sh
```

### Path Not Found Errors

Some modules might be in different locations than expected. The scripts check multiple possible locations:
- `features/{module}`
- `features/AI core/{module}`
- `apps/ai/{module}`

If a module isn't found, the script will skip it with a warning.

### Docker Compose Build Errors

If docker-compose builds fail after migration:
1. Check the path references in `docker-compose.{domain}.yml`
2. Ensure the Dockerfile exists in the new location
3. Check the migration logs for any skipped modules

### Git Merge Conflicts

If you encounter merge conflicts after migration:
1. Use the rollback script
2. Resolve conflicts on the original structure
3. Re-run the migration

## Support

For issues or questions:
1. Check the migration logs in `migration-YYYYMMDD-HHMMSS.log`
2. Review the `MIGRATION.md` file in each `modules/{domain}/` directory
3. Consult the [file-directory-layout.md](../../docs/ideal/file-directory-layout.md) documentation

## Advanced Usage

### Dry Run (Preview Changes)

To see what would happen without actually moving files:
```bash
# Add 'echo' before 'mv' commands in the scripts
sed -i 's/mv /echo mv /g' scripts/migration/phase*.sh

# Run the migration
./scripts/migration/migrate-all.sh

# Restore the scripts
git restore scripts/migration/
```

### Custom Phase Order

You can run phases in a different order if needed:
```bash
# Example: Only migrate security and AI domains
./scripts/migration/phase1-create-domain-structure.sh
./scripts/migration/phase2-move-security-domain.sh
./scripts/migration/phase6-move-ai-domain.sh
```

### Selective Rollback

To rollback only specific phases, manually remove the domain directories and restore backups:
```bash
# Example: Rollback only Phase 6 (AI Domain)
rm -rf modules/ai/
mv docker-compose.yml.backup.phase6 docker-compose.yml
mv docker-compose.ai.yml.backup.phase6 docker-compose.ai.yml
```

## Benefits of This Migration

1. **Clear Bounded Contexts** - Each domain is explicit and independent
2. **Independent Development** - Teams can work on different domains without conflicts
3. **Scalable Architecture** - Scale modules independently based on load
4. **Technology Freedom** - Each module can use different tech stacks
5. **Easy Navigation** - Clear domain organization for developers
6. **Minimal Shared Code** - Reduces coupling between modules
7. **Infrastructure Flexibility** - Centralized cross-cutting concerns

## Next Steps

After completing Phases 1-6:
- **Phase 7**: Extract shared libraries (manual process)
- **Phase 8**: Update infrastructure references
- **Phase 9**: Update CI/CD pipelines
- **Phase 10**: Remove old directories

See [file-directory-layout.md](../../docs/ideal/file-directory-layout.md) Section 9 for details on Phases 7-10.
