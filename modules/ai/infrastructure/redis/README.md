# Redis Infrastructure

This directory contains infrastructure documentation and common configuration patterns for Redis in the AI module.

## Projects Using Redis

### 1. **firecrawl** (`/modules/ai/firecrawl`)
- **Purpose**: Job queue management, caching, rate limiting
- **Usage**: BullMQ job queues for web scraping tasks
- **Configuration**: Docker Compose with Redis container

### 2. **n8n Workflows** (Referenced in AI module)
- **Purpose**: Workflow queue management
- **Usage**: 
  - Job queue for distributed workers
  - Session storage
  - Cache layer
- **Configuration**: Multiple instances with different setups

### 3. **NVIDIA NeMo-Agent-Toolkit**
- **Purpose**: Agent state caching, session management
- **Configuration**: Redis for distributed deployments
- **docker-compose**: Redis container in deployment examples

## Common Configuration Files

### docker-compose.yml
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: ai-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    environment:
      - REDIS_REPLICATION_MODE=master
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-ui
    environment:
      - REDIS_HOSTS=local:redis:6379:0:${REDIS_PASSWORD}
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  redis-data:
    driver: local
```

### redis.conf
```conf
# Network
bind 0.0.0.0
port 6379
protected-mode yes
tcp-backlog 511

# General
daemonize no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16

# Persistence - AOF (Append Only File)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Persistence - RDB (Snapshots)
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Memory Management
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Replication
# replicaof <masterip> <masterport>
# masterauth <master-password>
replica-serve-stale-data yes
replica-read-only yes

# Security
requirepass your-secure-password-here
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# Slow Log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency Monitor
latency-monitor-threshold 100

# Event Notification
notify-keyspace-events ""

# Advanced Config
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
```

## Environment Variables

### Connection Settings
```bash
# Basic Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=securepassword
REDIS_DB=0

# Connection String
REDIS_URL=redis://:securepassword@localhost:6379/0

# SSL/TLS
REDIS_TLS=true
REDIS_TLS_CA_CERT=/path/to/ca.crt
REDIS_TLS_CERT=/path/to/client.crt
REDIS_TLS_KEY=/path/to/client.key

# Sentinel (High Availability)
REDIS_SENTINELS=sentinel1:26379,sentinel2:26379,sentinel3:26379
REDIS_SENTINEL_MASTER_NAME=mymaster
REDIS_SENTINEL_PASSWORD=sentinelpass

# Cluster
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379
```

## Database Allocation

Following the workspace pattern (from `/backend/api/core/database.py`):

```python
# Redis Database Allocation for AI Module
REDIS_DATABASES = {
    0: "sessions",        # User session storage
    1: "cache",          # General application cache
    2: "rate_limit",     # Rate limiting counters
    3: "queue",          # BullMQ job queues
    4: "pubsub",         # Real-time pub/sub channels
    5: "security",       # Security tokens and locks
    6: "tcg",           # TCG game state (if applicable)
    7: "ai",            # AI model cache and embeddings
    8: "analytics",     # Analytics data aggregation
}
```

### Usage Examples
```bash
# Connect to specific database
redis-cli -h localhost -p 6379 -a password -n 7

# Queue database (BullMQ)
redis-cli -h localhost -p 6379 -a password -n 3

# Cache database
redis-cli -h localhost -p 6379 -a password -n 1
```

## Common Use Cases

### 1. Job Queues (BullMQ)

#### Node.js/TypeScript
```typescript
import { Queue, Worker } from 'bullmq';

// Create queue
const scraperQueue = new Queue('web-scraper', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 3, // Queue database
  },
});

// Add job
await scraperQueue.add('scrape', {
  url: 'https://example.com',
  depth: 2,
});

// Worker
const worker = new Worker('web-scraper', async (job) => {
  const { url, depth } = job.data;
  // Process scraping job
  return { pages: 10 };
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 3,
  },
});
```

#### Python (RQ)
```python
from redis import Redis
from rq import Queue

# Connect to Redis
redis_conn = Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD'),
    db=3
)

# Create queue
q = Queue(connection=redis_conn)

# Enqueue job
job = q.enqueue('tasks.scrape_url', 'https://example.com')
```

### 2. Caching

#### Node.js/TypeScript
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1, // Cache database
});

// Set with TTL
await redis.setex('user:123', 3600, JSON.stringify(userData));

// Get
const cached = await redis.get('user:123');
const user = cached ? JSON.parse(cached) : null;

// Delete
await redis.del('user:123');

// Pattern deletion
const keys = await redis.keys('user:*');
if (keys.length > 0) {
  await redis.del(...keys);
}
```

#### Python
```python
import redis
import json

r = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD'),
    db=1  # Cache database
)

# Set with TTL
r.setex('user:123', 3600, json.dumps(user_data))

# Get
cached = r.get('user:123')
user = json.loads(cached) if cached else None

# Delete
r.delete('user:123')
```

### 3. Rate Limiting

```typescript
import Redis from 'ioredis';

const redis = new Redis({ db: 2 }); // Rate limit database

async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}

// Usage
const allowed = await checkRateLimit('api:user:123', 100, 60); // 100 req/min
```

### 4. Pub/Sub

