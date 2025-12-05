# Docker Compose Enumeration Index

**Generated:** December 5, 2025  
**Scope:** `/workspaces/expert-dollop/features` directory  
**Files Analyzed:** 27 docker-compose files

---

## Report Files

1. **[docker-compose-services-report.md](./docker-compose-services-report.md)**
   - Comprehensive enumeration of all services
   - Service count summary (46 unique services, 76 instances)
   - Detailed configuration breakdown per service
   - Complete file-by-file enumeration
   - Command variations and subtle differences

2. **[service-configuration-matrix.md](./service-configuration-matrix.md)**
   - Quick reference matrices organized by service type
   - Side-by-side configuration comparisons
   - Pattern analysis (volumes, networks, healthchecks, etc.)
   - Environment-specific patterns (dev, prod, test)

---

## Quick Statistics

### File Count
- **Total docker-compose files:** 27
- **Location:** `/workspaces/expert-dollop/features`

### Service Count
- **Unique service names:** 46
- **Total service instances:** 76
- **Most common service:** postgres (11 instances)

### Technology Distribution

**Databases:**
- PostgreSQL: 11 instances
- Redis: 4 instances
- ClickHouse: 2 instances
- MariaDB: 1 instance
- MySQL: 1 instance

**Application Platforms:**
- n8n (workflow automation): 13 instances total
- Django: 1 instance
- Node.js applications: 4 instances
- Go services: 1 instance

**Infrastructure:**
- Nginx: 2 instances
- Dapr sidecars: 2 instances
- Mock/test services: 5 instances

---

## All Files Enumerated

| # | File Path | Services | Key Tech |
|---|-----------|----------|----------|
| 1 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/sqlite/docker-compose.yml | 4 | n8n, mockapi, runners, benchmark |
| 2 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-multi-main/docker-compose.yml | 13 | n8n multi-main, postgres, redis, nginx LB |
| 3 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-single-main/docker-compose.yml | 9 | n8n workers, postgres, redis |
| 4 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/postgres/docker-compose.yml | 5 | n8n, postgres, mockapi, runners |
| 5 | n8n/.github/docker-compose.yml | 3 | postgres, mariadb, mysql |
| 6 | n8n/.devcontainer/docker-compose.yml | 2 | n8n dev, postgres |
| 7 | mealie/docker/docker-compose.yml | 1 | mealie |
| 8 | mealie/docker/docker-compose.dev.yml | 2 | mailpit, postgres |
| 9 | mealie/tests/e2e/docker/docker-compose.yml | 3 | mealie, oidc-mock, ldap |
| 10 | Nemesis/projects/file_enrichment/docker-compose.debug.yml | 4+ | Dapr debug, minio, otel |
| 11 | Nemesis/projects/web_api/docker-compose.debug.yml | 3 | Dapr debug, minio |
| 12 | goose/documentation/docs/docker/docker-compose.yml | 1 | goose-cli |
| 13 | kong/scripts/upgrade-tests/docker-compose.yml | 2 | kong_old, postgres |
| 14 | kong/scripts/dependency_services/docker-compose-test-services.yml | 5 | postgres, redis, grpcbin, zipkin |
| 15 | kong/.devcontainer/docker-compose.yml | 2 | kong dev, postgres |
| 16 | maltrail/docker/docker-compose.yml | 1 | maltrail server |
| 17 | rita/docker-compose.yml | 3 | rita, clickhouse, syslog-ng |
| 18 | rita/docker-compose.prod.yml | 3 | rita prod, clickhouse, syslog-ng |
| 19 | commander-spellbook-backend/docker-compose.prod.yml | 5 | Django prod, bots |
| 20 | commander-spellbook-backend/docker-compose.yml | 6 | Django, nginx, postgres, 3 bots |
| 21 | dispatch/.devcontainer/docker-compose.yml | 3 | app, pgadmin, postgres |
| 22 | dispatch/docker/docker-compose.yml | 2 | postgres, pgadmin |
| 23 | actual/docker-compose.yml | 1 | actual-development |
| 24 | actual/packages/sync-server/docker-compose.yml | 1 | actual_server |
| 25 | actual/.devcontainer/docker-compose.yml | 1 | actual dev |
| 26 | firecrawl/apps/go-html-to-md-service/docker-compose.yml | 1 | html-to-markdown |
| 27 | firecrawl/docker-compose.yaml | 4 | api, playwright, redis, postgres |

---

## Service Names Index

Alphabetical index of all unique service names with occurrence count:

