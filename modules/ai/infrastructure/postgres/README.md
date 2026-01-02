# PostgreSQL Infrastructure

This directory contains infrastructure documentation and common configuration patterns for PostgreSQL databases in the AI module.

## Projects Using PostgreSQL

### 1. **nuq-postgres** (`/modules/ai/nuq-postgres`)
- **Base Image**: postgres:${PG_MAJOR}
- **Purpose**: PostgreSQL with nuq extension for queue management
- **Special Features**: 
  - Custom initialization with `nuq.sql`
  - Configured `max_locks_per_transaction = 256`
- **Common Files**:
  - `Dockerfile` - Custom Postgres image
  - `nuq.sql` - Queue extension schema
  - Initialization scripts in `/docker-entrypoint-initdb.d/`

### 2. **firecrawl** (`/modules/ai/firecrawl`)
- **Purpose**: Database for web scraping service
- **Usage**: Primary data store for crawl jobs and results
- **Integration**: Used in docker-compose configurations

### 3. **NVIDIA NeMo-Agent-Toolkit**
Multiple services using PostgreSQL:
- **Deployment examples** with various configurations
- **docker-compose** setups with PostgreSQL
- **Integration**: Agent state persistence, RAG data storage

### 4. **n8n Workflows** (Referenced in AI module)
- **Purpose**: Workflow automation database
- **Configuration**: Multiple instances with different setups
- **Features**: Queue mode, encryption support

## Common Configuration Files

### Dockerfile (nuq-postgres example)
```dockerfile
# Build a Postgres image that runs nuq.sql during initdb
ARG PG_MAJOR=16
FROM postgres:${PG_MAJOR}

# Install required extensions
RUN set -eux; \
    apt-get update; \
    apt-get install -y postgresql-${PG_MAJOR}-pgaudit; \
    rm -rf /var/lib/apt/lists/*

# Configure max_locks_per_transaction before server start
RUN set -eux; \
    echo "max_locks_per_transaction = 256" >> /usr/share/postgresql/postgresql.conf.sample

# Copy initialization SQL
COPY nuq.sql /docker-entrypoint-initdb.d/010-nuq.sql
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: ai-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-ai_db}
      POSTGRES_HOST_AUTH_METHOD: ${POSTGRES_HOST_AUTH_METHOD:-md5}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
      - ./postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
```

### Initialization Scripts
```sql
-- /docker-entrypoint-initdb.d/010-init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS vectors;

-- Create tables
CREATE TABLE IF NOT EXISTS ai.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_metadata ON ai.documents USING GIN (metadata);
CREATE INDEX idx_documents_created ON ai.documents (created_at);
```

## Environment Variables

### Standard Configuration
```bash
# Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ai_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=securepassword

# Connection String
DATABASE_URL=postgresql://postgres:securepassword@localhost:5432/ai_db

# Pool Settings
POSTGRES_POOL_MIN=2
POSTGRES_POOL_MAX=10
POSTGRES_POOL_TIMEOUT=30

# SSL/TLS
POSTGRES_SSL_MODE=prefer  # disable, allow, prefer, require, verify-ca, verify-full
POSTGRES_SSL_CERT=/path/to/cert.pem
POSTGRES_SSL_KEY=/path/to/key.pem

# Authentication
POSTGRES_HOST_AUTH_METHOD=md5  # trust, md5, scram-sha-256
```

## PostgreSQL Extensions

### Essential Extensions
```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptography
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- JSON operations
CREATE EXTENSION IF NOT EXISTS "jsonb_plpython3u";

-- Time series (if needed)
CREATE EXTENSION IF NOT EXISTS "timescaledb";
```

### Vector Extensions (for AI/ML)
```sql
-- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector table
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536),  -- OpenAI ada-002 size
    metadata JSONB
);

-- Create vector index
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

## Configuration Files

### postgresql.conf
```conf
# Connection Settings
listen_addresses = '*'
port = 5432
max_connections = 100

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL Settings
wal_level = replica
max_wal_size = 1GB
min_wal_size = 80MB

# Query Tuning
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000  # Log slow queries (>1s)

# Custom Settings
max_locks_per_transaction = 256  # For queue systems
```

### pg_hba.conf
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             all                                     trust

# IPv4 local connections
host    all             all             127.0.0.1/32            md5

# IPv4 Docker network
host    all             all             172.16.0.0/12           md5

# IPv6 local connections
host    all             all             ::1/128                 md5

# Allow replication
host    replication     all             0.0.0.0/0               md5
```

## Database Schemas

### Multi-Schema Organization
```sql
-- Agent data
CREATE SCHEMA IF NOT EXISTS agents;

-- Vector embeddings
CREATE SCHEMA IF NOT EXISTS vectors;

-- Crawl data
CREATE SCHEMA IF NOT EXISTS crawl;

-- Analytics
CREATE SCHEMA IF NOT EXISTS analytics;

-- Audit logs
CREATE SCHEMA IF NOT EXISTS audit;
```

## Common Table Patterns

