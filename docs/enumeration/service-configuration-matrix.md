# Docker Compose Service Configuration Matrix

**Date Generated:** December 5, 2025  
**Purpose:** Quick reference table showing all service configurations across 27 docker-compose files

---

## Legend

- ✓ = Service present
- Image version shown when applicable
- File numbers correspond to enumeration in main report

---

## File Reference Index

| # | File Path |
|---|-----------|
| 1 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/sqlite/docker-compose.yml |
| 2 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-multi-main/docker-compose.yml |
| 3 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-single-main/docker-compose.yml |
| 4 | n8n/packages/@n8n/benchmark/scripts/n8n-setups/postgres/docker-compose.yml |
| 5 | n8n/.github/docker-compose.yml |
| 6 | n8n/.devcontainer/docker-compose.yml |
| 7 | mealie/docker/docker-compose.yml |
| 8 | mealie/docker/docker-compose.dev.yml |
| 9 | mealie/tests/e2e/docker/docker-compose.yml |
| 10 | Nemesis/projects/file_enrichment/docker-compose.debug.yml |
| 11 | Nemesis/projects/web_api/docker-compose.debug.yml |
| 12 | goose/documentation/docs/docker/docker-compose.yml |
| 13 | kong/scripts/upgrade-tests/docker-compose.yml |
| 14 | kong/scripts/dependency_services/docker-compose-test-services.yml |
| 15 | kong/.devcontainer/docker-compose.yml |
| 16 | maltrail/docker/docker-compose.yml |
| 17 | rita/docker-compose.yml |
| 18 | rita/docker-compose.prod.yml |
| 19 | commander-spellbook-backend/docker-compose.prod.yml |
| 20 | commander-spellbook-backend/docker-compose.yml |
| 21 | dispatch/.devcontainer/docker-compose.yml |
| 22 | dispatch/docker/docker-compose.yml |
| 23 | actual/docker-compose.yml |
| 24 | actual/packages/sync-server/docker-compose.yml |
| 25 | actual/.devcontainer/docker-compose.yml |
| 26 | firecrawl/apps/go-html-to-md-service/docker-compose.yml |
| 27 | firecrawl/docker-compose.yaml |

---

## PostgreSQL Service Matrix

| File | Service Name | Image | User | PGDATA | Healthcheck | tmpfs | Network Mode |
|------|--------------|-------|------|--------|-------------|-------|--------------|
| 2 | postgres | 16.4 | - | ✓ | 5s/10 retries | - | bridge |
| 3 | postgres | 16.4 | root:root | ✓ | 5s/10 retries | - | bridge |
| 4 | postgres | 16.4 | root:root | ✓ | 5s/5 retries | - | bridge |
| 5 | postgres | 16 | - | - | - | ✓ | bridge |
| 6 | postgres | 16-alpine | - | - | - | - | bridge |
| 8 | postgres | 15 | - | - | - | - | bridge |
| 13 | db_postgres | 9.5 | - | - | 5s/10 retries | - | host |
| 14 | postgres | latest | - | - | 5s/8 retries | - | bridge |
| 15 | db | 9.6 | - | - | - | - | service:kong |
| 20 | db | 14-alpine | - | - | 5s/5 retries | - | bridge |
| 21 | db | latest | - | - | - | - | service:db |
| 22 | postgres | 14.6 | - | - | - | - | bridge |

**Key Differences:**
- User directive: Only files 3 & 4 use `root:root`
- PGDATA: Files 2, 3, 4 specify custom path
- Healthcheck retries: 5-10 retries, intervals 5s
- tmpfs: Only file 5 uses tmpfs for data
- Network modes: Most bridge, file 13 uses host, files 15 & 21 use service mode

---

## Redis Service Matrix

| File | Image | Port Mapping | Command | Healthcheck | Volumes |
|------|-------|--------------|---------|-------------|---------|
| 2 | redis:6.2.14-alpine | 6379:6379 | default | 1s interval | - |
| 3 | redis:6.2.14-alpine | 6379:6379 | default | 1s interval | - |
| 14 | redis | dynamic | default | 5s interval | redis-data |
| 27 | redis:alpine | none | bind 0.0.0.0 | - | - |

**Key Differences:**
- Command: File 27 uses custom bind command
- Port mapping: File 14 uses dynamic host ports
- Healthcheck: 1s vs 5s intervals
- Volumes: Only file 14 persists data

---

## N8N Service Matrix

| File | Type | Database | Queue Mode | Encryption | License | Runners | Metrics | Command |
|------|------|----------|------------|------------|---------|---------|---------|---------|
| 1 | main | sqlite | - | - | - | ✓ | ✓ | - |
| 3 | main | postgres | queue | ✓ | - | - | ✓ | - |
| 4 | main | postgres | - | - | - | ✓ | ✓ | - |
| 6 | devcontainer | postgres | - | - | - | - | - | sleep infinity |

**Worker Services:**