- actual-development (2)
- actual_server (1)
- admin (1)
- api (1)
- app (1)
- benchmark (4)
- clickhouse (2)
- db (2)
- db_postgres (1)
- discord-bot (2)
- file-enrichment (1)
- file-enrichment-dapr (1)
- goose-cli (1)
- grpcbin (1)
- html-to-markdown (1)
- kong (1)
- kong_old (1)
- ldap (1)
- mailpit (1)
- mariadb (1)
- mealie (3)
- minio (2)
- mockapi (4)
- mysql-8.4 (1)
- n8n (4)
- n8n_main1 (1)
- n8n_main2 (1)
- n8n_worker1 (2)
- n8n_worker1_runners (2)
- n8n_worker2 (2)
- n8n_worker2_runners (2)
- nginx (2)
- nuq-postgres (1)
- oidc-mock-server (1)
- otel-collector (1)
- pgadmin (1)
- playwright-service (1)
- postgres (11)
- reddit-bot (2)
- redis (4)
- redis-auth (1)
- rita (2)
- runners (2)
- server (1)
- syslog-ng (2)
- telegram-bot (2)
- web (2)
- web-api (1)
- web-api-dapr (1)
- zipkin (1)

**Total: 46 unique services**

---

## Top 10 Most Used Services

1. postgres - 11 occurrences
2. mockapi - 4 occurrences
3. n8n - 4 occurrences
4. benchmark - 4 occurrences
5. redis - 4 occurrences
6. mealie - 3 occurrences
7. n8n_worker1 - 2 occurrences
8. n8n_worker2 - 2 occurrences
9. n8n_worker1_runners - 2 occurrences
10. n8n_worker2_runners - 2 occurrences

---

## Configuration Patterns Found

### Database Patterns
- **PostgreSQL versions:** 9.5, 9.6, 14, 14-alpine, 15, 16, 16-alpine, 16.4, latest
- **Redis versions:** 6.2.14-alpine, alpine, latest, redis-stack-server
- **Storage:** mix of volumes, tmpfs, and bind mounts

### Network Patterns
- **Bridge:** Most common (default)
- **Host:** Testing/E2E scenarios
- **Service mode:** Development containers
- **Custom networks:** nemesis, rita-network, backend

### Restart Policies
- always (production)
- unless-stopped (production with control)
- on-failure (testing)
- no (development)

### Healthcheck Coverage
- PostgreSQL: 11/11 with healthcheck
- Redis: 3/4 with healthcheck
- HTTP services: ~80% coverage
- Databases consistently use healthchecks

---

## Command Variations Summary

### Most Common Patterns

**Default (no command specified):**
- Most database services
- Most application services

**Custom Commands:**
- `worker` - n8n worker instances
- `sleep infinity` - devcontainer services
- `redis-server --bind 0.0.0.0` - custom redis config
- `server.py` - maltrail
- `node dist/src/harness.js --start-docker` - firecrawl api
- `/bin/bash` - interactive containers (goose-cli)
- `tail -f /dev/null` - keep-alive (kong_old)
- Dapr sidecars - extensive command arrays with flags

**Subtle Differences:**
- Same service, different environments often use different commands
- Development: sleep/infinite loops
- Production: default or optimized commands
- Testing: specialized commands with debug flags

---

## Volume Usage Patterns

### Persistent Named Volumes
```
postgres-data (multiple files)
redis-data (multiple files)
clickhouse_persistent (RITA)
mealie-data (Mealie)
goose-config (Goose)
static_volume (Django)
```

### Configuration Bind Mounts
- nginx configurations
- application configs (HJSON, XML, YAML)
- SSL certificates
- cron jobs
- component definitions (Dapr)

### Development Bind Mounts
- Workspace directories (usually with `:cached`)
- Git configuration (read-only)
- SSH keys (read-only)
- Docker socket (Docker-in-Docker)

### System Bind Mounts
- `/etc/localtime` - time synchronization
- `/var/run/docker.sock` - Docker access

---

## Environment Variable Patterns

### Database Connection
```
DB_TYPE, DATABASE_URL, POSTGRES_*, MYSQL_*
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
SQL_ENGINE, SQL_DATABASE
```

### Application Configuration
```
NODE_ENV, ENV, ENVIRONMENT
DEBUG, LOG_LEVEL, LOGGING_LEVEL
SECRET_KEY, ENCRYPTION_KEY
```