### Document Storage
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    metadata JSONB,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_metadata ON documents USING GIN (metadata);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
```

### Queue Tables (nuq pattern)
```sql
CREATE TABLE job_queue (
    id BIGSERIAL PRIMARY KEY,
    queue_name TEXT NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    attempt_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_queue_scheduled ON job_queue (queue_name, scheduled_at) 
    WHERE completed_at IS NULL AND failed_at IS NULL;
```

### Vector Search
```sql
-- Find similar documents
SELECT 
    id,
    title,
    1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE 1 - (embedding <=> $1::vector) > 0.8
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

## Backup & Restore

### Backup Commands
```bash
# Full database backup
pg_dump -h localhost -U postgres -d ai_db -F c -f backup.dump

# Schema-only backup
pg_dump -h localhost -U postgres -d ai_db --schema-only -f schema.sql

# Data-only backup
pg_dump -h localhost -U postgres -d ai_db --data-only -f data.sql

# Specific schema
pg_dump -h localhost -U postgres -d ai_db -n agents -f agents_schema.dump
```

### Restore Commands
```bash
# Restore full database
pg_restore -h localhost -U postgres -d ai_db backup.dump

# Restore schema
psql -h localhost -U postgres -d ai_db -f schema.sql

# Restore with clean (drop existing objects)
pg_restore -h localhost -U postgres -d ai_db --clean backup.dump
```

### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ai_db_${DATE}.dump"

mkdir -p ${BACKUP_DIR}

pg_dump -h localhost -U postgres -d ai_db -F c -f ${BACKUP_FILE}

# Keep only last 7 days
find ${BACKUP_DIR} -name "*.dump" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

## Monitoring

### Health Check Query
```sql
SELECT 
    version(),
    current_database(),
    current_user,
    pg_database_size(current_database()) as db_size,
    (SELECT count(*) FROM pg_stat_activity) as active_connections;
```

### Connection Monitoring
```sql
SELECT 
    datname,
    count(*) as connections,
    max_conn,
    count(*)::float / max_conn::float * 100 as pct_used
FROM pg_stat_activity
CROSS JOIN (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') mc
GROUP BY datname, max_conn
ORDER BY connections DESC;
```

### Slow Query Log
```sql
-- Enable slow query logging
ALTER DATABASE ai_db SET log_min_duration_statement = 1000;

-- View slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

## Performance Tuning

### Index Optimization
```sql
-- Find missing indexes
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Vacuum & Analyze
```sql
-- Manual vacuum
VACUUM ANALYZE documents;

-- Auto-vacuum settings
ALTER TABLE documents SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);
```

## Connection Pooling

### PgBouncer Configuration
```ini
[databases]
ai_db = host=postgres port=5432 dbname=ai_db

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
server_lifetime = 3600
server_idle_timeout = 600
```

### Docker Compose with PgBouncer
```yaml
services:
  postgres:
    image: postgres:16
    # ... postgres config ...
  
  pgbouncer:
    image: pgbouncer/pgbouncer
    environment:
      DATABASES_HOST: postgres
      DATABASES_PORT: 5432
      DATABASES_DBNAME: ai_db
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
    ports:
      - "6432:6432"
    depends_on:
      - postgres
```

## Best Practices

1. **Use Connection Pooling** - PgBouncer or application-level pooling
2. **Regular Backups** - Automated daily backups with retention
3. **Monitor Performance** - Track slow queries and connection usage
4. **Use Schemas** - Organize tables by domain
5. **Index Wisely** - Index foreign keys and frequently queried columns
6. **Vacuum Regularly** - Keep statistics up to date
7. **Use Extensions** - Leverage PostgreSQL's rich extension ecosystem
8. **SSL/TLS** - Enable for production environments
9. **Resource Limits** - Set appropriate memory and connection limits
10. **Version Control** - Track schema changes with migrations

## Migration Tools

### Flyway
```yaml
# flyway.conf
flyway.url=jdbc:postgresql://localhost:5432/ai_db
flyway.user=postgres
flyway.password=postgres
flyway.locations=filesystem:./migrations
```

### Liquibase
```yaml
# liquibase.properties
driver: org.postgresql.Driver
url: jdbc:postgresql://localhost:5432/ai_db
username: postgres
password: postgres
changeLogFile: changelog.xml
```

## Security

### User Management
```sql
-- Create application user
CREATE USER ai_app WITH PASSWORD 'securepassword';

-- Grant schema access
GRANT USAGE ON SCHEMA ai TO ai_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ai TO ai_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ai TO ai_app;

-- Read-only user
CREATE USER ai_readonly WITH PASSWORD 'readonlypass';
GRANT USAGE ON SCHEMA ai TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA ai TO ai_readonly;
```

### Row-Level Security
```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

## Useful Commands

```bash
# Connect to database
psql -h localhost -U postgres -d ai_db

# List databases
\l

# List schemas
\dn

# List tables
\dt

# Describe table
\d table_name

# List indexes
\di

# Execute SQL file
\i /path/to/file.sql

# Quit
\q
```
