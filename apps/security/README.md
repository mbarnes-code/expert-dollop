# Security Domain

The Security Domain in expert-dollop provides comprehensive security applications and services for authentication, monitoring, threat hunting, and compliance.

## Applications

### Frontend Applications (Next.js)

1. **auth** - Authentication and authorization
2. **firewall** - Firewall management
3. **scanner** - Security scanning
4. **monitor** - Security monitoring
5. **vault** - Secrets management
6. **compliance** - Compliance tracking
7. **audit** - Audit logging

### Backend Services

#### HELK - Hunting ELK Platform

The HELK (Hunting ELK) module provides advanced threat hunting and analytics capabilities.

**Location**: `apps/security/helk/`

**Features**:
- **Elasticsearch**: Search and analytics engine with SecurityOnion integration
- **Kibana**: 8 pre-built dashboards for threat hunting
- **Logstash**: 70+ pipelines for multi-source event correlation
- **Jupyter Notebooks**: 388 notebooks for analysis and detection
- **Apache Spark**: Distributed data processing with GraphFrames

**Key Capabilities**:
- MITRE ATT&CK framework integration
- Windows Event Log analysis
- Sysmon event correlation
- PowerShell script analysis
- Network traffic analysis (Zeek/Corelight)
- Graph-based relationship analysis

**Documentation**:
- [README](helk/README.md) - Module overview and usage
- [DEPLOYMENT](helk/DEPLOYMENT.md) - Deployment guide
- [MIGRATION](helk/MIGRATION.md) - Migration details

**Quick Start**:
```bash
# Build the module
pnpm nx build security-helk

# View configuration
node dist/apps/security/helk/cli.js config

# Deploy with Docker Compose
node dist/apps/security/helk/cli.js deploy docker-compose
```

## Architecture

### Domain-Driven Design

The Security Domain follows DDD principles:
- **Bounded Contexts**: Each application has its own bounded context
- **Service Layer**: Business logic separated from infrastructure
- **Domain Models**: Type-safe interfaces for all configurations
- **Infrastructure**: Deployment strategies abstracted from business logic

### Integration Points

```
┌─────────────────────────────────────────────────┐
│           Security Domain Services               │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │ Firewall │  │ Scanner  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │             │
│  ┌────┴─────────────┴──────────────┴─────┐      │
│  │         HELK Platform                  │      │
│  ├────────────────────────────────────────┤      │
│  │ Elasticsearch (merged config)          │      │
│  │ Kibana (threat hunting dashboards)     │      │
│  │ Logstash (event correlation)           │      │
│  │ Jupyter (analytics & ML)               │      │
│  │ Spark (distributed processing)         │      │
│  └────────────────────────────────────────┘      │
│                                                  │
└─────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    SecurityOnion          DAPR State Store
    (Salt configs)         (security schema)
```

## HELK and SecurityOnion Integration

HELK is integrated with SecurityOnion elasticsearch configurations using an **additive merge strategy**:

### Configuration Priorities

1. **SecurityOnion** (Security-focused):
   - SSL/TLS encryption
   - Certificate-based authentication
   - Disk watermark management
   - Index lifecycle policies

2. **HELK** (Analytics-focused):
   - Monitoring and collection
   - Query optimization
   - Index templates
   - Data correlation

### Result

A unified Elasticsearch configuration that:
- ✅ Maintains SecurityOnion's security posture
- ✅ Preserves HELK's analytics capabilities
- ✅ Supports both platforms' use cases
- ✅ Provides a single source of truth

## Data Flow

```
External Sources
    ↓
  Beats/Syslog
    ↓
  Logstash (70+ pipelines)
    ↓
  ├─→ Filtering & Enrichment
  ├─→ MITRE ATT&CK Mapping
  ├─→ Event Correlation
  └─→ Fingerprinting
    ↓
  Elasticsearch (merged config)
    ↓
  ├─→ Kibana Dashboards
  └─→ Jupyter/Spark Analytics
```

## Development

### Building

```bash
# Build all security apps
pnpm nx run-many --target=build --projects=security-*

# Build specific app
pnpm nx build security-auth
pnpm nx build security-helk
```

### Testing

```bash
# Test all security apps
pnpm nx run-many --target=test --projects=security-*

# Test HELK module
pnpm nx test security-helk
```

### Linting

```bash
# Lint all security apps
pnpm nx run-many --target=lint --projects=security-*
```

## Use Cases

### Threat Hunting

HELK provides pre-built capabilities for:
- **Process Investigation**: Track process creation chains
- **User Investigation**: Analyze user behavior patterns
- **Host Investigation**: Examine host-level activities
- **Network Investigation**: Analyze network traffic patterns

### Detection Engineering

- **Sigma Rules**: 378 detection rules as Jupyter notebooks
- **Custom Detections**: Python/PySpark for custom logic
- **MITRE ATT&CK**: Pre-mapped to ATT&CK framework
- **Event Correlation**: Multi-source event correlation

### Incident Response

- **Timeline Analysis**: Reconstruct attack timelines
- **Relationship Graphing**: Use GraphFrames for relationships
- **Data Enrichment**: CTI and geolocation enrichment
- **Forensic Analysis**: Deep-dive analysis capabilities

## Resources

### HELK Resources
- **Dashboards**: 8 Kibana dashboards in `helk/resources/dashboards/`
- **Pipelines**: 70+ Logstash configs in `helk/resources/pipelines/`
- **Notebooks**: 388 Jupyter notebooks in `helk/resources/jupyter/`

### External Documentation
- [HELK Project](https://thehelk.com)
- [SecurityOnion](https://securityonion.net)
- [MITRE ATT&CK](https://attack.mitre.org)
- [Elastic Stack](https://www.elastic.co/guide/)

## License

- **Expert-Dollop Platform**: Apache-2.0
- **HELK Module**: Configuration abstractions under Apache-2.0
- **HELK Original Project**: GPL-3.0 (attributed to Roberto Rodriguez)
