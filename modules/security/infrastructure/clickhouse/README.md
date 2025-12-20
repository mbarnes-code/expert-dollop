# ClickHouse Infrastructure

Shared ClickHouse database infrastructure for analytical workloads and time-series data.

## Projects Using ClickHouse

### RITA (Real Intelligence Threat Analytics)
- **Path**: `modules/security/rita`
- **Version**: Variable (set via CLICKHOUSE_VERSION env var)
- **Purpose**: Network traffic analysis, beacon detection, threat hunting
- **Use Cases**:
  - Zeek log analysis
  - Time-series network data
  - Large-scale log aggregation
  - Fast analytical queries

## Common Configuration Files

### Docker Configuration
```yaml
# docker-compose example
clickhouse:
  image: clickhouse/clickhouse-server:${CLICKHOUSE_VERSION}
  hostname: clickhouse
  ports:
    - "8123:8123"  # HTTP interface
    - "9000:9000"  # Native protocol
  volumes:
    - clickhouse_data:/var/lib/clickhouse
    - ./clickhouse/config.xml:/etc/clickhouse-server/config.xml
    - ./clickhouse/users.xml:/etc/clickhouse-server/users.xml
  networks:
    - security-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "clickhouse-client", "--query", "SELECT 1"]
    interval: 30s
    timeout: 10s
    retries: 5
```

### config.xml
```xml
<?xml version="1.0"?>
<yandex>
    <logger>
        <level>information</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>10</count>
    </logger>

    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <interserver_http_port>9009</interserver_http_port>

    <listen_host>0.0.0.0</listen_host>

    <max_connections>4096</max_connections>
    <keep_alive_timeout>3</keep_alive_timeout>
    <max_concurrent_queries>100</max_concurrent_queries>

    <path>/var/lib/clickhouse/</path>
    <tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

    <users_config>users.xml</users_config>
    <mark_cache_size>5368709120</mark_cache_size>
</yandex>
```

### users.xml
```xml
<?xml version="1.0"?>
<yandex>
    <users>
        <default>
            <password></password>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
        </default>
        
        <rita>
            <password_sha256_hex><!-- SHA256 hash of password --></password_sha256_hex>
            <networks>
                <ip>172.16.0.0/12</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
        </rita>
    </users>

    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>random</load_balancing>
        </default>
    </profiles>

    <quotas>
        <default>
            <interval>
                <duration>3600</duration>
                <queries>0</queries>
                <errors>0</errors>
                <result_rows>0</result_rows>
                <read_rows>0</read_rows>
                <execution_time>0</execution_time>
            </interval>
        </default>
    </quotas>
</yandex>
```

## Use Cases

### Network Traffic Analysis
- High-volume log ingestion (Zeek, Suricata)
- Time-series queries
- Aggregations over billions of rows
- Fast filtering and grouping

### Threat Hunting
- Beacon detection (C2 communication patterns)
- Long connection analysis
- DNS tunneling detection
- Data exfiltration patterns

### Performance Characteristics
- Columnar storage (excellent compression)
- Vectorized query execution
- Parallel processing
- Real-time ingestion and querying

## Connection Strings

```bash
# CLI
clickhouse-client --host localhost --port 9000 --user default

# HTTP interface
curl 'http://localhost:8123/?query=SELECT 1'

# Python
from clickhouse_driver import Client
client = Client('localhost', port=9000, user='rita', password='password')

# JDBC
jdbc:clickhouse://localhost:8123/default
```

## Schema Design Best Practices

### Table Engines
- **MergeTree**: Default for most use cases
- **ReplacingMergeTree**: Deduplication
- **SummingMergeTree**: Pre-aggregated data
- **AggregatingMergeTree**: Complex aggregations

### Partitioning
```sql
-- Partition by date for time-series data
PARTITION BY toYYYYMM(timestamp)

-- TTL for automatic data cleanup
TTL timestamp + INTERVAL 90 DAY
```

### Indexing
```sql
-- Primary key (sorting key)
ORDER BY (timestamp, source_ip, dest_ip)

-- Skip indices for better filtering
INDEX idx_protocol protocol TYPE set(10) GRANULARITY 4
```

## Performance Tuning

### Memory Settings
- `max_memory_usage`: Per-query limit (default 10GB)
- `max_bytes_before_external_sort`: Spill to disk threshold
- `mark_cache_size`: Mark cache for faster queries

### Query Optimization
- Use `PREWHERE` for filtering large datasets
- Leverage partition pruning
- Use sampling for exploratory queries
- Materialize frequently used aggregations

### Ingestion Optimization
- Batch inserts (not row-by-row)
- Use async inserts for high throughput
- Optimize partition size (100GB-1TB per partition)

## Monitoring

### Key Metrics
- Query execution time
- Memory usage
- Disk I/O
- Number of parts (MergeTree tables)
- Background merge activity
- Replication lag (if clustered)

### System Tables
```sql
-- Active queries
SELECT * FROM system.processes;

-- Query log
SELECT * FROM system.query_log ORDER BY event_time DESC LIMIT 10;

-- Table sizes
SELECT 
    database,
    table,
    formatReadableSize(sum(bytes)) AS size
FROM system.parts
GROUP BY database, table
ORDER BY sum(bytes) DESC;
```

## Backup & Recovery

```bash
# Backup
clickhouse-client --query "BACKUP TABLE rita.network_logs TO Disk('backups', 'logs_backup')"

# Restore
clickhouse-client --query "RESTORE TABLE rita.network_logs FROM Disk('backups', 'logs_backup')"

# Alternative: filesystem snapshot
# Stop writes, freeze tables, copy data directory
```

## Security

- **Authentication**: Always set passwords (avoid default empty password)
- **Network**: Bind to private network, use firewall rules
- **Encryption**: Enable SSL/TLS for production
- **Users**: Create limited users per application
- **Quotas**: Prevent resource exhaustion
- **Access Control**: Row-level security (ClickHouse 21.x+)

## Integration with RITA

RITA uses ClickHouse to:
1. Store parsed Zeek logs
2. Detect C2 beaconing behavior
3. Identify long connections
4. Analyze DNS queries
5. Correlate threat intelligence

### RITA Schema Example
```sql
CREATE TABLE IF NOT EXISTS network_connections (
    timestamp DateTime,
    source_ip IPv4,
    dest_ip IPv4,
    dest_port UInt16,
    protocol String,
    bytes_sent UInt64,
    bytes_received UInt64,
    duration Float32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, source_ip, dest_ip)
TTL timestamp + INTERVAL 90 DAY;
```

## Resources

- Official Documentation: https://clickhouse.com/docs
- RITA Integration: See `modules/security/rita/` for specific schemas
- ClickHouse Playground: https://play.clickhouse.com
