# Migration Scripts Index

## 📋 Complete File List

### Executable Scripts (9 files)
1. `migrate-all.sh` - Master orchestration script (runs all phases)
2. `phase1-create-domain-structure.sh` - Creates modules/ and libs/ structure
3. `phase2-move-security-domain.sh` - Migrates security domain
4. `phase3-move-tcg-domain.sh` - Migrates TCG domain
5. `phase4-move-productivity-domain.sh` - Migrates productivity domain
6. `phase5-move-workflow-domain.sh` - Migrates workflow domain
7. `phase6-move-ai-domain.sh` - Migrates AI/ML domain
8. `rollback.sh` - Complete migration rollback
9. `validate.sh` - Post-migration validation checker

### Documentation (3 files)
1. `README.md` - Comprehensive migration guide (16 KB)
2. `QUICK_REFERENCE.md` - Quick command reference (4 KB)
3. `MIGRATION_SUMMARY.md` - Implementation summary (12 KB)

## 🚀 Quick Start

```bash
# One command to migrate everything
./scripts/migration/migrate-all.sh

# Validate the migration
./scripts/migration/validate.sh
```

## 📊 Migration Scope

### Total Modules to Migrate: 28

#### Security Domain (11 modules)
- Ghostwriter
- Nemesis
- MISP
- Dispatch
- YARA-X
- Maltrail
- RITA
- HELK
- CyberChef
- MalwareBazaar MCP
- VirusTotal MCP

#### TCG Domain (3 modules)
- Commander Spellbook (backend + frontend)
- Commander Map
- MTG Scripting Toolkit

#### Productivity Domain (3 modules)
- Mealie
- Actual Budget
- IT Tools

#### Workflow Domain (2 modules)
- n8n
- n8n MCP Server

#### AI Domain (9 modules)
- Firecrawl (API + UI)
- Firecrawl MCP Server
- Goose
- Chroma MCP
- FileScope MCP
- MCP Inspector
- Analytics
- Playwright Service
- HTML to Markdown Service
- PostgreSQL for AI
- KasmVNC

## 📁 Files Created During Migration

### Domain README Files (5 files)
- `modules/security/README.md`
- `modules/tcg/README.md`
- `modules/productivity/README.md`
- `modules/workflow/README.md`
- `modules/ai/README.md`

### Library README Files (5 files)
- `libs/README.md`
- `libs/typescript/README.md`
- `libs/python/README.md`
- `libs/rust/README.md`
- `libs/go/README.md`

### Docker Compose Files (5 files)
- `docker-compose.security.yml`
- `docker-compose.tcg.yml`
- `docker-compose.productivity.yml`
- `docker-compose.workflow.yml`
- `docker-compose.ai.yml`

### Migration Logs (6 files)
- `modules/security/MIGRATION.md`
- `modules/tcg/MIGRATION.md`
- `modules/productivity/MIGRATION.md`
- `modules/workflow/MIGRATION.md`
- `modules/ai/MIGRATION.md`
- `migration-YYYYMMDD-HHMMSS.log` (timestamped)

### Backup Files (12 files)
- `docker-compose.yml.backup.phase2`
- `docker-compose.yml.backup.phase3`
- `docker-compose.yml.backup.phase4`
- `docker-compose.yml.backup.phase5`
- `docker-compose.yml.backup.phase6`
- `docker-compose.security.yml.backup.phase2`
- `docker-compose.tcg.yml.backup.phase3`
- `docker-compose.productivity.yml.backup.phase4`
- `docker-compose.workflow.yml.backup.phase5`
- `docker-compose.ai.yml.backup.phase6`

## 🎯 What Each Script Does

### Phase 1: Domain Structure
**Creates:**
- `modules/{security,tcg,productivity,workflow,ai}/` directories
- `libs/{typescript,python,rust,go}/` directories
- README files for domains and libraries
- .gitkeep files for empty directories

**Runtime:** ~1 second

### Phase 2: Security Domain
**Moves:**
- 11 modules from `features/security/` to `modules/security/`

**Creates/Updates:**
- `docker-compose.security.yml`
- `modules/security/MIGRATION.md`

**Backups:**
- `docker-compose.yml.backup.phase2`
- `docker-compose.security.yml.backup.phase2`

**Runtime:** ~5-10 seconds

### Phase 3: TCG Domain
**Moves:**
- 3 modules from `features/` to `modules/tcg/`
- Consolidates Commander Spellbook frontend into backend directory

**Creates/Updates:**
- `docker-compose.tcg.yml`
- `modules/tcg/MIGRATION.md`

