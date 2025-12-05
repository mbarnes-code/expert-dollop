# HELK Deployment Guide

This guide covers deploying the HELK (Hunting ELK) platform in the expert-dollop security domain.

## Overview

HELK is deployed as a modular monolith with the following components:
- **Elasticsearch**: Search and analytics engine (port 9200)
- **Kibana**: Data visualization (port 5601)
- **Logstash**: Event ingestion and correlation (port 5044, 9600)
- **Jupyter**: Notebook server (port 8888)
- **Apache Spark**: Distributed processing (master: 8080, workers: 8081+)

## Prerequisites

### System Requirements
- 16GB RAM minimum (32GB recommended)
- 4 CPU cores minimum (8 cores recommended)
- 100GB disk space minimum
- Linux-based OS (Ubuntu 20.04+, CentOS 8+, or similar)

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+ (for Docker deployment)
- Kubernetes 1.21+ (for K8s deployment)
- kubectl (for K8s deployment)

## Configuration Merging

HELK integrates with SecurityOnion by combining their Elasticsearch configurations:

### HELK Contributions
- Monitoring and analytics capabilities
- Query optimization (max_clause_count: 4096)
- Index templates for Windows events and Sysmon
- Single-node discovery mode

### SecurityOnion Contributions
- SSL/TLS security configuration
- Certificate-based authentication
- Disk watermark management
- Index lifecycle policies

### Final Merged Configuration
The merged configuration includes:
```yaml
xpack:
  security:
    enabled: true  # From SecurityOnion
    http:
      ssl:
        enabled: true  # From SecurityOnion
  monitoring:
    collection:
      enabled: true  # From HELK
```

## Deployment Options

### Option 1: Docker Compose (Recommended for Development)

1. **Generate Docker Compose file**:
```bash
cd apps/security/helk
node dist/cli.js manifest > docker-compose.yml
```

2. **Create environment file** (`.env`):
```env
ELASTICSEARCH_VERSION=8.18.8
KIBANA_VERSION=8.18.8
LOGSTASH_VERSION=8.18.8
JUPYTER_VERSION=latest
SPARK_VERSION=3.5.0
```

3. **Deploy**:
```bash
docker-compose up -d
```

4. **Verify deployment**:
```bash
# Check Elasticsearch
curl -k https://localhost:9200

# Check Kibana
curl http://localhost:5601/api/status

# Check Spark Master
curl http://localhost:8080
```

### Option 2: Kubernetes (Recommended for Production)

1. **Generate Kubernetes manifests**:
```bash
node dist/cli.js manifest | kubectl apply -f -
```

2. **Create namespace**:
```bash
kubectl create namespace helk
```

3. **Deploy components**:
```bash
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/kibana.yaml
kubectl apply -f k8s/logstash.yaml
kubectl apply -f k8s/jupyter.yaml
kubectl apply -f k8s/spark.yaml
```

4. **Verify deployment**:
```bash
kubectl get pods -n helk
kubectl get services -n helk
```

## Post-Deployment Configuration

### 1. Load Kibana Dashboards

```bash
# From the HELK module directory
cd resources/dashboards
for dashboard in *.ndjson; do
  curl -X POST "localhost:5601/api/saved_objects/_import" \
    -H "kbn-xsrf: true" \
    --form file=@$dashboard
done
```

### 2. Configure Logstash Pipelines

Pipelines are automatically loaded from `resources/pipelines/`. To verify:

```bash
curl http://localhost:9600/_node/pipelines
```

### 3. Access Jupyter Notebooks

1. Navigate to `http://localhost:8888`
2. Notebooks are located in:
   - `/opt/helk/notebooks/tutorials/` - Learning materials
   - `/opt/helk/notebooks/sigma/` - Detection rules
   - `/opt/helk/notebooks/demos/` - Example analyses

### 4. Configure Spark Integration

Jupyter is pre-configured with Spark. To test:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("HELK") \
    .master("spark://helk-spark-master:7077") \
    .config("spark.jars.packages", "org.elasticsearch:elasticsearch-spark-30_2.12:8.0.0") \
    .getOrCreate()

# Test Elasticsearch connection
df = spark.read \
    .format("org.elasticsearch.spark.sql") \
    .option("es.nodes", "elasticsearch") \
    .option("es.port", "9200") \
    .option("es.resource", "logs-*") \
    .load()

df.show()
```

## Data Ingestion

### Beats Configuration

Configure Filebeat/Winlogbeat to send data to Logstash:

```yaml
output.logstash:
  hosts: ["localhost:5044"]
  ssl:
    enabled: false  # Enable if using SSL
