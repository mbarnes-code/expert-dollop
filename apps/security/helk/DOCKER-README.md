# HELK + SecurityOnion Docker Deployment

This directory contains a complete Docker Compose deployment that merges HELK and SecurityOnion components for threat hunting and security analytics.

## Overview

This deployment combines:
- **HELK**: Threat hunting platform with Jupyter notebooks and Apache Spark analytics
- **SecurityOnion**: Enterprise security monitoring with ECS-compliant data normalization

### Components

| Service | Description | Port |
|---------|-------------|------|
| Elasticsearch | Search and analytics engine (8.18.8) | 9200, 9300 |
| Kibana | Visualization interface | 5601 |
| Logstash | Event ingestion with ECS normalization | 5044, 5514, 9600 |
| Jupyter | Analytics notebooks with PySpark | 8888 |
| Spark Master | Distributed processing master | 8080, 7077 |
| Spark Worker | Distributed processing worker | 8081 |

## Quick Start (First-Time Installation)

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- 16GB RAM minimum (32GB recommended)
- 100GB disk space
- Linux-based OS (Ubuntu 20.04+, CentOS 8+)

### Installation

```bash
# 1. Run the setup script
./setup.sh

# 2. Update default passwords in docker-compose.yml
#    Search for "changeme" and replace with strong passwords

# 3. Start the stack
docker-compose up -d

# 4. Wait for services to be healthy (2-5 minutes)
docker-compose ps

# 5. Access the interfaces
# Kibana: http://localhost:5601
# Jupyter: http://localhost:8888
# Spark UI: http://localhost:8080
```

## Configuration Merging

### Elasticsearch Configuration

The merged Elasticsearch configuration combines:

**From HELK:**
- Monitoring and analytics capabilities (`xpack.monitoring.collection.enabled=true`)
- Query optimization (`max_clause_count: 4096`)
- Single-node discovery for standalone deployment

**From SecurityOnion:**
- SSL/TLS encryption for secure communication
- Certificate-based authentication
- Disk watermark management (80%, 85%, 90%)
- Index lifecycle policies

**Result:** Secure elasticsearch with both analytics and security features enabled.

### Logstash Pipeline Architecture

The Logstash configuration uses **Elastic Common Schema (ECS)** to normalize data from both HELK and SecurityOnion sources:

```
Input → ECS Normalization → Enrichment → Output
```

#### ECS Normalization

All Windows events, Sysmon data, and other sources are normalized to ECS 8.0:

| Original Field | ECS Field | Description |
|---------------|-----------|-------------|
| `event_data.ProcessId` | `process.pid` | Process ID |
| `event_data.Image` | `process.executable` | Process executable path |
| `event_data.CommandLine` | `process.command_line` | Command line |
| `event_data.SourceIp` | `source.ip` | Source IP address |
| `event_data.DestinationIp` | `destination.ip` | Destination IP |
| `event_data.User` | `user.name` | Username |
| `event_data.TargetFilename` | `file.path` | File path |

#### Pipeline Structure

1. **00-beats-input.conf**: Receives Beats data with ECS mode
2. **50-ecs-windows-normalization.conf**: Converts Windows events to ECS
3. **99-output-elasticsearch.conf**: Outputs to ECS-compliant indices

### Data Stream Format

Events are indexed using ECS data streams:
```
logs-windows-helk-YYYY.MM.dd
```

This format is compatible with both HELK queries and SecurityOnion dashboards.

## Post-Deployment Configuration

### 1. Load Kibana Dashboards

```bash
# Import HELK dashboards
docker exec -it helk-so-kibana bash
cd /usr/share/kibana/dashboards
for file in *.ndjson; do
  curl -X POST "http://localhost:5601/api/saved_objects/_import" \
    -H "kbn-xsrf: true" \
    --form file=@$file
done
```

### 2. Configure Data Sources

#### Winlogbeat Configuration

```yaml
# winlogbeat.yml
output.logstash:
  hosts: ["your-server:5044"]
  ssl.enabled: false

# Enable ECS mode
winlogbeat.ecs.enabled: true
```

#### Filebeat Configuration

```yaml
# filebeat.yml
output.logstash:
  hosts: ["your-server:5044"]
  ssl.enabled: false

# Enable ECS mode
filebeat.ecs.enabled: true
```

### 3. Verify ECS Normalization