| File | Service | Database | Concurrency | Runners | User |
|------|---------|----------|-------------|---------|------|
| 2 | n8n_worker1 | postgres | 10 | ✓ | - |
| 2 | n8n_worker2 | postgres | 10 | ✓ | - |
| 3 | n8n_worker1 | postgres | 10 | ✓ | root:root |
| 3 | n8n_worker2 | postgres | 10 | ✓ | root:root |

**Main Services (Multi-Main Setup):**

| File | Service | Multi-Main | Proxy Hops | License |
|------|---------|------------|------------|---------|
| 2 | n8n_main1 | ✓ | 1 | ✓ |
| 2 | n8n_main2 | ✓ | 1 | ✓ |

---

## Application Services Matrix

### Web Applications

| File | Service | Framework | Build Target | Port | Database | Healthcheck |
|------|---------|-----------|--------------|------|----------|-------------|
| 20 | web | Django | demo | 8000 | postgres | wget |
| 19 | web | Django | production | 80 | postgres | - |
| 21 | app | Python | - | - | postgres | - |
| 23 | actual-development | Node | - | 3001 | - | - |
| 24 | actual_server | Node | - | 5006 | - | node script |
| 27 | api | Node | - | 3002 | postgres | - |

### Service-Oriented Applications

| File | Service | Purpose | Port | Dependencies |
|------|---------|---------|------|--------------|
| 16 | server | Maltrail | 8338/8337 | - |
| 17,18 | rita | Network analysis | - | clickhouse, syslog-ng |
| 26 | html-to-markdown | Converter | 8080 | - |
| 27 | playwright-service | Browser automation | 3000 | - |

---

## Bot Services Matrix

| File | Service | Platform | API URL | Secrets |
|------|---------|----------|---------|---------|
| 20 | discord-bot | Discord | http://web:8000 | bot/discord/.env |
| 20 | reddit-bot | Reddit | http://web:8000 | bot/reddit/.env |
| 20 | telegram-bot | Telegram | http://web:8000 | bot/telegram/.env |
| 19 | discord-bot | Discord | (extends) | (extends) |
| 19 | reddit-bot | Reddit | (extends) | (extends) |
| 19 | telegram-bot | Telegram | (extends) | (extends) |

**Note:** File 19 extends all bot services from file 20

---

## Mock/Test Services Matrix

| File | Service | Image | Purpose | Port |
|------|---------|-------|---------|------|
| 1,2,3,4 | mockapi | wiremock:3.9.1 | API mocking | 8088 |
| 8 | mailpit | axllent/mailpit | Email testing | 8025,1025 |
| 9 | oidc-mock-server | mock-oauth2-server:2.1.9 | OIDC testing | 8080 |
| 9 | ldap | test-openldap | LDAP testing | 10389 |
| 14 | grpcbin | kong/grpcbin | gRPC testing | 9000,9001 |
| 14 | zipkin | openzipkin/zipkin:2 | Tracing | 9411 |

---

## Dapr Sidecar Services

| File | Service | App Port | HTTP Port | gRPC Port | Config |
|------|---------|----------|-----------|-----------|--------|
| 10 | file-enrichment-dapr | 8001 | 3503 | 50003 | file_enrichment_monitoring_disabled.yaml |
| 11 | web-api-dapr | 8000 | 3500 | 50001 | config.yaml |

**Common Dapr Settings:**
- Both use `host.docker.internal` for app channel
- Both connect to placement:50006 and scheduler:50007
- Both expose sidecar ports for debugging

---

## Specialized Database Services

### ClickHouse (RITA)

| File | Container Name | Ports | Config Volumes | Timezone |
|------|----------------|-------|----------------|----------|
| 17 | clickhouse | exposed | config.xml, timezone.xml | ✓ |
| 18 | rita-clickhouse | internal only | config.xml only | - |

### Specialized Databases

| File | Service | Type | Purpose |
|------|---------|------|---------|
| 5 | mariadb | MariaDB 10.5 | Testing |
| 5 | mysql-8.4 | MySQL 8.4 | Testing |
| 27 | nuq-postgres | PostgreSQL | Firecrawl queue |

---

## Load Balancer & Proxy Services

| File | Service | Type | Upstream | Port | Config |
|------|---------|------|----------|------|--------|
| 2 | n8n | nginx:1.27.2 | n8n_main1, n8n_main2 | 5678 | nginx.conf |
| 20 | nginx | nginx:1.23-alpine | web | 80 | demo.conf template |

---

## Admin/Management Services

| File | Service | Type | Purpose | Port |
|------|---------|------|---------|------|
| 21 | admin | pgadmin4 | DB admin (devcontainer) | 80 |
| 22 | pgadmin | pgadmin4 | DB admin | 5555 |

---

## Logging Services

| File | Service | Container Name | Ports | Cron |
|------|---------|----------------|-------|------|
| 17 | syslog-ng | syslog-ng | 514 (exposed) | ✓ |
| 18 | syslog-ng | rita-syslog-ng | 5514 (internal) | ✓ |

---

## Storage Services

| File | Service | Exposed | Purpose |
|------|---------|---------|---------|
| 10 | minio | 9000 | Debug file storage |
| 11 | minio | 9000 | Debug file storage |