**Backups:**
- `docker-compose.yml.backup.phase3`
- `docker-compose.tcg.yml.backup.phase3`

**Runtime:** ~5 seconds

### Phase 4: Productivity Domain
**Moves:**
- 3 modules from `features/` to `modules/productivity/`

**Creates/Updates:**
- `docker-compose.productivity.yml`
- `modules/productivity/MIGRATION.md`

**Backups:**
- `docker-compose.yml.backup.phase4`
- `docker-compose.productivity.yml.backup.phase4`

**Runtime:** ~5 seconds

### Phase 5: Workflow Domain
**Moves:**
- 2 modules from `features/AI core/` to `modules/workflow/`

**Creates/Updates:**
- `docker-compose.workflow.yml`
- `modules/workflow/MIGRATION.md`

**Backups:**
- `docker-compose.yml.backup.phase5`
- `docker-compose.workflow.yml.backup.phase5`

**Runtime:** ~5 seconds

### Phase 6: AI Domain
**Moves:**
- 11 modules from `features/AI core/` and `apps/ai/` to `modules/ai/`

**Creates/Updates:**
- `docker-compose.ai.yml`
- `modules/ai/MIGRATION.md`

**Backups:**
- `docker-compose.yml.backup.phase6`
- `docker-compose.ai.yml.backup.phase6`

**Runtime:** ~10-15 seconds

### Master Script (migrate-all.sh)
**Executes:**
- All phases 1-6 in sequence
- Creates timestamped log file
- Provides colored progress output
- Handles errors and provides rollback instructions

**Runtime:** ~30-45 seconds total

### Rollback Script
**Reverts:**
- Removes `modules/` and `libs/` directories
- Restores docker-compose files from backups
- Provides git restore instructions

**Runtime:** ~5 seconds

## 📖 Documentation Guide

### For Quick Start
→ Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### For Detailed Instructions
→ Read [README.md](./README.md)

### For Implementation Details
→ Read [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

### For Architecture Understanding
→ Read [../../docs/ideal/file-directory-layout.md](../../docs/ideal/file-directory-layout.md)

## ✅ Pre-Execution Checklist

- [ ] All changes committed to git
- [ ] Backup branch created (`git checkout -b backup/pre-migration`)
- [ ] Returned to working branch (`git checkout main`)
- [ ] Reviewed [README.md](./README.md)
- [ ] Reviewed [file-directory-layout.md](../../docs/ideal/file-directory-layout.md)
- [ ] Sufficient disk space available
- [ ] No running Docker containers that depend on current structure

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | `chmod +x scripts/migration/*.sh` |
| Module not found | Check alternative source locations in script |
| Docker build fails | Verify Dockerfile paths in docker-compose files |
| Merge conflicts | Use rollback, resolve conflicts, re-run migration |
| Git issues | Create backup branch first: `git checkout -b backup/pre-migration` |

## 📞 Support Resources

1. **Migration Logs**: Check `migration-YYYYMMDD-HHMMSS.log`
2. **Domain Logs**: Check `modules/{domain}/MIGRATION.md`
3. **Documentation**: See [README.md](./README.md)
4. **Architecture**: See [file-directory-layout.md](../../docs/ideal/file-directory-layout.md)

## 🎓 Learning Resources

### Understanding Domain-Driven Design
- Each `modules/{domain}/` is a bounded context
- Modules communicate via events, APIs, or GraphQL
- Shared code in `libs/` should be minimal
- Prefer duplication over premature abstraction

### Understanding the Migration
- Phase 1: Creates structure
- Phases 2-6: Move domain modules
- Each phase is independent and reversible
- Backups ensure safe migration

## 📈 Progress Tracking

After running `migrate-all.sh`, you'll see:

```
✓ Phase 1: Create Domain Structure
✓ Phase 2: Move Security Domain
✓ Phase 3: Move TCG Domain
✓ Phase 4: Move Productivity Domain
✓ Phase 5: Move Workflow Domain
✓ Phase 6: Move AI Domain
```

## 🎉 Success Criteria

Migration is successful when:
- [ ] All phases complete without errors
- [ ] `modules/` directory exists with 5 subdirectories
- [ ] `libs/` directory exists with 4 subdirectories
- [ ] All docker-compose.{domain}.yml files build successfully
- [ ] All services start without errors
- [ ] Backups exist for all modified files

## 🔄 Next Steps After Migration

1. Test all domains (see QUICK_REFERENCE.md)
2. Update CI/CD pipelines
3. Update infrastructure references
4. Extract shared libraries (Phase 7)
5. Commit migration
6. Clean up backups

---

**Ready to migrate?** Run: `./scripts/migration/migrate-all.sh`