```bash
# Check Elasticsearch indices
curl -k https://localhost:9200/_cat/indices?v

# Query ECS-compliant data
curl -k https://localhost:9200/logs-windows-*/_search?pretty
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
│  Winlogbeat  │  Filebeat  │  Syslog  │  Other Beats         │
└──────────────┴─────────────┴──────────┴────────────┬─────────┘
                                                      │
                              ┌───────────────────────▼─────────┐
                              │       Logstash (Port 5044)      │
                              │  - Beats Input (ECS mode)       │
                              │  - ECS Normalization Filters    │
                              │  - HELK Enrichment              │
                              └───────────────┬─────────────────┘
                                              │
                      ┌───────────────────────┴──────────────────┐
                      ▼                                          │
           ┌──────────────────────┐                             │
           │   Elasticsearch      │◄────────────────────────────┘
           │  (Port 9200, 9300)   │
           │  - HELK Config       │
           │  - SecurityOnion SSL │
           │  - ECS Indices       │
           └──────────┬───────────┘
                      │
        ┌─────────────┴────────────────┐
        ▼                              ▼
┌───────────────┐            ┌──────────────────┐
│    Kibana     │            │  Jupyter + Spark │
│  (Port 5601)  │            │  (Port 8888)     │
│  - HELK       │            │  - PySpark       │
│    Dashboards │            │  - GraphFrames   │
│  - SO Config  │            │  - ML Analysis   │
└───────────────┘            └──────────────────┘
```

## ECS Mapping Details

### Windows Event ID Mapping

| Event ID | ECS event.action | ECS event.type | ECS event.category |
|----------|------------------|----------------|-------------------|
| 1 (Sysmon) | process-creation | start | process |
| 3 (Sysmon) | network-connection | connection | network |
| 5 (Sysmon) | process-termination | end | process |
| 7 (Sysmon) | image-load | info | process |
| 8 (Sysmon) | create-remote-thread | creation | process |
| 11 (Sysmon) | file-create | creation | file |
| 13 (Sysmon) | registry-value-set | change | registry |

### ECS Field Coverage

This deployment ensures 100% ECS compliance for:
- ✅ Event metadata (`event.*`)
- ✅ Process fields (`process.*`)
- ✅ Network fields (`source.*`, `destination.*`)
- ✅ User fields (`user.*`)
- ✅ File fields (`file.*`)
- ✅ Registry fields (`registry.*`)
- ✅ Host fields (`host.*`)
- ✅ Agent fields (`agent.*`)

## Troubleshooting

### Elasticsearch Won't Start

```bash
# Check logs
docker logs helk-so-elasticsearch

# Common fix: Increase vm.max_map_count
sudo sysctl -w vm.max_map_count=262144
```

### ECS Fields Not Appearing

```bash
# Verify ECS mode is enabled in beats configuration
# Check Logstash pipeline processing
docker logs helk-so-logstash

# Verify ECS version in data
curl -k https://localhost:9200/logs-windows-*/_search?q=ecs.version:8.0
```

### SSL Certificate Issues

```bash
# Regenerate certificates
rm -rf certs/
./setup.sh

# Or disable SSL (not recommended for production)
# Edit docker-compose.yml and set:
# - xpack.security.http.ssl.enabled=false
```

## Upgrading

### From HELK-only Deployment

1. Export existing data from HELK Elasticsearch
2. Stop HELK containers
3. Run setup.sh to create merged deployment
4. Import data into new Elasticsearch with ECS normalization

### From SecurityOnion-only Deployment

1. This deployment is compatible with SecurityOnion data
2. ECS normalization ensures compatibility
3. Simply point SecurityOnion agents to new Logstash endpoint

## Performance Tuning

### Elasticsearch

```yaml
# docker-compose.yml
environment:
  - ES_JAVA_OPTS=-Xms8g -Xmx8g  # Increase for more memory
```

### Logstash

```yaml
# config/logstash/pipelines.yml
pipeline.workers: 8  # Set to number of CPU cores
```

### Spark

```yaml
# docker-compose.yml spark-worker
environment:
  - SPARK_WORKER_MEMORY=8g  # Increase for large datasets
  - SPARK_WORKER_CORES=8
```

## Security Considerations

1. **Change Default Passwords**: Replace all `changeme` passwords
2. **Enable SSL**: SSL is enabled by default for Elasticsearch
3. **Network Isolation**: Use Docker networks for isolation
4. **Certificate Management**: Rotate certificates regularly
5. **Access Control**: Configure X-Pack security roles

## Monitoring

### Health Checks

```bash
# Check all services
docker-compose ps

# Elasticsearch health
curl -k https://localhost:9200/_cluster/health?pretty

# Logstash stats
curl http://localhost:9600/_node/stats?pretty

# Spark status
curl http://localhost:8080/json/
```

### Resource Usage

```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

## Data Retention

Indices are automatically managed using Elasticsearch ILM:
- **Hot phase**: 30 days, 50GB per shard
- **Warm phase**: 30+ days
- **Cold phase**: 60+ days
- **Delete phase**: 365+ days

Customize in `config/elasticsearch/elasticsearch.yml`.

## Support

- HELK Documentation: https://thehelk.com
- SecurityOnion: https://securityonion.net
- ECS Documentation: https://www.elastic.co/guide/en/ecs/current/
- Issues: Create an issue in the repository

## License

- Expert-Dollop Platform: Apache-2.0
- HELK: GPL-3.0 (Roberto Rodriguez)
- SecurityOnion: Elastic License 2.0