#### Publisher
```typescript
import Redis from 'ioredis';

const redis = new Redis({ db: 4 }); // Pub/sub database

await redis.publish('agent:updates', JSON.stringify({
  agentId: '123',
  status: 'completed',
  result: { /* ... */ }
}));
```

#### Subscriber
```typescript
import Redis from 'ioredis';

const redis = new Redis({ db: 4 });

redis.subscribe('agent:updates', (err, count) => {
  if (err) console.error(err);
  console.log(`Subscribed to ${count} channels`);
});

redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log(`Agent ${data.agentId}: ${data.status}`);
});
```

### 5. Session Storage

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0, // Session database
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 1 day
}));
```

## High Availability

### Redis Sentinel

```yaml
version: '3.8'

services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --requirepass masterpass
    
  redis-replica1:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379 --masterauth masterpass
    depends_on:
      - redis-master
      
  redis-replica2:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379 --masterauth masterpass
    depends_on:
      - redis-master
      
  sentinel1:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
    depends_on:
      - redis-master
      
  sentinel2:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
    depends_on:
      - redis-master
      
  sentinel3:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
    depends_on:
      - redis-master
```

#### sentinel.conf
```conf
port 26379
sentinel monitor mymaster redis-master 6379 2
sentinel auth-pass mymaster masterpass
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 10000
```

### Redis Cluster

```yaml
version: '3.8'

services:
  redis-node1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000
    
  redis-node2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000
    
  redis-node3:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000
```

## Monitoring

### Redis CLI Commands
```bash
# Info
redis-cli INFO

# Stats
redis-cli INFO stats

# Memory
redis-cli INFO memory

# Current connections
redis-cli CLIENT LIST

# Slow queries
redis-cli SLOWLOG GET 10

# Monitor live commands
redis-cli MONITOR

# Keyspace info
redis-cli INFO keyspace

# Check replication
redis-cli INFO replication
```

### Health Check Script
```bash
#!/bin/bash
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD PING
if [ $? -eq 0 ]; then
    echo "Redis is healthy"
    exit 0
else
    echo "Redis is down"
    exit 1
fi
```

## Performance Tuning

### Memory Optimization
```conf
# Eviction policy
maxmemory-policy allkeys-lru  # Options: noeviction, allkeys-lru, volatile-lru, allkeys-random, volatile-random, volatile-ttl

# Compression
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
```

### Persistence Trade-offs

#### AOF (Durability)
- Better durability
- Slower performance
- Larger files

```conf
appendonly yes
appendfsync everysec  # always, everysec, no
```

#### RDB (Performance)
- Better performance
- Periodic snapshots
- Data loss risk

```conf
save 900 1
save 300 10
save 60 10000
```

## Security

### Authentication
```conf
# Password
requirepass your-strong-password

# ACL (Redis 6+)
user default on >password ~* &* +@all
user readonly on >readpass ~* &* +@read
user worker on >workerpass ~queue:* &* +@all
```

### Network Security
```conf
# Bind to specific interfaces
bind 127.0.0.1 ::1

# Protected mode
protected-mode yes

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_abc123"
rename-command SHUTDOWN "SHUTDOWN_abc123"
```

## Backup & Restore

### Manual Backup
```bash
# Save snapshot
redis-cli SAVE

# Background save
redis-cli BGSAVE

# Copy dump file
cp /var/lib/redis/dump.rdb /backup/dump-$(date +%Y%m%d).rdb
```

### Automated Backup
```bash
#!/bin/bash
BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Trigger background save
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD BGSAVE

# Wait for save to complete
while [ $(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD LASTSAVE) -lt $(date +%s) ]; do
    sleep 1
done

# Copy dump file
cp /var/lib/redis/dump.rdb ${BACKUP_DIR}/dump-${DATE}.rdb

# Keep only last 7 days
find ${BACKUP_DIR} -name "dump-*.rdb" -mtime +7 -delete
```

## Best Practices

1. **Use Separate Databases** - Organize by purpose (sessions, cache, queues)
2. **Set Memory Limits** - Prevent Redis from consuming all memory
3. **Choose Eviction Policy** - Match your use case
4. **Enable Persistence** - AOF for durability, RDB for performance
5. **Use Connection Pooling** - Reuse connections
6. **Monitor Performance** - Track slow queries and memory usage
7. **Secure Access** - Use strong passwords and ACLs
8. **Regular Backups** - Automate RDB snapshots
9. **Set TTLs** - Expire keys when appropriate
10. **Use Pipelining** - Batch commands for better performance

## Useful Commands

```bash
# Connect
redis-cli -h localhost -p 6379 -a password -n 0

# Test connection
PING

# Get all keys (use with caution)
KEYS *

# Get keys matching pattern
KEYS user:*

# Get key type
TYPE key

# Get TTL
TTL key

# Set expiration
EXPIRE key 3600

# Delete key
DEL key

# Flush database (dangerous!)
FLUSHDB

# Flush all databases (very dangerous!)
FLUSHALL
```

## Client Libraries

### Node.js
- **ioredis** - Feature-rich, supports cluster/sentinel
- **node-redis** - Official Redis client

### Python
- **redis-py** - Official Python client
- **aioredis** - Async Python client

### Go
- **go-redis** - Type-safe Redis client
- **redigo** - Mature Redis client

### Rust
- **redis-rs** - Redis client for Rust
