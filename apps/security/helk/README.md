# HELK - Hunting ELK Module

This module contains the HELK (Hunting ELK) platform integrated into the expert-dollop security domain using the strangler fig pattern. HELK is an advanced threat hunting platform with analytics capabilities including Elasticsearch, Kibana, Logstash, Jupyter notebooks, and Apache Spark.

## 🚀 Quick Start (First-Time Installation)

For first-time users installing the complete HELK + SecurityOnion platform:

```bash
cd apps/security/helk

# Run the setup script
./setup.sh

# Start the Docker stack
docker-compose up -d

# Access the services
# Kibana: http://localhost:5601
# Jupyter: http://localhost:8888
# Spark UI: http://localhost:8080
```

See **[DOCKER-README.md](DOCKER-README.md)** for complete Docker deployment guide with ECS normalization.

## Overview

The HELK module provides:
- **Elasticsearch**: Search and analytics engine with combined HELK and SecurityOnion configurations
- **Kibana**: Data visualization and exploration
- **Logstash**: Multi-source event correlation with **Elastic Common Schema (ECS)** normalization
- **Jupyter Notebooks**: Advanced analytics with Python, PySpark, and GraphFrames
- **Apache Spark**: Distributed data processing for large-scale analysis

### Docker Deployment (Recommended)

This module includes a complete Docker Compose deployment that:
- ✅ Merges HELK and SecurityOnion containers
- ✅ Normalizes all data to **Elastic Common Schema (ECS) 8.0**
- ✅ Provides SSL/TLS encryption
- ✅ Includes automated setup for first-time users
- ✅ Supports both HELK analytics and SecurityOnion security features

## Architecture

This module follows Domain-Driven Design (DDD) and modular monolith best practices:

### Domain Layer
- `domain/elasticsearch-config.interface.ts` - Elasticsearch configuration contracts
- `domain/kibana-config.interface.ts` - Kibana configuration contracts
- `domain/logstash-config.interface.ts` - Logstash pipeline contracts
- `domain/jupyter-config.interface.ts` - Jupyter and Spark configuration contracts

### Service Layer
- `services/elasticsearch-config.service.ts` - Elasticsearch configuration management
- `services/kibana-config.service.ts` - Kibana dashboard management
- `services/logstash-config.service.ts` - Logstash pipeline orchestration
- `services/jupyter-config.service.ts` - Jupyter and Spark configuration
- `services/helk-orchestrator.service.ts` - Main orchestrator coordinating all services

## Configuration Merging

The Elasticsearch configuration combines:
1. **Base Configuration**: Common settings for both platforms
2. **HELK Configuration**: HELK-specific settings (monitoring, indices, discovery)
3. **SecurityOnion Configuration**: Security-focused settings (SSL, authentication, disk management)

The merge is **additive**, meaning:
- SecurityOnion security settings (SSL, authentication) take precedence
- HELK analytics capabilities (monitoring, query limits) are preserved
- Both configurations contribute to the final merged config

## Critical Preserved Components

### From HELK
- **Elasticsearch Templates**: Index templates for Windows events and Sysmon data
- **Kibana Dashboards**: 8 pre-built dashboards including:
  - Global Dashboard
  - Sysmon Dashboard
  - MITRE ATT&CK coverage
  - Host/Process/User Investigation views
- **Logstash Pipelines**: 70+ pipeline configurations for:
  - Multi-source inputs (Kafka, Beats, Syslog)
  - Event correlation and enrichment
  - Windows Event Log processing
  - Sysmon analysis
  - PowerShell script analysis
  - Zeek/Corelight network data
  - MITRE ATT&CK mapping
- **Jupyter Notebooks**: 388 notebooks including:
  - Tutorials (Python, NumPy, Pandas, PySpark, GraphFrames)
  - Sigma rule detections
  - Demos and analysis examples

### From SecurityOnion
- **Elasticsearch Security**: SSL/TLS configuration, authentication
- **Disk Management**: Watermark thresholds for disk usage
- **Index Lifecycle Management**: Retention policies
- **Component Templates**: Reusable mapping and settings templates

## Usage

```typescript
import { getHELKOrchestrator } from '@expert-dollop/security-helk';

// Get the orchestrator
const helk = getHELKOrchestrator();

// Access individual services
const esService = helk.getElasticsearchService();
const kibanaService = helk.getKibanaService();
const logstashService = helk.getLogstashService();
const jupyterService = helk.getJupyterService();

// Get merged Elasticsearch configuration
const esConfig = esService.getMergedConfig();

// Get all Kibana dashboards
const dashboards = kibanaService.getDashboards();

// Get Logstash pipelines
const pipelines = logstashService.getPipelines();

// Get Jupyter notebooks
const notebooks = jupyterService.getNotebooks();

// Generate complete deployment manifest
const manifest = helk.generateDeploymentManifest();

// Validate configuration
const validation = helk.validateConfiguration();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Resources

### Dashboards
Located in `resources/dashboards/`:
- 8 HELK dashboard definitions in NDJSON format

### Pipelines
Located in `resources/pipelines/`:
- 70+ Logstash pipeline configuration files
- Organized by priority (input: 0-99, filter: 100-8999, output: 9000+)

### Jupyter Notebooks
Located in `resources/jupyter/`:
- `tutorials/`: Learning resources for Python, Spark, and GraphFrames
- `sigma/`: Sigma rule detection notebooks
- `demos/`: Example analysis workflows

## Integration with SecurityOnion

This module is designed to work alongside SecurityOnion elasticsearch configurations. The merged configuration:
- Uses SecurityOnion's SSL/TLS setup for secure communication
- Preserves HELK's analytics and monitoring capabilities
- Combines disk management settings from both platforms
- Maintains compatibility with both SecurityOnion and HELK indices

## Dependencies

- Elasticsearch 8.x
- Kibana 8.x
- Logstash 8.x
- Jupyter Notebook
- Apache Spark 3.x
- GraphFrames 0.8.2+

## Development

```bash
# Build the module
pnpm nx build security-helk

# Lint
pnpm nx lint security-helk

# Test
pnpm nx test security-helk
```

## License

Apache-2.0 (matching the expert-dollop platform)

Note: HELK original project is GPL-3.0 licensed. This integration module provides configuration abstractions and is licensed under Apache-2.0.
