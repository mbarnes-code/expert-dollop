# Security Domain Infrastructure

Shared infrastructure for the security domain, providing common components and services used across multiple security projects.

## Overview

This directory contains unified infrastructure components that are shared across security projects, enabling both data correlation and technology stack standardization.

## Architecture

The infrastructure is organized into two categories:

### 1. Data Platform Infrastructure
Shared data storage, processing, and visualization platforms:
- **elasticsearch/** - Shared Elasticsearch cluster for HELK and Security Onion
- **kibana/** - Unified visualization platform
- **logstash/** - Multi-pipeline data ingestion

### 2. Technology Stack Infrastructure
Shared development frameworks and platforms used across security projects:
- **postgres/** - PostgreSQL database (Dispatch, Ghostwriter)
- **redis/** - Redis cache/queue (Ghostwriter, MISP)
- **clickhouse/** - ClickHouse analytics (RITA)
- **django/** - Django web framework (Ghostwriter)
- **nodejs/** - Node.js/JavaScript (CyberChef, Dispatch frontend, VirusTotal MCP)
- **rust/** - Rust tooling (YARA-X, VS Code CLI)
- **java-maven/** - Java/Maven projects (Software Forensic Kit)

### Key Benefits

- **Data Correlation**: Single Elasticsearch cluster correlates Windows events (HELK) with network traffic (Security Onion)
- **Technology Reuse**: Common database, cache, and framework configurations
- **Reduced Duplication**: Share infrastructure patterns and best practices
- **Simplified Management**: Centralized configuration and deployment
- **Resource Efficiency**: Shared services reduce overall resource consumption

## Components

### Data Platform Infrastructure

#### Elasticsearch
- Unified cluster for all security data
- Index templates for different data types (network, Windows events, etc.)
- Optimized for both real-time monitoring and historical analysis
- Cross-correlation capabilities between host and network data

#### Kibana
- Single pane of glass for security operations
- Dashboards from both HELK and Security Onion
- Unified search across all security data sources
- Threat hunting interface

#### Logstash
- Multiple pipelines for different data sources:
  - HELK pipelines: Windows Event Logs, Sysmon, PowerShell
  - Security Onion pipelines: Zeek, Suricata, network flows
- Enrichment and normalization
- Routing to appropriate Elasticsearch indices

### Technology Stack Infrastructure

#### PostgreSQL
- **Projects**: Dispatch (incident management), Ghostwriter (red team operations)
- **Features**: Relational database, ACID compliance, GraphQL integration (Hasura)
- **Documentation**: See [postgres/README.md](postgres/README.md)

#### Redis
- **Projects**: Ghostwriter (caching/queuing), MISP (background jobs)
### Data Platform
1. **Correlation**: Correlate Windows events with network traffic
2. **Efficiency**: Single Elasticsearch cluster instead of multiple
3. **Unified View**: One dashboard for complete incident picture
4. **Resource Optimization**: Shared JVM, storage, and compute

### Technology Stacks
1. **Standardization**: Common patterns across similar projects
2. **Knowledge Sharing**: Documented best practices
3. **Security**: Consistent security configurations
4. **Maintenance**: Centralized dependency management
- **Projects**: RITA (network traffic analysis)
- **Features**: Columnar storage, time-series data, fast analytical queries
- **Documentation**: See [clickhouse/README.md](clickhouse/README.md)

#### Django
- **Projects**: Ghostwriter (web application framework)
- **Features**: Python web framework, ORM, admin interface, REST API
- **Documentation**: See [django/README.md](django/README.md)

#### Node.js
- **Projects**: CyberChef (crypto/encoding), Dispatch (frontend), VirusTotal MCP, VS Code
- **Features**: JavaScript/TypeScript, web frameworks, build tools
- **Documentation**: See [nodejs/README.md](nodejs/README.md)

#### Rust
- **Projects**: YARA-X (pattern matching), VS Code CLI
- **Features**: Memory safety, high performance, FFI bindings
- **Documentation**: See [rust/README.md](rust/README.md)

#### Java/Maven
- **Projects**: Software Forensic Kit
- **Features**: Bytecode analysis, forensics tools
- **Documentation**: See [java-maven/README.md](java-maven/README.md)

## Data Flow

```
Windows Hosts → HELK Collectors → Logstash (HELK Pipeline) → Elasticsearch → Kibana
Network Traffic → Security Onion → Logstash (SecOnion Pipeline) → Elasticsearch → Kibana
```

## Benefits of Unified Infrastructure

### Data Platform
This infrastructure is orchestrated via `docker-compose.security.yml` in the parent directory.

```bash
# Start the unified security infrastructure
docker-compose -f docker-compose.security.yml up -d elasticsearch kibana logstash

# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Access Kibana
open http://localhost:5601
```

### Technology Stacks
Each technology stack directory provides:
- Configuration templates and examples
- Best practices and design patterns
- Project-specific integration guides
- Security hardening guidelines
- Performance optimization tips

Refer to individual README files for technology-specific usage.ker-compose -f docker-compose.security.yml up -d elasticsearch kibana logstash

# ChREADME.md                              # This file
│
├── Data Platform Infrastructure
├── elasticsearch/                         # Shared Elasticsearch (HELK + Security Onion)
│   ├── Dockerfile
│   ├── config/
│   │   ├── elasticsearch.yml
│   │   └── jvm.options
│   └── index-templates/
│       ├── windows-logs.json              # HELK data structure
│       └── network-data.json              # Security Onion data structure
├── kibana/                                # Unified visualization
│   ├── Dockerfile
│   ├── config/
│   │   └── kibana.yml
│   └── dashboards/
│       ├── helk/                          # Windows threat hunting
│       └── securityonion/                 # Network monitoring
├── logstash/                              # Multi-pipeline ingestion
│   ├── Dockerfile
│   ├── config/
│   │   ├── logstash.yml
│   │   └── pipelines.yml
│   └── pipelines/
│       ├── helk/                          # Windows event pipelines
│       │   ├── windows-events.conf
│       │   ├── sysmon.conf
│       │   └── powershell.conf
│       └── securityonion/                 # Network data pipelines
│           ├── zeek.conf
│           ├── suricata.conf
│           └── pcap.conf
│
├── Technology Stack Infrastructure
├── postgres/                              # PostgreSQL (Dispatch, Ghostwriter)
│   └── README.md
├── redis/                                 # Redis (Ghostwriter, MISP)
│   └── README.md
├── clickhouse/                            # ClickHouse (RITA)
│   └── README.md
├── django/                                # Django (Ghostwriter)
│   └── README.md
├── nodejs/                                # Node.js (CyberChef, Dispatch, etc.)
│   └── README.md
├── rust/                                  # Rust (YARA-X, VS Code CLI)
│   └── README.md
└── java-maven/                            # Java/Maven (Software Forensic Kit)
    └── README.md
│   │   └── kibana.yml                # Kibana configuration
│   └── dashboards/
│       ├── helk/                     # HELK dashboards
│       └── securityonion/            # Security Onion dashboards
└── logstash/
    ├── Dockerfile                    # Custom Logstash image
    ├── config/
    │   └── logstash.yml              # Logstash configuration
    └── pipelines/
        ├── helk/                     # Windows event pipelines
        └── securityonion/            # Network data pipelines
```

## Configuration

### Elasticsearch
- Cluster name: `security-cluster`
- HTTP port: 9200
- Transport port: 9300
- Memory: Configure via JVM options

### Kibana
- Port: 5601
- Elasticsearch URL: `http://elasticsearch:9200`

### Logstash
- Port: 5044 (Beats input)
- Port: 5514 (Syslog input)
- Elasticsearch output: `http://elasticsearch:9200`

## Maintenance

### Index Management
```bash
# List all indices
curl http://localhost:9200/_cat/indices?v

# Check index health
curl http://localhost:9200/_cat/indices?health=yellow

# Delete old indices (curator recommended)
curator delete indices --older-than 90 --time-unit days
```

### Backup
```bash
# Configure snapshot repository
# Backup handled by Elasticsearch snapshot API
```

## Security

- Enable X-Pack security in production
- Configure TLS/SSL for cluster communication
- Implement role-based access control (RBAC)
- Use secrets management for credentials

## Monitoring

- Monitor cluster health via Kibana Stack Monitoring
- Set up alerts for cluster issues
- Track disk usage and plan for growth
- Monitor JVM heap usage

## Troubleshooting

### Elasticsearch won't start
- Check JVM heap size (default: 50% of system memory)
- Verify disk space availability
- Check file descriptor limits

### Kibana can't connect
- Verify Elasticsearch is healthy
- Check network connectivity
- Review Kibana logs

### Logstash pipeline issues
- Check pipeline syntax with `--config.test_and_exit`
- Review Logstash logs for errors
- Verify input/output connectivity
