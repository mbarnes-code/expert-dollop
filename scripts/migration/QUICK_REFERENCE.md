# Migration Quick Reference

## One-Command Migration

```bash
./scripts/migration/migrate-all.sh
```

## Phase-by-Phase Migration

```bash
# Phase 1: Create Domain Structure
./scripts/migration/phase1-create-domain-structure.sh

# Phase 2: Move Security Domain
./scripts/migration/phase2-move-security-domain.sh

# Phase 3: Move TCG Domain
./scripts/migration/phase3-move-tcg-domain.sh

# Phase 4: Move Productivity Domain
./scripts/migration/phase4-move-productivity-domain.sh

# Phase 5: Move Workflow Domain
./scripts/migration/phase5-move-workflow-domain.sh

# Phase 6: Move AI Domain
./scripts/migration/phase6-move-ai-domain.sh
```

## Rollback

```bash
./scripts/migration/rollback.sh
```

## Testing Commands

```bash
# Security Domain
docker-compose -f docker-compose.security.yml build
docker-compose -f docker-compose.security.yml up -d

# TCG Domain
docker-compose -f docker-compose.tcg.yml build
docker-compose -f docker-compose.tcg.yml up -d

# Productivity Domain
docker-compose -f docker-compose.productivity.yml build
docker-compose -f docker-compose.productivity.yml up -d

# Workflow Domain
docker-compose -f docker-compose.workflow.yml build
docker-compose -f docker-compose.workflow.yml up -d

# AI Domain
docker-compose -f docker-compose.ai.yml build
docker-compose -f docker-compose.ai.yml up -d
```

## Pre-Migration Checklist

- [ ] `git add -A && git commit -m "Pre-migration commit"`
- [ ] `git checkout -b backup/pre-migration`
- [ ] `git checkout main` (or your working branch)
- [ ] Read [README.md](./README.md)
- [ ] Review [file-directory-layout.md](../../docs/ideal/file-directory-layout.md)

## Post-Migration Tasks

1. Test all domains (see Testing Commands above)
2. Update CI/CD workflows in `.github/workflows/`
3. Update infrastructure references
4. Commit: `git add -A && git commit -m "feat: Migrate to domain-based modules"`
5. Clean up backups: `rm docker-compose.*.backup.phase*`
