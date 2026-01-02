# Infrastructure Hoisting Tasks

This document contains atomic-level tasks to hoist shared infrastructure from `modules/ai/` to the root `infrastructure/` directory.

## Overview

The `modules/ai/infrastructure/` directory contains documentation for six technology stacks:
1. **golang** - Go-based services (html-to-md-service)
2. **nodejs-typescript** - Node.js/TypeScript services (analytics, MCP servers, firecrawl, etc.)
3. **postgresql** - PostgreSQL configurations (nuq-postgres extension, various databases)
4. **python** - Python services (chroma-mcp, NVIDIA NeMo, examples)
5. **redis** - Redis configurations (job queues, caching)
6. **rust** - Rust projects (goose workspace)

## Task Categories

### A. Documentation Tasks
### B. PostgreSQL Infrastructure Tasks
### C. Golang Infrastructure Tasks
### D. Python Infrastructure Tasks
### E. Node.js/TypeScript Infrastructure Tasks
### F. Rust Infrastructure Tasks
### G. Redis Infrastructure Tasks (Already exists - update only)

---

## A. Documentation Tasks

### A1. Create golang infrastructure documentation directory
**Action:** Create `/infrastructure/golang/` directory

### A2. Move golang infrastructure README
**Action:** Copy `/modules/ai/infrastructure/golang/README.md` to `/infrastructure/golang/README.md`

### A3. Create python infrastructure documentation directory
**Action:** Create `/infrastructure/python/` directory

### A4. Move python infrastructure README
**Action:** Copy `/modules/ai/infrastructure/python/README.md` to `/infrastructure/python/README.md`

### A5. Create rust infrastructure documentation directory
**Action:** Create `/infrastructure/rust/` directory

### A6. Move rust infrastructure README
**Action:** Copy `/modules/ai/infrastructure/rust/README.md` to `/infrastructure/rust/README.md`

### A7. Create nodejs-typescript infrastructure documentation directory
**Action:** Create `/infrastructure/nodejs-typescript/` directory

### A8. Move nodejs-typescript infrastructure README
**Action:** Copy `/modules/ai/infrastructure/nodejs-typescript/README.md` to `/infrastructure/nodejs-typescript/README.md`

### A9. Update postgres infrastructure README with AI module content
**Action:** Append content from `/modules/ai/infrastructure/postgresql/README.md` to `/infrastructure/postgres/README.md`

### A10. Update redis infrastructure README with AI module content
**Action:** Append content from `/modules/ai/infrastructure/redis/README.md` to `/infrastructure/redis/README.md`

---

## B. PostgreSQL Infrastructure Tasks

### B1. Create nuq-postgres directory in infrastructure
**Action:** Create `/infrastructure/postgres/nuq-postgres/` directory

### B2. Move nuq-postgres Dockerfile
**Action:** Move `/modules/ai/nuq-postgres/Dockerfile` to `/infrastructure/postgres/nuq-postgres/Dockerfile`

### B3. Move nuq-postgres SQL initialization script
**Action:** Move `/modules/ai/nuq-postgres/nuq.sql` to `/infrastructure/postgres/nuq-postgres/nuq.sql`

### B4. Move nuq-postgres README
**Action:** Move `/modules/ai/nuq-postgres/README.md` to `/infrastructure/postgres/nuq-postgres/README.md`

### B5. Create postgres templates directory
**Action:** Create `/infrastructure/postgres/templates/` directory

### B6. Create postgres initialization script template
**Action:** Create `/infrastructure/postgres/templates/init-template.sql` from common patterns in AI module

### B7. Create postgres docker-compose template
**Action:** Create `/infrastructure/postgres/templates/docker-compose.yml` from common patterns in AI module

### B8. Create postgres configuration template
**Action:** Create `/infrastructure/postgres/templates/postgresql.conf` from common patterns in AI module

---

## C. Golang Infrastructure Tasks

### C1. Create golang templates directory
**Action:** Create `/infrastructure/golang/templates/` directory

### C2. Create golang Dockerfile template
**Action:** Create `/infrastructure/golang/templates/Dockerfile.template` from html-to-md-service pattern

### C3. Create golang Makefile template
**Action:** Create `/infrastructure/golang/templates/Makefile.template` from html-to-md-service pattern

### C4. Create golang docker-compose template
**Action:** Create `/infrastructure/golang/templates/docker-compose.yml.template` from html-to-md-service

### C5. Create golang go.mod template
**Action:** Create `/infrastructure/golang/templates/go.mod.template` with standard structure

