# Docker Compose Services Enumeration Report

**Date Generated:** December 5, 2025  
**Total Files Analyzed:** 27

## Executive Summary

This report enumerates all services defined across 27 docker-compose files in the features directory. The analysis includes:
- Total count of each unique service name
- Detailed configuration breakdown per service
- Command variations and subtle differences
- Complete file-by-file enumeration

---

## Table of Contents

1. [Service Count Summary](#service-count-summary)
2. [Service Details by Name](#service-details-by-name)
3. [Complete File Enumeration](#complete-file-enumeration)

---

## Service Count Summary

| Service Name | Total Occurrences | Files |
|-------------|------------------|-------|
| postgres | 11 | n8n/benchmark (4), kong (3), mealie (1), dispatch (2), commander-spellbook (1) |
| n8n | 4 | n8n/benchmark sqlite, n8n/benchmark scaling-single-main, n8n/benchmark postgres, n8n .devcontainer |
| redis | 4 | n8n/benchmark scaling-multi-main, n8n/benchmark scaling-single-main, kong dependency-services, firecrawl |
| mockapi | 4 | n8n/benchmark (4) |
| runners | 2 | n8n/benchmark sqlite, n8n/benchmark postgres |
| benchmark | 4 | n8n/benchmark (4) |
| n8n_worker1 | 2 | n8n/benchmark scaling-multi-main, n8n/benchmark scaling-single-main |
| n8n_worker2 | 2 | n8n/benchmark scaling-multi-main, n8n/benchmark scaling-single-main |
| n8n_worker1_runners | 2 | n8n/benchmark scaling-multi-main, n8n/benchmark scaling-single-main |
| n8n_worker2_runners | 2 | n8n/benchmark scaling-multi-main, n8n/benchmark scaling-single-main |
| n8n_main1 | 1 | n8n/benchmark scaling-multi-main |
| n8n_main2 | 1 | n8n/benchmark scaling-multi-main |
| mariadb | 1 | n8n .github |
| mysql-8.4 | 1 | n8n .github |
| mealie | 3 | mealie docker, mealie e2e |
| mailpit | 1 | mealie docker.dev |
| oidc-mock-server | 1 | mealie e2e |
| ldap | 1 | mealie e2e |
| file-enrichment | 1 | Nemesis file_enrichment |
| file-enrichment-dapr | 1 | Nemesis file_enrichment |
| minio | 2 | Nemesis file_enrichment, Nemesis web_api |
| otel-collector | 1 | Nemesis file_enrichment |
| web-api | 1 | Nemesis web_api |
| web-api-dapr | 1 | Nemesis web_api |
| goose-cli | 1 | goose |
| kong_old | 1 | kong upgrade-tests |
| db_postgres | 1 | kong upgrade-tests |
| grpcbin | 1 | kong dependency-services |
| zipkin | 1 | kong dependency-services |
| redis-auth | 1 | kong dependency-services |
| db | 2 | kong .devcontainer, dispatch .devcontainer |
| kong | 1 | kong .devcontainer |
| server | 1 | maltrail |
| rita | 2 | rita docker-compose, rita docker-compose.prod |
| syslog-ng | 2 | rita docker-compose, rita docker-compose.prod |
| clickhouse | 2 | rita docker-compose, rita docker-compose.prod |
| nginx | 2 | n8n/benchmark scaling-multi-main (as load balancer), commander-spellbook |
| web | 2 | commander-spellbook docker-compose, commander-spellbook docker-compose.prod |
| discord-bot | 2 | commander-spellbook docker-compose, commander-spellbook docker-compose.prod |
| reddit-bot | 2 | commander-spellbook docker-compose, commander-spellbook docker-compose.prod |
| telegram-bot | 2 | commander-spellbook docker-compose, commander-spellbook docker-compose.prod |
| app | 1 | dispatch .devcontainer |
| admin | 1 | dispatch .devcontainer |
| pgadmin | 1 | dispatch docker |
| actual-development | 2 | actual docker-compose, actual .devcontainer |
| actual_server | 1 | actual sync-server |
| html-to-markdown | 1 | firecrawl go-html-to-md-service |
| playwright-service | 1 | firecrawl |
| api | 1 | firecrawl |
| nuq-postgres | 1 | firecrawl |

**Total Unique Services:** 46  
**Total Service Instances:** 76

---

## Service Details by Name

### 1. postgres

**Occurrences:** 11

#### Image Variations:
- `postgres:16.4` (4 instances)
- `postgres:16-alpine` (1 instance)
- `postgres:16` (1 instance)
- `postgres:14.6` (1 instance)
- `postgres:14-alpine` (1 instance)
- `postgres:9.6` (1 instance)
- `postgres:9.5` (1 instance)
- `postgres:latest` (1 instance)

#### Configuration Breakdown:

**1. n8n/benchmark/scaling-multi-main**
```yaml
image: postgres:16.4
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=password
  - PGDATA=/var/lib/postgresql/data/pgdata
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
  interval: 5s
  timeout: 5s
  retries: 10
```

**2. n8n/benchmark/scaling-single-main**
```yaml
image: postgres:16.4
user: root:root  # DIFFERENCE: user directive
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=password
  - PGDATA=/var/lib/postgresql/data/pgdata
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
  interval: 5s
  timeout: 5s
  retries: 10
```

**3. n8n/benchmark/postgres**
```yaml
image: postgres:16.4
user: root:root
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=password
  - PGDATA=/var/lib/postgresql/data/pgdata
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
  interval: 5s
  timeout: 5s
  retries: 5  # DIFFERENCE: only 5 retries instead of 10
```

**4. n8n .github**
```yaml
image: postgres:16
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=password
ports:
  - 5432:5432
tmpfs:
  - /var/lib/postgresql/data  # DIFFERENCE: uses tmpfs instead of volume
```

**5. n8n .devcontainer**
```yaml
image: postgres:16-alpine
volumes:
  - postgres-data:/var/lib/postgresql/data
environment:
  - POSTGRES_DB=n8n
  - POSTGRES_PASSWORD=password  # DIFFERENCE: no POSTGRES_USER
```

**6. mealie docker.dev**
```yaml
container_name: mealie_dev_postgres
image: postgres:15
restart: no
ports:
  - "5432:5432"
environment:
  POSTGRES_PASSWORD: mealie
  POSTGRES_USER: mealie
```

**7. kong upgrade-tests (as db_postgres)**
```yaml
image: postgres:9.5
environment:
  POSTGRES_DBS: kong,kong_tests  # DIFFERENCE: multiple databases
  POSTGRES_USER: kong
  POSTGRES_HOST_AUTH_METHOD: trust
network_mode: "host"
```

**8. kong dependency-services**
```yaml
image: postgres
ports:
  - 127.0.0.1::5432  # DIFFERENCE: dynamic port mapping
volumes:
  - ./00-create-pg-db.sh:/docker-entrypoint-initdb.d/00-create-pg-db.sh
environment:
  POSTGRES_DBS: kong,kong_tests
  POSTGRES_USER: kong
  POSTGRES_HOST_AUTH_METHOD: trust
```

**9. dispatch .devcontainer (as db)**
```yaml
image: postgres:latest
volumes:
  - postgres-data:/var/lib/postgresql/data
environment:
  POSTGRES_USER: dispatch
  POSTGRES_DB: dispatch
  POSTGRES_PASSWORD: dispatch
```

**10. dispatch docker**
```yaml
image: postgres:14.6
hostname: postgres
ports:
  - "5432:5432"
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: dispatch
  POSTGRES_DB: dispatch
```

**11. commander-spellbook**
```yaml
image: postgres:14-alpine
volumes:
  - postgres_data:/var/lib/postgresql/data/
expose:
  - 5432
ports:
  - 5432:5432
environment:
  PGPORT: 5432
  POSTGRES_USER: test_user
  POSTGRES_PASSWORD: test_password
  POSTGRES_DB: spellbook_db_test
healthcheck:
  test: ["CMD-SHELL", "pg_isready -q -d spellbook_db_test -U test_user"]
  interval: 5s
  timeout: 5s
  retries: 5
```

---

### 2. redis

**Occurrences:** 4

#### Image Variations:
- `redis:6.2.14-alpine` (2 instances)
- `redis` (1 instance)
- `redis:alpine` (1 instance)

#### Configuration Breakdown:

**1. n8n/benchmark/scaling-multi-main**
```yaml
image: redis:6.2.14-alpine
restart: always
ports:
  - 6379:6379
healthcheck:
  test: ['CMD', 'redis-cli', 'ping']
  interval: 1s
  timeout: 3s
```

**2. n8n/benchmark/scaling-single-main**
```yaml
image: redis:6.2.14-alpine
ports:
  - 6379:6379
healthcheck:
  test: ['CMD', 'redis-cli', 'ping']
  interval: 1s
  timeout: 3s
# DIFFERENCE: no restart directive
```

**3. kong dependency-services**
```yaml
image: redis
ports:
  - 127.0.0.1::6379  # DIFFERENCE: dynamic port mapping
  - 127.0.0.1::6380
volumes:
  - redis-data:/data
restart: on-failure
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 10s
  retries: 10
```

**4. firecrawl**
```yaml
image: redis:alpine
networks:
  - backend
command: redis-server --bind 0.0.0.0  # DIFFERENCE: custom command
```

---

### 3. n8n

**Occurrences:** 4

#### Image: `ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}`

#### Command Variations:
- No command (default) - 3 instances
- Command: worker - 0 instances in this service name (used in n8n_worker*)

#### Configuration Breakdown:

**1. n8n/benchmark/sqlite**
```yaml
image: ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}
user: root:root
environment:
  - N8N_DIAGNOSTICS_ENABLED=false
  - N8N_USER_FOLDER=/n8n
  - DB_SQLITE_POOL_SIZE=3
  - DB_SQLITE_ENABLE_WAL=true
  - N8N_RUNNERS_ENABLED=true
  - N8N_RUNNERS_MODE=external
  - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
  - N8N_RUNNERS_AUTH_TOKEN=test
  - N8N_NATIVE_PYTHON_RUNNER=true
  - N8N_METRICS=true
ports:
  - 5678:5678
healthcheck:
  test: ['CMD-SHELL', 'wget --spider -q http://n8n:5678/healthz || exit 1']
  interval: 5s
  timeout: 5s
  retries: 10
```

**2. n8n/benchmark/scaling-single-main**
```yaml
image: ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}
user: root:root
environment:
  - N8N_DIAGNOSTICS_ENABLED=false
  - N8N_USER_FOLDER=/n8n/main
  - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
  - EXECUTIONS_MODE=queue  # DIFFERENCE: queue mode
  - QUEUE_BULL_REDIS_HOST=redis
  - DB_TYPE=postgresdb  # DIFFERENCE: postgres instead of sqlite
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PASSWORD=password
  - N8N_METRICS=true
ports:
  - 5678:5678
```

**3. n8n/benchmark/postgres**
```yaml
image: ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}
user: root:root
environment:
  - N8N_DIAGNOSTICS_ENABLED=false
  - N8N_USER_FOLDER=/n8n
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PASSWORD=password
  - N8N_RUNNERS_ENABLED=true
  - N8N_RUNNERS_MODE=external
  - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
  - N8N_RUNNERS_AUTH_TOKEN=test
  - N8N_NATIVE_PYTHON_RUNNER=true
  - N8N_METRICS=true
ports:
  - 5678:5678
```

**4. n8n .devcontainer**
```yaml
build:
  context: .
  dockerfile: Dockerfile
volumes:
  - ..:/workspaces:cached
command: sleep infinity  # DIFFERENCE: development mode
environment:
  DB_POSTGRESDB_HOST: postgres
  DB_TYPE: postgresdb
  DB_POSTGRESDB_PASSWORD: password
```

---

### 4. mockapi

**Occurrences:** 4

#### Image: `wiremock/wiremock:3.9.1` (all instances)

#### Configuration: **IDENTICAL across all instances**

```yaml
image: wiremock/wiremock:3.9.1
ports:
  - '8088:8080'
volumes:
  - ${MOCK_API_DATA_PATH}/mappings:/home/wiremock/mappings
```

**Files:**
- n8n/benchmark/sqlite
- n8n/benchmark/scaling-multi-main
- n8n/benchmark/scaling-single-main
- n8n/benchmark/postgres

---

### 5. runners (n8n runners)

**Occurrences:** 2

#### Image: `ghcr.io/n8n-io/runners:${N8N_VERSION:-latest}`

#### Configuration: **IDENTICAL across instances**

```yaml
image: ghcr.io/n8n-io/runners:${N8N_VERSION:-latest}
environment:
  - N8N_RUNNERS_TASK_BROKER_URI=http://n8n:5679
  - N8N_RUNNERS_AUTH_TOKEN=test
  - NO_COLOR=1
depends_on:
  n8n:
    condition: service_healthy
```

**Files:**
- n8n/benchmark/sqlite
- n8n/benchmark/postgres

---

### 6. benchmark

**Occurrences:** 4

#### Image: `ghcr.io/n8n-io/n8n-benchmark:${N8N_BENCHMARK_VERSION:-latest}`

#### Configuration Variations:

**1-2. sqlite & postgres (IDENTICAL)**
```yaml
image: ghcr.io/n8n-io/n8n-benchmark:${N8N_BENCHMARK_VERSION:-latest}
depends_on:
  n8n:
    condition: service_healthy
environment:
  - N8N_BASE_URL=http://n8n:5678
  - K6_API_TOKEN=${K6_API_TOKEN}
  - BENCHMARK_RESULT_WEBHOOK_URL=${BENCHMARK_RESULT_WEBHOOK_URL}
  - BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER=${BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER}
```

**3. scaling-single-main**
```yaml
# Same as above plus:
environment:
  - COLLECT_APP_METRICS=true  # DIFFERENCE
```

**4. scaling-multi-main**
```yaml
depends_on:
  - n8n  # DIFFERENCE: simple depends_on, not condition-based
environment:
  - N8N_BASE_URL=http://n8n:80  # DIFFERENCE: port 80 (nginx load balancer)
  - K6_API_TOKEN=${K6_API_TOKEN}
  - BENCHMARK_RESULT_WEBHOOK_URL=${BENCHMARK_RESULT_WEBHOOK_URL}
  - BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER=${BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER}
  - COLLECT_APP_METRICS=true
```

---

### 7. n8n_worker1

**Occurrences:** 2

#### Image: `ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}`
#### Command: `worker` (both instances)

#### Configuration Variations:

**1. scaling-multi-main**
```yaml
image: ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}
environment:
  - N8N_DIAGNOSTICS_ENABLED=false
  - N8N_USER_FOLDER=/n8n/worker1
  - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
  - N8N_LICENSE_CERT=${N8N_LICENSE_CERT}  # License config
  - N8N_LICENSE_ACTIVATION_KEY=${N8N_LICENSE_ACTIVATION_KEY}
  - N8N_LICENSE_TENANT_ID=${N8N_LICENSE_TENANT_ID}
  - EXECUTIONS_MODE=queue
  - QUEUE_BULL_REDIS_HOST=redis
  - QUEUE_HEALTH_CHECK_ACTIVE=true
  - N8N_CONCURRENCY_PRODUCTION_LIMIT=10
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PASSWORD=password
  - N8N_RUNNERS_ENABLED=true
  - N8N_RUNNERS_MODE=external
  - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
  - N8N_RUNNERS_AUTH_TOKEN=test
  - N8N_NATIVE_PYTHON_RUNNER=true
command: worker
```

**2. scaling-single-main**
```yaml
# Same as above but WITHOUT license environment variables:
# DIFFERENCE: No N8N_LICENSE_* variables
user: root:root  # DIFFERENCE: user directive
```

---

### 8. n8n_worker2

**Occurrences:** 2

#### Configuration: Nearly identical to n8n_worker1
#### Key Difference: `N8N_USER_FOLDER=/n8n/worker2` and different depends_on

**Both instances:**
- depend on n8n_worker1 to start first
- Same environment variables as corresponding worker1
- Same healthcheck configuration

---

### 9. n8n_worker1_runners & n8n_worker2_runners

**Occurrences:** 2 each (4 total)

#### Image: `ghcr.io/n8n-io/runners:${N8N_VERSION:-latest}`

#### Configuration Pattern:

```yaml
image: ghcr.io/n8n-io/runners:${N8N_VERSION:-latest}
environment:
  - N8N_RUNNERS_TASK_BROKER_URI=http://n8n_worker[1|2]:5679
  - N8N_RUNNERS_AUTH_TOKEN=test
  - NO_COLOR=1
depends_on:
  n8n_worker[1|2]:
    condition: service_healthy
```

**DIFFERENCE:** Only the worker number in URI and depends_on

---

### 10. n8n_main1 & n8n_main2

**Occurrences:** 1 each (2 total, only in scaling-multi-main)

#### Image: `ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}`

#### Configuration: **IDENTICAL for both**

```yaml
image: ghcr.io/n8n-io/n8n:${N8N_VERSION:-latest}
environment:
  - N8N_DIAGNOSTICS_ENABLED=false
  - N8N_USER_FOLDER=/n8n
  - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
  - N8N_LICENSE_CERT=${N8N_LICENSE_CERT}
  - N8N_LICENSE_ACTIVATION_KEY=${N8N_LICENSE_ACTIVATION_KEY}
  - N8N_LICENSE_TENANT_ID=${N8N_LICENSE_TENANT_ID}
  - N8N_PROXY_HOPS=1
  - EXECUTIONS_MODE=queue
  - QUEUE_BULL_REDIS_HOST=redis
  - N8N_MULTI_MAIN_SETUP_ENABLED=true
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_PASSWORD=password
  - N8N_METRICS=true
depends_on:
  n8n_worker1:
    condition: service_healthy
  n8n_worker2:
    condition: service_healthy
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
  mockapi:
    condition: service_started
```

**Only difference:** Volume paths (`n8n-main1` vs `n8n-main2`)

---

### 11. nginx (Load Balancer)

**Occurrences:** 2

#### Configuration Variations:

**1. n8n/benchmark/scaling-multi-main (as load balancer for n8n)**
```yaml
image: nginx:1.27.2
ports:
  - '5678:80'
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf
depends_on:
  n8n_main1:
    condition: service_healthy
  n8n_main2:
    condition: service_healthy
```

**2. commander-spellbook**
```yaml
image: nginx:1.23-alpine
ports:
  - 80:80
depends_on:
  - web
volumes:
  - static_volume:/home/app/web/staticfiles:ro
  - ./backend/nginx/demo.conf:/etc/nginx/templates/default.conf.template
restart: always
```

---

### 12. mariadb & mysql-8.4

**Occurrences:** 1 each (in n8n .github)

#### mariadb
```yaml
image: mariadb:10.5
environment:
  - MARIADB_DATABASE=n8n
  - MARIADB_ROOT_PASSWORD=password
  - MARIADB_MYSQL_LOCALHOST_USER=true
ports:
  - 3306:3306
tmpfs:
  - /var/lib/mysql
```

#### mysql-8.4
```yaml
image: mysql:8.4
environment:
  - MYSQL_DATABASE=n8n
  - MYSQL_ROOT_PASSWORD=password
ports:
  - 3306:3306
tmpfs:
  - /var/lib/mysql
```

---

### 13. mealie

**Occurrences:** 3

#### Image Variations:
- `mealie:dev` (build from local Dockerfile) - 1 instance
- `mealie:e2e` (build from local Dockerfile) - 1 instance
- No occurrences of pre-built image

#### Configuration Variations:

**1. mealie/docker**
```yaml
container_name: mealie
image: mealie:dev
build:
  context: ../
  target: production
  dockerfile: ./docker/Dockerfile
restart: always
volumes:
  - mealie-data:/app/data/
ports:
  - 9091:9000
environment:
  ALLOW_SIGNUP: "false"
  LOG_LEVEL: "DEBUG"
  DB_ENGINE: sqlite
  POSTGRES_USER: mealie
  POSTGRES_PASSWORD: mealie
  POSTGRES_SERVER: postgres
  POSTGRES_PORT: 5432
  POSTGRES_DB: mealie
```

**2. mealie/tests/e2e**
```yaml
container_name: mealie
image: mealie:e2e
build:
  context: ../../../
  target: production
  dockerfile: ./docker/Dockerfile
restart: always
volumes:
  - mealie-data:/app/data/
network_mode: host  # DIFFERENCE: host networking
environment:
  ALLOW_SIGNUP: True
  DB_ENGINE: sqlite
  OIDC_AUTH_ENABLED: True  # DIFFERENCE: extensive OIDC config
  OIDC_SIGNUP_ENABLED: True
  OIDC_USER_GROUP: user
  OIDC_ADMIN_GROUP: admin
  OIDC_CONFIGURATION_URL: http://localhost:8080/default/.well-known/openid-configuration
  OIDC_CLIENT_ID: default
  OIDC_CLIENT_SECRET: secret
  LDAP_AUTH_ENABLED: True  # DIFFERENCE: extensive LDAP config
  LDAP_SERVER_URL: ldap://localhost:10389
  LDAP_TLS_INSECURE: true
  # ... many more LDAP settings
```

---

### 14. mailpit

**Occurrences:** 1 (mealie/docker.dev)

```yaml
image: axllent/mailpit:latest
container_name: mealie_dev_mailpit
restart: no
environment:
  - "MP_SMTP_AUTH_ACCEPT_ANY=true"
  - "MP_SMTP_AUTH_ALLOW_INSECURE=true"
ports:
  - "8025:8025"
  - "1025:1025"
```

---

### 15. oidc-mock-server

**Occurrences:** 1 (mealie/tests/e2e)

```yaml
container_name: oidc-mock-server
image: ghcr.io/navikt/mock-oauth2-server:2.1.9
network_mode: host
environment:
  LOG_LEVEL: "debug"
  SERVER_PORT: 8080
```

---

### 16. ldap

**Occurrences:** 1 (mealie/tests/e2e)

```yaml
image: rroemhild/test-openldap
ports:
  - 10389:10389
```

---

### 17. Nemesis Services

#### file-enrichment & file-enrichment-dapr

**Occurrences:** 1 each (Nemesis/projects/file_enrichment/docker-compose.debug.yml)

**file-enrichment:**
```yaml
ports: !reset []
networks: !reset
  - ""
# DIFFERENCE: Isolated for debugging
```

**file-enrichment-dapr:**
```yaml
command: [
  "./daprd",
  "--max-body-size", "1Gi",
  "--app-id", "file-enrichment",
  "--app-port", "8001",
  "--dapr-http-port", "3503",
  "--dapr-grpc-port", "50003",
  "--placement-host-address", "placement:50006",
  "--scheduler-host-address", "scheduler:50007",
  "--log-level", "${DAPR_LOG_LEVEL:-warn}",
  "--resources-path", "/dapr/components",
  "--config", "/dapr/configuration/file_enrichment_monitoring_disabled.yaml",
  "--enable-metrics",
  "--dapr-graceful-shutdown-seconds", "5",
  "--app-channel-address", "host.docker.internal",
]
network_mode: !reset "service:file-enrichment"
extra_hosts:
  - "host.docker.internal:host-gateway"
ports:
  - "3503:3503"  # Sidecar HTTP port
  - "50003:50003"  # Sidecar GRPC port
```

#### web-api & web-api-dapr

**Occurrences:** 1 each (Nemesis/projects/web_api/docker-compose.debug.yml)

**web-api:**
```yaml
ports: !reset []
networks: !reset
  - ""
```

**web-api-dapr:**
```yaml
command: [
  "./daprd",
  "--app-id", "web-api",
  "--app-port", "8000",
  "--dapr-http-port", "3500",
  "--dapr-grpc-port", "50001",
  "--placement-host-address", "placement:50006",
  "--scheduler-host-address", "scheduler:50007",
  "--resources-path", "/dapr/components",
  "--config", "/dapr/configuration/config.yaml",
  "--app-channel-address", "host.docker.internal"
]
network_mode: !reset ""
ports:
  - "3500:3500"
  - "50001:50001"
```

#### minio

**Occurrences:** 2 (both Nemesis debug files)

```yaml
# Exposed ports for debugging
ports:
  - "9000:9000"
```

#### otel-collector

**Occurrences:** 1 (Nemesis/file_enrichment)

```yaml
ports:
  - "4317:4317"
```

---

### 18. goose-cli

**Occurrences:** 1 (goose/documentation/docs/docker)

```yaml
build:
  context: ../../..
  dockerfile: documentation/docs/docker/Dockerfile
  args:
    USER_ID: ${UID:-1000}
volumes:
  - ../../..:/root/workspace
  - goose-config:/root/.goose
  - ~/.gitconfig:/root/.gitconfig:ro
  - ~/.ssh:/root/.ssh:ro
working_dir: /root/workspace
environment:
  - GOOSE_HOME=/root/.goose
  - EDITOR=vim
  - GIT_AUTHOR_NAME=${GIT_AUTHOR_NAME:-Goose User}
  - GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL:-goose@example.com}
  - GOOGLE_API_KEY="XXX"
  - GOOSE_PROVIDER=google
  - GOOSE_MODEL=gemini-2.0-flash-exp
  - DBUS_SESSION_BUS_ADDRESS
  - GNOME_KEYRING_CONTROL
  - SSH_AUTH_SOCK
stdin_open: true
tty: true
entrypoint: ["/bin/bash"]
```

---

### 19. Kong Services

#### kong_old

**Occurrences:** 1 (kong/scripts/upgrade-tests)

```yaml
image: ${OLD_KONG_IMAGE}
command: "tail -f /dev/null"
user: root
depends_on:
  - db_postgres
healthcheck:
  test: ["CMD", "true"]
  interval: 1s
  timeout: 1s
  retries: 10
environment:
  KONG_PG_HOST: localhost
  KONG_TEST_PG_HOST: localhost
volumes:
  - ../../worktree/${OLD_KONG_VERSION}:/kong
restart: on-failure
network_mode: "host"
```

#### grpcbin

**Occurrences:** 1 (kong/scripts/dependency_services)

```yaml
image: kong/grpcbin
ports:
  - 127.0.0.1::9000
  - 127.0.0.1::9001
```

#### zipkin

**Occurrences:** 1 (kong/scripts/dependency_services)

```yaml
image: openzipkin/zipkin:2
ports:
  - 127.0.0.1::9411
command: --logging.level.zipkin2=DEBUG
```

#### redis-auth

**Occurrences:** 1 (kong/scripts/dependency_services)

```yaml
image: redis/redis-stack-server
ports:
  - 127.0.0.1::6385
environment:
  - REDIS_ARGS=--requirepass passdefault --port 6385
volumes:
  - redis-auth-data:/data
healthcheck:
  test: ["CMD", "redis-cli", "-p", "6385", "--pass", "passdefault", "ping"]
  interval: 5s
  timeout: 10s
  retries: 10
```

#### kong (.devcontainer)

**Occurrences:** 1

```yaml
build:
  context: .
  dockerfile: Dockerfile
volumes:
  - ..:/workspace:cached
  - /var/run/docker.sock:/var/run/docker.sock
cap_add:
  - SYS_PTRACE
security_opt:
  - seccomp:unconfined
environment:
  KONG_PROXY_ERROR_LOG: /dev/stderr
  KONG_PG_USER: kong
  KONG_PG_DATABASE: kong
  KONG_PG_PASSWORD: kong
  KONG_PG_HOST: db
  OPENSSL_DIR: /usr/local/kong
  CRYPTO_DIR: /usr/local/kong
command: /bin/sh -c "while sleep 1000; do :; done"
network_mode: service:db
```

---

### 20. maltrail - server

**Occurrences:** 1 (maltrail/docker)

```yaml
container_name: maltrail-server
build: .
command: server.py
restart: unless-stopped
ports:
  - "8338:8338/tcp"
  - "8337:8337/udp"
volumes:
  - "/etc/localtime:/etc/localtime:ro"
  - "/etc/maltrail.conf:/opt/maltrail/maltrail.conf:ro"
  - "/var/log/maltrail:/var/log/maltrail"
```

Note: sensor service is commented out in the file

---

### 21. RITA Services

#### rita

**Occurrences:** 2

**Configuration Variations:**

**1. docker-compose.yml**
```yaml
build: .
depends_on:
  clickhouse:
    condition: service_healthy
volumes:
  - ${CONFIG_FILE:-/etc/rita/config.hjson}:/config.hjson
  - ${CONFIG_DIR:-/etc/rita}/http_extensions_list.csv:/deployment/http_extensions_list.csv
  - ${CONFIG_DIR:-/etc/rita}/threat_intel_feeds:/deployment/threat_intel_feeds
  - .env:/.env
links:
  - "clickhouse:db"
  - "syslog-ng:syslogng"
environment:
  - DB_ADDRESS=db:9000
  - TERM=xterm-256color
```

**2. docker-compose.prod.yml**
```yaml
image: ghcr.io/activecm/rita:latest  # DIFFERENCE: uses image instead of build
build: .
# DIFFERENCE: Different volume paths
volumes:
  - ${CONFIG_FILE:-/etc/rita/config.hjson}:/config.hjson
  - ${CONFIG_DIR:-/etc/rita}/http_extensions_list.csv:${CONFIG_DIR:-/etc/rita}/http_extensions_list.csv
  - ${CONFIG_DIR:-/etc/rita}/threat_intel_feeds:${CONFIG_DIR:-/etc/rita}/threat_intel_feeds
  - /opt/rita/.env:/.env
# Rest is same
```

#### syslog-ng

**Occurrences:** 2

**Configuration Variations:**

**1. docker-compose.yml**
```yaml
image: lscr.io/linuxserver/syslog-ng:latest
container_name: syslog-ng
environment:
  - PUID=1000
  - PGID=1000
  - TZ=Etc/UTC
volumes:
  - ${CONFIG_DIR:-/etc/rita}/logger-cron:/etc/cron.d/logger-cron
  - ${CONFIG_DIR:-/etc/rita}/syslog-ng.conf:/config/syslog-ng.conf
  - ${APP_LOGS:-/var/log/rita}:/config/logs/rita
ports:
  - 514:5514/udp
restart: unless-stopped
```

**2. docker-compose.prod.yml**
```yaml
# Same as above but:
container_name: rita-syslog-ng  # DIFFERENCE
# DIFFERENCE: uses expose instead of ports
expose:
  - 5514/udp
  - 6601/tcp
# Commented out ports section
```

#### clickhouse

**Occurrences:** 2

**Configuration Variations:**

**1. docker-compose.yml**
```yaml
image: clickhouse/clickhouse-server:${CLICKHOUSE_VERSION?"Missing ClickHouse version"}
container_name: clickhouse
healthcheck:
  test: wget --no-verbose --tries=1 --spider http://localhost:8123/ping || exit 1
  interval: 3s
  start_period: 1s
  retries: 30
restart: unless-stopped
ports:
  - 127.0.0.1:8123:8123
  - 127.0.0.1:9000:9000
volumes:
  - type: bind
    source: /etc/localtime
    target: /etc/localtime
    read_only: true
  - clickhouse_persistent:/var/lib/clickhouse
  - ${CONFIG_DIR:-/etc/rita}/config.xml:/etc/clickhouse-server/users.d/custom_config.xml
  - ${CONFIG_DIR:-/etc/rita}/timezone.xml:/etc/clickhouse-server/config.d/timezone.xml
ulimits:
  nproc: 65535
  nofile:
    soft: 131070
    hard: 131070
```

**2. docker-compose.prod.yml**
```yaml
# Same as above but:
container_name: rita-clickhouse  # DIFFERENCE
# DIFFERENCE: uses expose instead of ports
expose:
  - 9000
# Commented out ports
# DIFFERENCE: Removed timezone.xml volume mount
volumes:
  - type: bind
    source: /etc/localtime
    target: /etc/localtime
    read_only: true
  - clickhouse_persistent:/var/lib/clickhouse
  - ${CONFIG_DIR:-/etc/rita}/config.xml:/etc/clickhouse-server/users.d/custom_config.xml
```

---

### 22. Commander Spellbook Services

#### web

**Occurrences:** 2

**Configuration Variations:**

**1. docker-compose.yml**
```yaml
build:
  context: .
  dockerfile: backend/Dockerfile
  target: demo
  args:
    VERSION: demo
image: spellbook-backend
expose:
  - 8000
depends_on:
  db:
    condition: service_healthy
links:
  - db
volumes:
  - static_volume:/home/app/web/staticfiles:rw
env_file:
  - backend/.env
  - path: backend/secrets.env
    required: false
environment:
  SQL_ENGINE: django.db.backends.postgresql
  SQL_DATABASE: spellbook_db_test
  SQL_USER: test_user
  SQL_PASSWORD: test_password
  SQL_HOST: db
  SQL_PORT: 5432
  DATABASE: postgres
  SECRET_KEY: demo-secret-key
healthcheck:
  test: "wget --no-verbose --tries=1 --spider http://127.0.0.1:8000/ || exit 1"
  start_period: 20s
  interval: 10s
  timeout: 10s
  retries: 100
restart: always
```

**2. docker-compose.prod.yml**
```yaml
extends:
  file: docker-compose.yml
  service: web
build:
  context: .
  dockerfile: backend/Dockerfile
  target: production  # DIFFERENCE: production target
  args:
    VERSION: production
volumes: !reset []  # DIFFERENCE: reset volumes
ports:
  - 80:80  # DIFFERENCE: exposed port
```

#### discord-bot, reddit-bot, telegram-bot

**Occurrences:** 2 each (6 total)

**Configuration Pattern (discord-bot example):**

```yaml
build:
  context: .
  dockerfile: bot/discord/Dockerfile
image: spellbook-discord-bot
depends_on:
  web:
    condition: service_healthy
links:
  - web
env_file:
  - bot/discord/.env
  - path: bot/discord/secrets.env
    required: false
environment:
  SPELLBOOK_API_URL: http://web:8000
restart: always
```

**Production (.prod.yml):**
```yaml
extends:
  file: docker-compose.yml
  service: discord-bot
```

**DIFFERENCE between bots:** Only the dockerfile path and env_file paths
- discord: `bot/discord/`
- reddit: `bot/reddit/`
- telegram: `bot/telegram/`

---

### 23. Dispatch Services

#### app (.devcontainer)

**Occurrences:** 1

```yaml
build:
  context: ..
  dockerfile: .devcontainer/Dockerfile
volumes:
  - ../..:/workspaces:cached
command: sleep infinity
network_mode: service:db
```

#### admin (.devcontainer)

**Occurrences:** 1

```yaml
image: dpage/pgadmin4
environment:
  PGADMIN_DEFAULT_EMAIL: dispatch@netflix.com
  PGADMIN_DEFAULT_PASSWORD: admin
  PGADMIN_CONFIG_PROXY_X_HOST_COUNT: 1
  PGADMIN_CONFIG_PROXY_X_PREFIX_COUNT: 1
  PGADMIN_LISTEN_PORT: 80
restart: unless-stopped
network_mode: service:db
```

#### pgadmin (docker)

**Occurrences:** 1

```yaml
image: dpage/pgadmin4
depends_on:
  - postgres
ports:
  - "5555:80"
environment:
  PGADMIN_DEFAULT_EMAIL: dispatch@netflix.com
  PGADMIN_DEFAULT_PASSWORD: admin
restart: unless-stopped
```

---

### 24. Actual Services

#### actual-development

**Occurrences:** 2

**Configuration Variations:**

**1. docker-compose.yml**
```yaml
build: .
image: actual-development
environment:
  - HTTPS
ports:
  - '3001:3001'
volumes:
  - '.:/app'
restart: 'no'
```

**2. .devcontainer/docker-compose.yml**
```yaml
volumes:
  - ..:/workspaces:cached
command: /bin/sh -c "while sleep 1000; do :; done"
# DIFFERENCE: minimal config for devcontainer
```

#### actual_server

**Occurrences:** 1 (packages/sync-server)

```yaml
image: docker.io/actualbudget/actual-server:latest
ports:
  - '5006:5006'
environment:
  # Optional environment variables (commented)
  # - ACTUAL_HTTPS_KEY=/data/selfhost.key
  # - ACTUAL_HTTPS_CERT=/data/selfhost.crt
  # - ACTUAL_PORT=5006
  # etc.
volumes:
  - ./actual-data:/data
healthcheck:
  test: ['CMD-SHELL', 'node src/scripts/health-check.js']
  interval: 60s
  timeout: 10s
  retries: 3
  start_period: 20s
restart: unless-stopped
```

---

### 25. Firecrawl Services

#### playwright-service

**Occurrences:** 1

```yaml
build: apps/playwright-service-ts
environment:
  PORT: 3000
  PROXY_SERVER: ${PROXY_SERVER}
  PROXY_USERNAME: ${PROXY_USERNAME}
  PROXY_PASSWORD: ${PROXY_PASSWORD}
  BLOCK_MEDIA: ${BLOCK_MEDIA}
networks:
  - backend
```

#### api

**Occurrences:** 1

```yaml
<<: *common-service  # Uses anchor
environment:
  <<: *common-env  # Uses anchor
  HOST: "0.0.0.0"
  PORT: ${INTERNAL_PORT:-3002}
  EXTRACT_WORKER_PORT: ${EXTRACT_WORKER_PORT:-3004}
  WORKER_PORT: ${WORKER_PORT:-3005}
  ENV: local
depends_on:
  - redis
  - playwright-service
ports:
  - "${PORT:-3002}:${INTERNAL_PORT:-3002}"
command: node dist/src/harness.js --start-docker
```

#### nuq-postgres

**Occurrences:** 1

```yaml
build: apps/nuq-postgres
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: postgres
networks:
  - backend
ports:
  - "5432:5432"
```

#### html-to-markdown

**Occurrences:** 1 (go-html-to-md-service)

```yaml
build:
  context: .
  dockerfile: Dockerfile
container_name: html-to-markdown-service
ports:
  - "8080:8080"
environment:
  - PORT=8080
restart: unless-stopped
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 5s
```

---

## Complete File Enumeration

### File 1: `/features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/sqlite/docker-compose.yml`

**Services (4):**
1. mockapi - wiremock/wiremock:3.9.1
2. n8n - ghcr.io/n8n-io/n8n (SQLite mode)
3. runners - ghcr.io/n8n-io/runners
4. benchmark - ghcr.io/n8n-io/n8n-benchmark

---

### File 2: `/features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-multi-main/docker-compose.yml`

**Services (13):**
1. mockapi - wiremock/wiremock:3.9.1
2. redis - redis:6.2.14-alpine
3. postgres - postgres:16.4
4. n8n_worker1 - ghcr.io/n8n-io/n8n (worker mode)
5. n8n_worker1_runners - ghcr.io/n8n-io/runners
6. n8n_worker2 - ghcr.io/n8n-io/n8n (worker mode)
7. n8n_worker2_runners - ghcr.io/n8n-io/runners
8. n8n_main2 - ghcr.io/n8n-io/n8n (main mode)
9. n8n_main1 - ghcr.io/n8n-io/n8n (main mode)
10. n8n - nginx:1.27.2 (load balancer)
11. benchmark - ghcr.io/n8n-io/n8n-benchmark

---

### File 3: `/features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/scaling-single-main/docker-compose.yml`

**Services (9):**
1. mockapi - wiremock/wiremock:3.9.1
2. redis - redis:6.2.14-alpine
3. postgres - postgres:16.4
4. n8n_worker1 - ghcr.io/n8n-io/n8n (worker mode)
5. n8n_worker1_runners - ghcr.io/n8n-io/runners
6. n8n_worker2 - ghcr.io/n8n-io/n8n (worker mode)
7. n8n_worker2_runners - ghcr.io/n8n-io/runners
8. n8n - ghcr.io/n8n-io/n8n (main mode with queue)
9. benchmark - ghcr.io/n8n-io/n8n-benchmark

---

### File 4: `/features/n8n/packages/@n8n/benchmark/scripts/n8n-setups/postgres/docker-compose.yml`

**Services (5):**
1. mockapi - wiremock/wiremock:3.9.1
2. postgres - postgres:16.4
3. n8n - ghcr.io/n8n-io/n8n (postgres mode)
4. runners - ghcr.io/n8n-io/runners
5. benchmark - ghcr.io/n8n-io/n8n-benchmark

---

### File 5: `/features/n8n/.github/docker-compose.yml`

**Services (3):**
1. mariadb - mariadb:10.5
2. mysql-8.4 - mysql:8.4
3. postgres - postgres:16

---

### File 6: `/features/n8n/.devcontainer/docker-compose.yml`

**Services (2):**
1. postgres - postgres:16-alpine
2. n8n - build from Dockerfile

**Volumes:** postgres-data

---

### File 7: `/features/mealie/docker/docker-compose.yml`

**Services (1):**
1. mealie - mealie:dev (build)

**Volumes:** mealie-data

---

### File 8: `/features/mealie/docker/docker-compose.dev.yml`

**Services (2):**
1. mailpit - axllent/mailpit:latest
2. postgres - postgres:15

---

### File 9: `/features/mealie/tests/e2e/docker/docker-compose.yml`

**Services (3):**
1. oidc-mock-server - ghcr.io/navikt/mock-oauth2-server:2.1.9
2. ldap - rroemhild/test-openldap
3. mealie - mealie:e2e (build)

**Volumes:** mealie-data

---

### File 10: `/features/Nemesis/projects/file_enrichment/docker-compose.debug.yml`

**Services (4):** (debug overrides)
1. file-enrichment - isolated
2. file-enrichment-dapr - Dapr sidecar
3. minio - ports exposed
4. otel-collector - ports exposed
5. postgres - ports exposed (commented sections for rabbitmq, scheduler, placement)

**Networks:** nemesis

---

### File 11: `/features/Nemesis/projects/web_api/docker-compose.debug.yml`

**Services (3):** (debug overrides)
1. web-api - isolated
2. web-api-dapr - Dapr sidecar
3. minio - ports exposed

**Networks:** nemesis

---

### File 12: `/features/goose/documentation/docs/docker/docker-compose.yml`

**Services (1):**
1. goose-cli - build from Dockerfile

**Volumes:** goose-config

---

### File 13: `/features/kong/scripts/upgrade-tests/docker-compose.yml`

**Services (2):**
1. kong_old - ${OLD_KONG_IMAGE}
2. db_postgres - postgres:9.5

---

### File 14: `/features/kong/scripts/dependency_services/docker-compose-test-services.yml`

**Services (5):**
1. postgres - postgres
2. redis - redis
3. grpcbin - kong/grpcbin
4. zipkin - openzipkin/zipkin:2
5. redis-auth - redis/redis-stack-server

**Volumes:** postgres-data, redis-data, redis-auth-data

---

### File 15: `/features/kong/.devcontainer/docker-compose.yml`

**Services (2):**
1. db - postgres:9.6
2. kong - build from Dockerfile

---

### File 16: `/features/maltrail/docker/docker-compose.yml`

**Services (1):**
1. server - build from Dockerfile

Note: sensor service commented out

---

### File 17: `/features/rita/docker-compose.yml`

**Services (3):**
1. rita - build from Dockerfile
2. syslog-ng - lscr.io/linuxserver/syslog-ng:latest
3. clickhouse - clickhouse/clickhouse-server:${CLICKHOUSE_VERSION}

**Volumes:** clickhouse_persistent  
**Networks:** rita-network

---

### File 18: `/features/rita/docker-compose.prod.yml`

**Services (3):**
1. rita - ghcr.io/activecm/rita:latest (also builds)
2. syslog-ng - lscr.io/linuxserver/syslog-ng:latest
3. clickhouse - clickhouse/clickhouse-server:${CLICKHOUSE_VERSION}

**Volumes:** clickhouse_persistent  
**Networks:** rita-network

---

### File 19: `/features/commander-spellbook-backend/docker-compose.prod.yml`

**Services (5):** (extends base docker-compose.yml)
1. web - extends with production build
2. db - extends
3. discord-bot - extends
4. reddit-bot - extends
5. telegram-bot - extends

**Volumes:** postgres_data

---

### File 20: `/features/commander-spellbook-backend/docker-compose.yml`

**Services (6):**
1. nginx - nginx:1.23-alpine
2. web - build (backend)
3. db - postgres:14-alpine
4. discord-bot - build
5. reddit-bot - build
6. telegram-bot - build

**Volumes:** static_volume, postgres_data

---

### File 21: `/features/dispatch/.devcontainer/docker-compose.yml`

**Services (3):**
1. app - build from .devcontainer/Dockerfile
2. admin - dpage/pgadmin4
3. db - postgres:latest

**Volumes:** postgres-data

---

### File 22: `/features/dispatch/docker/docker-compose.yml`

**Services (2):**
1. postgres - postgres:14.6
2. pgadmin - dpage/pgadmin4

**Volumes:** postgres-data

---

### File 23: `/features/actual/docker-compose.yml`

**Services (1):**
1. actual-development - build from Dockerfile

---

### File 24: `/features/actual/packages/sync-server/docker-compose.yml`

**Services (1):**
1. actual_server - docker.io/actualbudget/actual-server:latest

---

### File 25: `/features/actual/.devcontainer/docker-compose.yml`

**Services (1):**
1. actual-development - minimal config

---

### File 26: `/features/firecrawl/apps/go-html-to-md-service/docker-compose.yml`

**Services (1):**
1. html-to-markdown - build from Dockerfile

---

### File 27: `/features/firecrawl/docker-compose.yaml`

**Services (4):**
1. playwright-service - build apps/playwright-service-ts
2. api - build apps/api
3. redis - redis:alpine
4. nuq-postgres - build apps/nuq-postgres

**Networks:** backend

---

## Summary Statistics

### By Technology Stack:

**Databases:**
- PostgreSQL: 11 instances (various versions)
- Redis: 4 instances
- ClickHouse: 2 instances
- MariaDB: 1 instance
- MySQL: 1 instance

**Web Servers/Proxies:**
- Nginx: 2 instances
- Kong: 1 instance

**Application Frameworks:**
- n8n (workflow automation): 4 main instances + 4 workers + 2 load-balanced mains
- Django (Commander Spellbook): 1 instance
- FastAPI/Python (Dispatch): 2 instances
- Node.js (Actual, Firecrawl): 3 instances
- Go services: 1 instance

**Supporting Services:**
- Dapr sidecars: 2 instances
- Mock services: 5 instances (wiremock, oidc-mock, ldap)
- Monitoring: 1 instance (otel-collector)
- Email testing: 1 instance (mailpit)

**Bots:**
- Discord: 1 instance
- Reddit: 1 instance
- Telegram: 1 instance

### Common Patterns:

1. **Database healthchecks:** Most postgres instances use `pg_isready`
2. **Redis healthchecks:** All use `redis-cli ping`
3. **Network modes:** Most use bridge, some use host for testing/debugging
4. **Volume patterns:** Named volumes for data persistence, bind mounts for config
5. **Restart policies:** Range from `no` (dev) to `always` (production) to `unless-stopped`
6. **Port exposure:** Development uses `ports:`, production often uses `expose:`

---

## End of Report
