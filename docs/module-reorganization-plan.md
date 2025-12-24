# Module Reorganization Plan

## Overview
Reorganizing the `modules/` directory to follow Domain-Driven Design (DDD) principles, similar to the nemesis project structure.

## Target Structure

```
modules/
├── ai/
│   ├── libs/              # Shared AI libraries
│   │   ├── analytics/
│   │   ├── chroma-mcp/
│   │   └── filescope-mcp/
│   ├── projects/          # AI services/applications
│   │   ├── goose/
│   │   ├── NVIDIA/
│   │   ├── firecrawl/
│   │   ├── inspector/
│   │   ├── kasmvnc/
│   │   └── firecrawl-mcp/
│   ├── infra/             # AI infrastructure
│   │   ├── docker-compose.ai.yml
│   │   ├── nuq-postgres/
│   │   └── playwright-service/
│   ├── docs/              # AI documentation
│   │   └── MIGRATION.md
│   ├── tools/             # AI utilities
│   └── README.md
│
├── security/
│   ├── libs/              # Shared security libraries
│   ├── projects/          # Security services/applications
│   │   ├── nemesis/
│   │   ├── rita/
│   │   ├── helk/
│   │   ├── vscode/
│   │   ├── misp/
│   │   ├── yara-x/
│   │   ├── ghostwriter/
│   │   ├── maltrail/
│   │   ├── dispatch/
│   │   ├── cyberchef/
│   │   └── blackarch/
│   ├── infra/             # Security infrastructure
│   │   └── docker-compose.security.yml
│   ├── docs/
│   │   └── MIGRATION.md
│   ├── tools/
│   └── README.md
│
├── productivity/
│   ├── libs/              # Shared productivity libraries
│   ├── projects/          # Productivity applications
│   │   ├── actual/
│   │   └── mealie/
│   ├── infra/
│   │   ├── infrastructure/
│   │   └── docker-compose.productivity.yml
│   ├── docs/
│   │   └── MIGRATION.md
│   ├── tools/
│   └── README.md
│
├── tcg/
│   ├── libs/              # Shared TCG libraries
│   ├── projects/          # TCG services
│   │   ├── commander-map/
│   │   ├── commander-spellbook/
│   │   └── scripting-toolkit/
│   ├── infra/
│   │   └── docker-compose.tcg.yml
│   ├── docs/
│   │   └── MIGRATION.md
│   ├── tools/
│   └── README.md
│
└── workflow/
    ├── libs/              # Shared workflow libraries
    ├── projects/          # Workflow services
    │   ├── n8n/
    │   └── n8n-mcp/
    ├── infra/
    │   └── docker-compose.workflow.yml
    ├── docs/
    │   └── MIGRATION.md
    ├── tools/
    └── README.md
```

## Classification Logic

### libs/
- Shared libraries used across multiple projects in the domain
- Common utilities and SDKs
- MCP (Model Context Protocol) libraries
- Examples: `analytics`, `chroma-mcp`, `filescope-mcp`

### projects/
- Standalone services and applications
- External integrations (full repos)
- Domain-specific tools
- Examples: `goose`, `nemesis`, `n8n`, `actual`

### infra/
- Docker compose files
- Kubernetes configurations
- Infrastructure-as-code
- Database setup scripts
- Examples: `docker-compose.*.yml`, `nuq-postgres`, `infrastructure/`

### docs/
- Domain-specific documentation
- Migration guides
- Architecture diagrams
- API documentation
- Examples: `MIGRATION.md`, usage guides

### tools/
- Domain-specific scripts
- Development utilities
- Testing tools
- Deployment helpers

## Migration Strategy

### Phase 1: Prepare
1. Create backup of current modules/ directory
2. Review current structure and dependencies
3. Create new directory structure

### Phase 2: Reorganize
1. For each domain (ai, security, productivity, tcg, workflow):
   - Create: libs/, projects/, infra/, docs/, tools/
   - Move items based on classification
   - Update domain README

### Phase 3: Update References
1. Update import paths in application code
2. Update Docker compose references
3. Update documentation links
4. Update CI/CD configurations

### Phase 4: Validate
1. Run cleanup script to verify disk space
2. Test NX workspace detection
3. Verify Docker compose files work
4. Test build processes

### Phase 5: Document
1. Update root README with new structure
2. Create domain-specific READMEs
3. Update integration documentation

## Benefits

1. **Clear Separation of Concerns**
   - Libraries vs Applications clearly distinguished
   - Infrastructure separated from code

2. **Better Discoverability**
   - Consistent structure across all domains
   - Easy to find related components

3. **Improved Maintainability**
   - Similar to nemesis project (familiar pattern)
   - Standard organization reduces cognitive load

4. **Scalability**
   - Easy to add new projects within domains
   - Clear place for domain-specific tooling

5. **DDD Alignment**
   - Each domain is self-contained
   - Bounded contexts are clear
   - Shared kernel in libs/

## Execution

Run the reorganization script:
```bash
./scripts/reorganize-modules.sh
```

This will:
- Create a timestamped backup
- Move all items to appropriate subdirectories
- Create domain READMEs
- Preserve existing documentation

## Rollback Plan

If issues occur, restore from backup:
```bash
rm -rf /workspaces/expert-dollop/modules
mv /workspaces/expert-dollop/modules_backup_* /workspaces/expert-dollop/modules
```