---

## Observability Services

| File | Service | Port | Purpose |
|------|---------|------|---------|
| 10 | otel-collector | 4317 | OpenTelemetry collection |
| 1,2,3,4 | benchmark | - | n8n performance testing |

---

## Development Tools

| File | Service | Purpose | Volumes | Entrypoint |
|------|---------|---------|---------|------------|
| 12 | goose-cli | AI coding assistant | workspace, .goose, .gitconfig, .ssh | /bin/bash |
| 15 | kong | Kong development | workspace, docker.sock | infinite sleep |
| 25 | actual-development | Actual devcontainer | workspace | infinite sleep |

---

## Environment-Specific Patterns

### Development (.devcontainer)
- Files: 6, 15, 21, 25
- Common: `sleep infinity` or similar keep-alive command
- Volumes: Workspace mounted with cached consistency
- Network: Often uses service network mode

### Production
- Files: 18, 19
- Common: Uses expose instead of ports
- Images: Pre-built images instead of local builds
- Restart: always or unless-stopped
- Secrets: Production secret files

### Testing/E2E
- Files: 5, 9, 13, 14
- Common: Mock services, tmpfs for speed
- Network: Often host mode for easier access
- Healthchecks: More aggressive intervals

---

## Command Variations Summary

### PostgreSQL
- **No variations** - all use default postgres command

### Redis
- **Default:** Most use default command
- **Custom bind:** File 27 uses `redis-server --bind 0.0.0.0`
- **Auth:** File 14 has redis-auth with password

### N8N
- **Default:** Main instances use default
- **Worker:** Worker instances use `command: worker`
- **Dev:** Devcontainer uses `sleep infinity`

### Nginx
- **Default:** Both use default nginx command
- **Config:** Loaded via volumes

### Application Services
- **Django:** Uses gunicorn (implicit in Dockerfile)
- **Node:** Various - `node dist/src/harness.js --start-docker`, default
- **Python:** `server.py`, default
- **Go:** Default

### Dapr
- **Structured command arrays** with specific flags for app integration

---

## Volume Patterns

### Named Volumes
```
postgres-data (persistent DB storage)
redis-data (persistent cache)
clickhouse_persistent (analytics storage)
mealie-data (app data)
goose-config (tool config)
static_volume (Django static files)
```

### Bind Mounts - Configuration
```
./nginx.conf:/etc/nginx/nginx.conf
./config.xml:/etc/clickhouse-server/users.d/custom_config.xml
${CONFIG_DIR}/syslog-ng.conf:/config/syslog-ng.conf
```

### Bind Mounts - Development
```
..:/workspace:cached (most devcontainers)
.:/app (actual development)
../../..:/root/workspace (goose)
```

### Bind Mounts - System
```
/etc/localtime:/etc/localtime:ro (time sync)
/var/run/docker.sock:/var/run/docker.sock (docker-in-docker)
~/.gitconfig:/root/.gitconfig:ro (git config)
~/.ssh:/root/.ssh:ro (SSH keys)
```

---

## Network Patterns

### Bridge (Default)
- Most services (20+ files)
- Isolated per docker-compose stack

### Host
- File 9: mealie e2e (for OIDC testing)
- File 13: kong upgrade tests
- Allows direct localhost access

### Service Mode
- File 15: kong on service:db
- File 21: app, admin on service:db
- Shares network namespace with another container

### Custom Networks
- File 10, 11: nemesis network
- File 17, 18: rita-network network
- File 27: backend network

---

## Healthcheck Patterns

### PostgreSQL
```yaml
test: ['CMD-SHELL', 'pg_isready -U postgres']
interval: 5s
timeout: 5s
retries: 5-10
```

### Redis
```yaml
test: ['CMD', 'redis-cli', 'ping']
interval: 1s-5s
timeout: 3s-10s
retries: 3-10
```

### HTTP Services
```yaml
test: ['CMD-SHELL', 'wget --spider -q http://localhost:PORT/healthz || exit 1']
interval: 5s-60s
timeout: 5s-10s
retries: 3-10
start_period: 5s-20s
```

### ClickHouse
```yaml
test: wget --no-verbose --tries=1 --spider http://localhost:8123/ping || exit 1
interval: 3s
start_period: 1s
retries: 30
```

---

## Restart Policy Distribution

| Policy | Count | Use Case |
|--------|-------|----------|
| always | 8 | Production services |
| unless-stopped | 7 | Production with manual control |
| on-failure | 3 | Test/development |
| no | 3 | Development/devcontainer |
| (not specified) | 6 | Varies by orchestration |

---

## Port Exposure Patterns

### Development
```yaml
ports:
  - "5432:5432"  # Direct mapping
  - "8080:8080"  # Same port
```

### Production
```yaml
expose:
  - 5432  # Internal only
  - 9000
```

### Dynamic Ports
```yaml
ports:
  - 127.0.0.1::5432  # Random host port
```

### Multi-Port
```yaml
ports:
  - "8025:8025"  # Web UI
  - "1025:1025"  # SMTP
```

---

## End of Matrix
