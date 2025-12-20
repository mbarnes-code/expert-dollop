# PostgreSQL Infrastructure

Shared PostgreSQL database infrastructure for security domain projects.

## Projects Using PostgreSQL

### Dispatch
- **Path**: `modules/security/dispatch`
- **Version**: PostgreSQL 14.6
- **Purpose**: Incident management and response platform
- **Database**: `dispatch`
- **Additional Tools**: pgAdmin for database management

### Ghostwriter
- **Path**: `modules/security/ghostwriter`
- **Version**: PostgreSQL (version from base image)
- **Purpose**: Collaborative red team operations platform
- **Database**: Used for Django ORM, Hasura GraphQL
- **Note**: Also uses Redis for caching/queuing

## Common Configuration Files

### Docker Configuration
```yaml
# Dockerfile example
FROM postgres:14.6

# Environment variables
POSTGRES_USER: postgres
POSTGRES_PASSWORD: <secure-password>
POSTGRES_DB: <database-name>
POSTGRES_HOST: postgres
POSTGRES_PORT: 5432

# Volume mounts
- postgres-data:/var/lib/postgresql/data
```

### Connection Strings
```
# Django/Python
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Hasura/GraphQL
HASURA_GRAPHQL_DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

### Performance Tuning
- Shared buffers: 25% of RAM
- Effective cache size: 50-75% of RAM
- Work mem: Depends on concurrent connections
- Maintenance work mem: 256MB-1GB

### Backup Strategy
- Regular pg_dump exports
- WAL archiving for point-in-time recovery
- Volume backups: `postgres-data-backups`

## Network Configuration

### Service Definition
```yaml
postgres:
  image: postgres:14.6
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - postgres-backups:/backups
  restart: unless-stopped
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 30s
    timeout: 10s
    retries: 5
```

## Security Considerations

- Use strong passwords (not defaults)
- Limit network exposure (bind to localhost or private network)
- Enable SSL/TLS for production
- Configure pg_hba.conf for authentication
- Regular security updates
- Implement least privilege access

## Monitoring

- Connection pooling metrics
- Query performance (slow query log)
- Disk usage
- Replication lag (if applicable)
- Table bloat monitoring