```

### Syslog Configuration

For syslog inputs:
- TCP: port 1514
- UDP: port 1514

### Kafka Integration

For Kafka-based ingestion:
```yaml
input {
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["winlogbeat", "sysmon"]
  }
}
```

## Monitoring and Maintenance

### Health Checks

```bash
# Elasticsearch cluster health
curl -k https://localhost:9200/_cluster/health?pretty

# Logstash node info
curl http://localhost:9600/_node/stats

# Spark master status
curl http://localhost:8080/json/
```

### Index Management

```bash
# List indices
curl -k https://localhost:9200/_cat/indices?v

# Delete old indices (example: older than 90 days)
curator_cli --host localhost delete-indices --filter_list \
  '[{"filtertype":"age","source":"name","direction":"older","unit":"days","unit_count":90}]'
```

### Log Rotation

Configure log rotation for each component:

```bash
# Elasticsearch logs
/var/log/elasticsearch/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## Troubleshooting

### Elasticsearch Won't Start

**Issue**: Elasticsearch fails with memory errors

**Solution**:
```bash
# Increase vm.max_map_count
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### Kibana Connection Errors

**Issue**: Kibana can't connect to Elasticsearch

**Solution**:
1. Verify Elasticsearch is running: `curl -k https://localhost:9200`
2. Check Kibana logs: `docker logs helk-kibana`
3. Verify SSL certificates are mounted correctly

### Logstash Pipeline Failures

**Issue**: Logstash pipeline shows errors

**Solution**:
```bash
# Check pipeline configuration
curl http://localhost:9600/_node/pipelines?pretty

# View Logstash logs
docker logs helk-logstash

# Test pipeline syntax
/usr/share/logstash/bin/logstash --config.test_and_exit -f /path/to/config.conf
```

### Jupyter Notebook Connection Issues

**Issue**: Can't connect to Elasticsearch from Jupyter

**Solution**:
```python
# Test Elasticsearch connectivity
import requests
response = requests.get('https://elasticsearch:9200', verify=False)
print(response.status_code)
```

## Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Enable SSL/TLS**: Use certificates from SecurityOnion integration
3. **Network Segmentation**: Use firewalls to restrict access
4. **Authentication**: Enable X-Pack security features
5. **Audit Logging**: Enable audit logs for compliance

## Performance Tuning

### Elasticsearch

```yaml
# In elasticsearch.yml
indices.memory.index_buffer_size: 30%
thread_pool.write.queue_size: 1000
indices.queries.cache.size: 15%
```

### Logstash

```yaml
# In logstash.yml
pipeline.workers: 8  # Set to number of CPU cores
pipeline.batch.size: 250
pipeline.batch.delay: 50
```

### Spark

```properties
# In spark-defaults.conf
spark.executor.memory=8g
spark.driver.memory=8g
spark.executor.cores=4
```

## Backup and Recovery

### Elasticsearch Snapshots

```bash
# Create snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/backup/elasticsearch"
  }
}
'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup/snapshot_1?wait_for_completion=true"

# Restore snapshot
curl -X POST "localhost:9200/_snapshot/backup/snapshot_1/_restore"
```

### Jupyter Notebooks

Notebooks are stored in the persistent volume. Backup regularly:
```bash
docker cp helk-jupyter:/opt/helk/notebooks ./backup/notebooks
```

## Scaling

### Horizontal Scaling

For Elasticsearch:
```yaml
# Add more nodes to docker-compose.yml
elasticsearch-2:
  image: elasticsearch:8.18.8
  environment:
    - node.name=es-node-2
    - cluster.initial_master_nodes=es-node-1,es-node-2
```

For Spark:
```yaml
# Add more workers
spark-worker-2:
  image: spark:3.5.0
  environment:
    - SPARK_MASTER_URL=spark://spark-master:7077
```

## Integration with SecurityOnion

HELK complements SecurityOnion by providing:
- Advanced analytics via Jupyter and Spark
- GraphFrames for relationship analysis
- Pre-built MITRE ATT&CK dashboards
- Multi-source event correlation

Data flows:
```
SecurityOnion → Logstash → Elasticsearch ← Kibana
                                        ← Jupyter/Spark
```

## Support and Resources

- HELK Documentation: https://thehelk.com
- Elasticsearch Guide: https://www.elastic.co/guide/
- Apache Spark Documentation: https://spark.apache.org/docs/
- SecurityOnion Integration: See `features/securityonion/salt/elasticsearch/`

## License

This deployment guide is part of the expert-dollop platform (Apache-2.0).
HELK original project is GPL-3.0 licensed.
