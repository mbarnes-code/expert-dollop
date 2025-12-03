# NUQ PostgreSQL Database

PostgreSQL database schema and configuration for NUQ (New Universal Queue) used by Firecrawl.

## Overview

This directory contains the PostgreSQL schema definition for the NUQ queue system used by Firecrawl. NUQ provides a durable, PostgreSQL-backed queue for managing scraping jobs.

## Files

- `Dockerfile` - PostgreSQL Docker image with NUQ schema
- `nuq.sql` - SQL schema definition for NUQ tables and functions

## Database Schema

The NUQ schema includes:

- **Queue Tables**: Job queue storage with priority support
- **Job Status Tracking**: Current state of each job
- **Retry Logic**: Automatic retry for failed jobs
- **Lock Mechanism**: Prevent duplicate job processing
- **Audit Trail**: Track job history and changes

## Running PostgreSQL with NUQ

### Using Docker

```bash
cd apps/ai/nuq-postgres
docker build -t nuq-postgres .
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password nuq-postgres
```

### Applying the Schema

If you already have PostgreSQL running, you can apply the schema:

```bash
psql -h localhost -U postgres -d firecrawl -f nuq.sql
```

### Using Docker Compose (Recommended)

From the root of the project:

```bash
cd infrastructure/docker
docker-compose up postgres
```

The NUQ schema will be automatically applied during initialization.

## Schema Details

### Queue Structure

The NUQ schema provides:

```sql
-- Job queue table
CREATE TABLE nuq.jobs (
    id SERIAL PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Indexes for performance
CREATE INDEX idx_jobs_queue_status ON nuq.jobs(queue_name, status);
CREATE INDEX idx_jobs_priority ON nuq.jobs(priority DESC);
```

### Queue Operations

The schema includes stored procedures for:
- **Enqueue**: Add jobs to the queue
- **Dequeue**: Get next job from queue
- **Complete**: Mark job as completed
- **Fail**: Mark job as failed
- **Retry**: Retry failed jobs

## Integration with Firecrawl

Firecrawl uses NUQ as an alternative to Redis-based BullMQ for:
- Persistent job storage
- Durable queue operations
- Complex job querying
- Job auditing and history

### Configuration

Set the NUQ database URL in your environment:

```bash
NUQ_DATABASE_URL=postgresql://postgres:password@localhost:5432/firecrawl
```

## Queue Management

### Check Queue Status

```sql
-- View pending jobs
SELECT * FROM nuq.jobs WHERE status = 'pending' ORDER BY priority DESC;

-- Check queue depth
SELECT queue_name, COUNT(*) 
FROM nuq.jobs 
WHERE status = 'pending' 
GROUP BY queue_name;
```

### Monitor Failed Jobs

```sql
-- View failed jobs
SELECT * FROM nuq.jobs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 100;

-- Retry failed jobs
UPDATE nuq.jobs 
SET status = 'pending', retry_count = retry_count + 1 
WHERE status = 'failed' AND retry_count < max_retries;
```

### Clean Old Jobs

```sql
-- Remove completed jobs older than 7 days
DELETE FROM nuq.jobs 
WHERE status = 'completed' 
AND processed_at < NOW() - INTERVAL '7 days';
```

## Backup and Maintenance

### Backup

```bash
pg_dump -h localhost -U postgres -d firecrawl -n nuq > nuq_backup.sql
```

### Restore

```bash
psql -h localhost -U postgres -d firecrawl < nuq_backup.sql
```

### Vacuum

```sql
-- Vacuum to reclaim space
VACUUM ANALYZE nuq.jobs;
```

## Performance Tuning

### Indexes

The schema includes optimized indexes for:
- Queue name and status lookups
- Priority-based job selection
- Time-based queries

### Connection Pooling

For production, use connection pooling:

```bash
# PgBouncer
DATABASE_URL=postgresql://postgres:password@pgbouncer:6432/firecrawl
```

## Monitoring

### Job Statistics

```sql
-- Jobs by status
SELECT status, COUNT(*) as count, AVG(retry_count) as avg_retries
FROM nuq.jobs
GROUP BY status;

-- Queue performance
SELECT 
    queue_name,
    COUNT(*) as total_jobs,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as avg_processing_time
FROM nuq.jobs
WHERE status = 'completed'
GROUP BY queue_name;
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql -h localhost -U postgres -d firecrawl -c "SELECT version();"
```

### Schema Issues

```bash
# Check if schema exists
psql -h localhost -U postgres -d firecrawl -c "\dn"

# Recreate schema
psql -h localhost -U postgres -d firecrawl -f nuq.sql
```

## License

MIT