### C6. Create golang requests.http template
**Action:** Create `/infrastructure/golang/templates/requests.http.template` for API testing

### C7. Create golang .gitignore template
**Action:** Create `/infrastructure/golang/templates/.gitignore` with Go-specific ignores

### C8. Create golang project structure guide
**Action:** Create `/infrastructure/golang/PROJECT_STRUCTURE.md` documenting standard layout

---

## D. Python Infrastructure Tasks

### D1. Create python templates directory
**Action:** Create `/infrastructure/python/templates/` directory

### D2. Create python pyproject.toml template
**Action:** Create `/infrastructure/python/templates/pyproject.toml.template` from chroma-mcp pattern

### D3. Create python requirements.txt template
**Action:** Create `/infrastructure/python/templates/requirements.txt.template` from NVIDIA examples

### D4. Create python Dockerfile template
**Action:** Create `/infrastructure/python/templates/Dockerfile.template` from common AI module patterns

### D5. Create python .python-version template
**Action:** Create `/infrastructure/python/templates/.python-version.template` with Python 3.10+

### D6. Create python pytest configuration template
**Action:** Create `/infrastructure/python/templates/pytest.ini.template` from chroma-mcp

### D7. Create python .gitignore template
**Action:** Create `/infrastructure/python/templates/.gitignore` with Python-specific ignores

### D8. Create python uv.lock guidance document
**Action:** Create `/infrastructure/python/UV_PACKAGE_MANAGER.md` with uv best practices

### D9. Create python project structure guide
**Action:** Create `/infrastructure/python/PROJECT_STRUCTURE.md` documenting standard layout

---

## E. Node.js/TypeScript Infrastructure Tasks

### E1. Create nodejs-typescript templates directory
**Action:** Create `/infrastructure/nodejs-typescript/templates/` directory

### E2. Create nodejs-typescript package.json template
**Action:** Create `/infrastructure/nodejs-typescript/templates/package.json.template` from common patterns

### E3. Create nodejs-typescript tsconfig.json template
**Action:** Create `/infrastructure/nodejs-typescript/templates/tsconfig.json.template` from common patterns

### E4. Create nodejs-typescript Dockerfile template
**Action:** Create `/infrastructure/nodejs-typescript/templates/Dockerfile.template` from firecrawl-mcp

### E5. Create nodejs-typescript docker-compose template
**Action:** Create `/infrastructure/nodejs-typescript/templates/docker-compose.yml.template`

### E6. Create nodejs-typescript Next.js configuration template
**Action:** Create `/infrastructure/nodejs-typescript/templates/next.config.mjs.template` from analytics

### E7. Create nodejs-typescript vitest configuration template
**Action:** Create `/infrastructure/nodejs-typescript/templates/vitest.config.ts.template` from filescope-mcp

### E8. Create nodejs-typescript jest configuration template
**Action:** Create `/infrastructure/nodejs-typescript/templates/jest.config.js.template` from firecrawl-mcp

### E9. Create nodejs-typescript ESLint configuration template
**Action:** Create `/infrastructure/nodejs-typescript/templates/.eslintrc.json.template` from firecrawl-mcp

### E10. Create nodejs-typescript Prettier configuration template
**Action:** Create `/infrastructure/nodejs-typescript/templates/.prettierrc.template` from firecrawl-mcp

### E11. Create nodejs-typescript .gitignore template
**Action:** Create `/infrastructure/nodejs-typescript/templates/.gitignore` with Node.js-specific ignores

### E12. Create nodejs-typescript MCP server template
**Action:** Create `/infrastructure/nodejs-typescript/templates/mcp-server-template/` structure

### E13. Create nodejs-typescript Express service template
**Action:** Create `/infrastructure/nodejs-typescript/templates/express-service-template/` structure

### E14. Create nodejs-typescript project structure guide
**Action:** Create `/infrastructure/nodejs-typescript/PROJECT_STRUCTURE.md` documenting standard layout

---

## F. Rust Infrastructure Tasks

### F1. Create rust templates directory
**Action:** Create `/infrastructure/rust/templates/` directory

### F2. Create rust workspace Cargo.toml template
**Action:** Create `/infrastructure/rust/templates/Cargo.workspace.toml.template` from goose pattern

### F3. Create rust crate Cargo.toml template
**Action:** Create `/infrastructure/rust/templates/Cargo.crate.toml.template` from goose crates

### F4. Create rust rust-toolchain.toml template
**Action:** Create `/infrastructure/rust/templates/rust-toolchain.toml.template` from goose

### F5. Create rust Cross.toml template
**Action:** Create `/infrastructure/rust/templates/Cross.toml.template` for cross-compilation

