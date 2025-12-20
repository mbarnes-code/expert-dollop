# Redis Infrastructure

Shared Redis infrastructure for caching, session management, and message queuing.

## Projects Using Redis

### Ghostwriter
- **Path**: `modules/security/ghostwriter`
- **Version**: Redis (latest stable)
- **Purpose**: Session storage, task queuing (Django Q-Cluster), caching
- **Use Cases**:
  - Django session backend
  - Celery/Q-Cluster task queue
  - Application caching
  - Real-time data

### MISP (Malware Information Sharing Platform)
- **Path**: `modules/security/misp`
- **Version**: Redis 5.0.1+
- **Purpose**: Background job processing, caching
- **Python Package**: `redis>=5.0.1`

## Common Configuration Files

### Docker Configuration
```yaml
# Dockerfile example
FROM redis:7-alpine

# Copy custom configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD redis-cli ping || exit 1

# Expose port
EXPOSE 6379
```

### redis.conf
```conf
# Network
bind 0.0.0.0
port 6379
protected-mode yes
requirepass <secure-password>

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Logging
loglevel notice
logfile /var/log/redis/redis.log

# Performance
tcp-backlog 511
timeout 0
tcp-keepalive 300
```

### Connection Configuration
```python
# Python (Django/MISP)
REDIS_URL = "redis://${REDIS_HOST}:${REDIS_PORT}/0"
REDIS_PASSWORD = "${REDIS_PASSWORD}"

# Connection with authentication
redis://:<password>@<host>:<port>/<db>
```

## Use Cases

### Session Storage
- Fast session retrieval
- Automatic expiration
- Distributed session sharing

### Task Queue (Celery/Q-Cluster)
- Background job processing
- Scheduled tasks
- Task result storage

### Caching
- Database query results
- API responses
- Computed values
- Rate limiting

### Pub/Sub
- Real-time notifications
- Event broadcasting
- Microservice communication

## Service Definition

```yaml
redis:
  image: redis:7-alpine
  command: redis-server /usr/local/etc/redis/redis.conf
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
    - ./redis.conf:/usr/local/etc/redis/redis.conf
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Security Considerations

- **Authentication**: Always use `requirepass`
- **Network**: Bind to private network only
- **Encryption**: Use TLS for production (stunnel or Redis 6+ native TLS)
- **Commands**: Disable dangerous commands (FLUSHALL, FLUSHDB, CONFIG)
- **Firewall**: Restrict access to trusted IPs
- **Updates**: Regular security patches

## Monitoring

### Key Metrics
- Memory usage
- Connected clients
- Commands processed per second
- Keyspace hits/misses
- Evicted keys
- Persistence status

### Tools
- Redis CLI: `redis-cli INFO`
- Redis Insight (GUI)
- Prometheus redis_exporter
- CloudWatch/Datadog integration

## Backup & Recovery

```bash
# Manual backup
redis-cli SAVE
# or
redis-cli BGSAVE

# Automated backups
# Enable AOF (Append Only File)
appendonly yes

# RDB snapshots
save 900 1    # Save after 900 sec if 1 key changed
save 300 10   # Save after 300 sec if 10 keys changed
save 60 10000 # Save after 60 sec if 10000 keys changed
```

## Performance Tuning

- Use pipelining for bulk operations
- Optimize maxmemory-policy for use case
- Monitor slow log
- Use Redis Cluster for horizontal scaling
- Consider Redis Sentinel for HA
