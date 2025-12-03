# Redis Database Configuration

This directory contains Redis configurations for the expert-dollop platform.

## Database Allocation

Redis databases are numbered 0-15 by default. This project uses databases 0-8:

| Database | Purpose | Description |
|----------|---------|-------------|
| 0 | sessions | User session storage |
| 1 | cache | Application cache |
| 2 | rate_limit | Rate limiting counters |
| 3 | queue | Background job queues (BullMQ) |
| 4 | pubsub | Real-time pub/sub channels |
| 5 | security | Security tokens and locks |
| 6 | tcg | TCG game state cache |
| 7 | ai | AI model cache and embeddings |
| 8 | analytics | Analytics data aggregation |

## BullMQ Integration

Redis database 3 is dedicated to BullMQ job queues. All Node.js projects share the centralized BullMQ infrastructure located at `/infrastructure/bullmq/`.

See [BullMQ Infrastructure README](../bullmq/README.md) for detailed usage instructions.

## Configuration Files

- `redis.conf` - Main Redis configuration
- `sentinel.conf` - Redis Sentinel for high availability
- `cluster.conf` - Redis Cluster configuration (optional)

## Usage

```bash
# Connect to specific database
redis-cli -n 0  # sessions
redis-cli -n 1  # cache
redis-cli -n 2  # rate_limit
```