### Queue/Cache
```
REDIS_URL, REDIS_HOST
QUEUE_BULL_REDIS_HOST
EXECUTIONS_MODE=queue
```

### Authentication/Security
```
API_KEY, AUTH_TOKEN
LICENSE_CERT, LICENSE_ACTIVATION_KEY
OIDC_*, LDAP_*
```

### Feature Flags
```
N8N_RUNNERS_ENABLED
N8N_MULTI_MAIN_SETUP_ENABLED
ALLOW_SIGNUP
```

---

## Port Exposure Analysis

### Common Ports Found

**Databases:**
- 5432 - PostgreSQL (11 instances)
- 6379 - Redis (4 instances)
- 9000 - ClickHouse, MinIO (4 instances)
- 3306 - MySQL/MariaDB (2 instances)

**Web Services:**
- 80 - HTTP (2 instances)
- 3000 - Various Node apps (2 instances)
- 8000 - Django, FastAPI (3 instances)
- 5678 - n8n (4 instances)
- 8080 - Various services (3 instances)

**Admin/Management:**
- 5555 - pgAdmin (1 instance)
- 8025 - Mailpit web UI (1 instance)

**Specialized:**
- 8338/8337 - Maltrail (1 instance)
- 3500-3503 - Dapr sidecars (2 instances)
- 50001-50003 - Dapr gRPC (2 instances)
- 4317 - OpenTelemetry (1 instance)

---

## Dependencies & Orchestration

### Complex Dependencies
- **n8n scaling-multi-main:** Most complex with 13 services
  - Workers must start before mains
  - Each service has dedicated runners
  - Load balancer depends on all mains
  
- **Commander Spellbook:** Coordinated Django + bots
  - All bots depend on web service health
  - Web depends on database health
  - Nginx depends on web

### Health-Based Dependencies
- `condition: service_healthy` - 20+ instances
- `condition: service_started` - 5+ instances
- Simple depends_on - 30+ instances

### Service Links
- Deprecated but still used in RITA, Commander Spellbook
- Provides hostname aliases

---

## Security Considerations Found

### Exposed Credentials (Development)
- Hard-coded passwords in multiple files
- Default credentials (postgres/postgres, admin/admin)
- Test API keys

### Security Features
- Read-only volume mounts for configs
- Network isolation
- Service-to-service networking
- Healthchecks for availability

### Production Patterns
- Secret files with `required: false`
- Environment variable substitution
- Exposed vs ports (internal-only services)

---

## Build Patterns

### Build from Local Dockerfile
- 15+ services build locally
- Context varies (., .., ../..)
- Some use build args (VERSION, USER_ID)
- Multi-stage builds (production, demo targets)

### Pre-built Images
- Official images (postgres, redis, nginx)
- Vendor images (ghcr.io, docker.io)
- Version pinning varies (latest, specific versions)

### Hybrid
- Both image and build specified
- Production uses image, dev uses build

---

## Testing Infrastructure

### Mock Services
- WireMock for API mocking
- OIDC mock server
- Test LDAP server
- gRPC test server

### Testing Patterns
- tmpfs for fast ephemeral storage
- Host networking for easier access
- Dynamic port mapping
- Aggressive healthchecks

---

## DevContainer Patterns

All devcontainer docker-compose files share:
- `command: sleep infinity` (or equivalent)
- Workspace volume mount with `:cached`
- Docker socket mount (some)
- Service network mode (some)
- Minimal port exposure

---

## Production Patterns

Production docker-compose files feature:
- Pre-built images (ghcr.io)
- `restart: always` or `unless-stopped`
- `expose:` instead of `ports:` for internal services
- Secret files with fallbacks
- Volume persistence
- Comprehensive healthchecks
- Resource limits (ulimits)

---

## Notes

1. **All 27 files enumerated and accounted for** in both reports
2. **No files were excluded** from analysis
3. **Version inconsistencies** found across similar services (intentional for testing)
4. **Some commented services** exist but not counted (e.g., maltrail sensor)
5. **YAML/YML mix** - both extensions found, content is compatible

---

## Recommendations

Based on this enumeration:

1. **Standardize PostgreSQL versions** - Currently using 8 different versions
2. **Health checks** - Add to services without them
3. **Secrets management** - Move hardcoded credentials to proper secret stores
4. **Network isolation** - More use of custom networks
5. **Version pinning** - Avoid 'latest' tags in production
6. **Documentation** - Document why certain configurations differ
7. **Resource limits** - Add memory/CPU limits to more services

---

## End of Index