### F6. Create rust Justfile template
**Action:** Create `/infrastructure/rust/templates/Justfile.template` from goose pattern

### F7. Create rust Dockerfile template
**Action:** Create `/infrastructure/rust/templates/Dockerfile.template` from goose pattern

### F8. Create rust .dockerignore template
**Action:** Create `/infrastructure/rust/templates/.dockerignore.template` from goose

### F9. Create rust .cargo/config.toml template
**Action:** Create `/infrastructure/rust/templates/.cargo/config.toml.template` from goose

### F10. Create rust .gitignore template
**Action:** Create `/infrastructure/rust/templates/.gitignore` with Rust-specific ignores

### F11. Create rust clippy configuration guide
**Action:** Create `/infrastructure/rust/CLIPPY_CONFIGURATION.md` documenting lint baselines

### F12. Create rust project structure guide
**Action:** Create `/infrastructure/rust/PROJECT_STRUCTURE.md` documenting standard workspace layout

---

## G. Redis Infrastructure Tasks (Updates to existing)

### G1. Add AI module Redis usage patterns to documentation
**Action:** Update `/infrastructure/redis/README.md` with firecrawl BullMQ patterns

### G2. Document Redis database allocation for AI services
**Action:** Add AI-specific database allocations to `/infrastructure/redis/README.md`

### G3. Create Redis BullMQ configuration template
**Action:** Create `/infrastructure/redis/templates/bullmq-config.ts.template` for job queues

### G4. Document Redis caching strategies for AI workloads
**Action:** Add caching patterns section to `/infrastructure/redis/README.md`

---

## H. Integration and Cleanup Tasks

### H1. Update root infrastructure README with new language stacks
**Action:** Add golang, python, rust, nodejs-typescript sections to `/infrastructure/README.md`

### H2. Create infrastructure cross-reference index
**Action:** Create `/infrastructure/INDEX.md` mapping projects to infrastructure components

### H3. Create infrastructure migration guide
**Action:** Create `/infrastructure/MIGRATION_GUIDE.md` for moving projects to use shared infrastructure

### H4. Archive AI module infrastructure documentation
**Action:** Add deprecation notice to `/modules/ai/infrastructure/*/README.md` files

### H5. Update modules/ai README with infrastructure references
**Action:** Update `/modules/ai/README.md` to point to root infrastructure directory

### H6. Create infrastructure validation script
**Action:** Create `/infrastructure/scripts/validate-structure.sh` to check template usage

### H7. Create infrastructure project generator script
**Action:** Create `/infrastructure/scripts/generate-project.sh` for scaffolding new projects

### H8. Document Docker build patterns across all stacks
**Action:** Create `/infrastructure/DOCKER_PATTERNS.md` consolidating multi-stage builds

### H9. Create infrastructure testing guide
**Action:** Create `/infrastructure/TESTING_GUIDE.md` with patterns from all stacks

### H10. Update workspace-level documentation
**Action:** Update root `README.md` with infrastructure directory structure

---

## Task Execution Order

**Phase 1: Documentation Structure (A1-A10)**
- Create directories and move/update READMEs
- Establishes foundation for other tasks

**Phase 2: PostgreSQL (B1-B8)**
- Move nuq-postgres extension
- Create postgres templates

**Phase 3: Language-Specific Templates (C1-C8, D1-D9, E1-E14, F1-F12)**
- Create template directories and files for each stack
- Can be done in parallel by language

**Phase 4: Redis Updates (G1-G4)**
- Update existing Redis infrastructure with AI patterns

**Phase 5: Integration & Cleanup (H1-H10)**
- Update cross-references
- Create migration tools
- Documentation updates

---

## Success Criteria

- [ ] All infrastructure documentation consolidated in `/infrastructure/`
- [ ] All language stacks have template directories with standard configurations
- [ ] PostgreSQL nuq extension moved to shared infrastructure
- [ ] Redis documentation updated with AI module patterns
- [ ] Migration guide created for projects using shared infrastructure
- [ ] Cross-reference index created mapping projects to infrastructure
- [ ] Validation scripts created for infrastructure compliance
- [ ] Root README updated with complete infrastructure overview

---

## Notes

- All "move" tasks should preserve git history where possible (use `git mv`)
- All "copy" tasks are for documentation that needs to be merged/consolidated
- Templates should be generic with `{{PLACEHOLDER}}` syntax for project-specific values
- Each language stack should have a PROJECT_STRUCTURE.md documenting conventions
- Existing infrastructure (postgres, redis) should be enhanced, not replaced
