# Security AI Integration Analysis

**Date:** 2025-12-03  
**Purpose:** Analyze integration of Dispatch, HELK, YARA-X, and SecurityOnion into apps/security with AI/ML capabilities

## Executive Summary

This analysis evaluates the proposed integration of four security-focused projects (Dispatch, HELK, YARA-X, SecurityOnion) into a unified `apps/security` directory with tight AI/ML integration. The recommendation is to create a **Security AI Platform** that combines threat detection, incident response, pattern matching, and threat hunting with shared AI capabilities from `apps/ai`.

---

## Project Profiles

### 1. Dispatch - Incident Management Platform

**Location:** `features/dispatch/`  
**Technology:** Python (FastAPI), PostgreSQL  
**Purpose:** Incident response and management

**AI/ML Capabilities:**
- **Incident Summarization**: LLM-powered incident summaries
- **Tag Recommendations**: AI-based tag suggestions
- **Tactical Report Generation**: Automated report writing
- **Prompt Management System**: Database-backed prompt versioning
- **Signal Analysis**: Security signal pattern detection
- **Read-in Summaries**: On-call engineer briefings

**Key Components:**
```
src/dispatch/ai/
├── service.py          # Main AI service (30KB+)
├── prompt/             # Prompt management system
│   ├── service.py     # CRUD operations
│   ├── models.py      # Database models
│   └── views.py       # API endpoints
└── plugins/dispatch_openai/
    └── plugin.py      # OpenAI integration
```

**Integration Value:**
- ✅ Production-tested incident AI
- ✅ Prompt management infrastructure
- ✅ OpenAI plugin with structured output
- ✅ Natural fit with security workflows

### 2. HELK - Hunting ELK with ML

**Location:** `features/HELK/`  
**Technology:** Elasticsearch, Logstash, Kibana, Apache Spark, Jupyter  
**Purpose:** Threat hunting platform with advanced analytics

**AI/ML Capabilities:**
- **Apache Spark**: Distributed data processing for ML
- **Jupyter Notebooks**: Interactive data science environment
- **GraphFrames**: Graph analytics for threat correlation
- **Spark ML**: Machine learning pipelines
- **Structured Streaming**: Real-time analytics
- **SQL Analytics**: Declarative threat hunting

**Key Components:**
```
docker/
├── helk-elasticsearch/   # Data storage
├── helk-logstash/       # Data ingestion
├── helk-kibana/         # Visualization
├── helk-spark/          # ML processing
├── helk-jupyter/        # Data science
└── helk-elastalert/     # Alerting with Sigma rules
```

**Sigma Rules:** 30+ pre-built detection rules for:
- DCSync attacks
- LSASS memory dumps
- PowerShell suspicious commands
- Kerberos attacks
- Lateral movement
- Persistence mechanisms

**Integration Value:**
- ✅ ML-powered threat detection
- ✅ Graph analytics for APT hunting
- ✅ Jupyter for custom ML models
- ✅ Real-time streaming analytics
- ✅ Elasticsearch foundation (shared with SecurityOnion)

### 3. YARA-X - Next-Gen Malware Detection

**Location:** `features/yara-x/`  
**Technology:** Rust (high-performance pattern matching)  
**Purpose:** Malware detection via pattern matching rules

**Capabilities:**
- **Pattern Matching**: Binary and textual patterns
- **Rule Engine**: Boolean expressions for detection logic
- **Performance**: Faster than original YARA
- **Safety**: Memory-safe Rust implementation
- **VirusTotal Integration**: Battle-tested at scale

**Example Rule:**
```yara
rule silent_banker : banker {
    meta:
        description = "Banking trojan"
        threat_level = 3
        
    strings:
        $a = {6A 40 68 00 30 00 00 6A 14 8D 91}
        $b = {8D 4D B0 2B C1 83 C0 27 99 6A 4E 59 F7 F9}
        $c = "UVODFRYSIHLNWPEJXQZAKCBGMT"
        
    condition:
        $a or $b or $c
}
```

**AI/ML Integration Opportunities:**
- Use LLMs to generate YARA rules from malware descriptions
- AI-powered rule optimization
- Pattern correlation with threat intelligence
- Automated rule testing and validation

**Integration Value:**
- ✅ Production-ready malware detection
- ✅ Rust performance (billions of files scanned)
- ✅ Extensible rule system
- ✅ VirusTotal heritage

### 4. SecurityOnion - Network Security Monitor

**Location:** `features/securityonion/`  
**Technology:** Python, Suricata, Zeek, Elasticsearch  
**Purpose:** Network security monitoring and threat detection

**AI/ML Capabilities:**
- **Threat Intelligence Analyzers**: Multiple threat feeds
  - EmailRep (email reputation)
  - ThreatFox (malware indicators)
  - VirusTotal integration
  - Spamhaus, GreyNoise, etc.
- **Elasticsearch Integration**: Log analysis and correlation
- **Detection Pipeline**: Multi-stage threat detection
- **Alert Enrichment**: Context from multiple sources

**Key Analyzers:**
```
salt/sensoroni/files/analyzers/
├── elasticsearch/      # Search and correlation
├── emailrep/          # Email threat intel
├── threatfox/         # Malware IOCs
├── virustotal/        # File/URL scanning
├── urlhaus/           # Malicious URL detection
├── otx/               # AlienVault threat intel
└── greynoise/         # IP reputation
```

**Integration Value:**
- ✅ Network-level threat detection
- ✅ Multiple threat intelligence feeds
- ✅ Elasticsearch shared with HELK
- ✅ Analyzer framework for extensibility

---

## Proposed Architecture

### Option A: apps/security with Integrated AI

```
apps/security/
├── dispatch/                    # Incident management (from features)
│   ├── api/                    # FastAPI backend
│   ├── ui/                     # React frontend
│   └── ai/                     # AI capabilities
│       ├── incident-ai/        # Incident summarization
│       └── prompt-manager/     # Shared with libs/ai
│
├── threat-hunting/             # NEW: HELK integration
│   ├── api/                    # Spark/Jupyter APIs
│   ├── ui/                     # Kibana-based UI
│   ├── notebooks/              # Jupyter notebooks
│   └── ml/                     # ML pipelines
│       ├── anomaly-detection/
│       ├── graph-analytics/
│       └── pattern-learning/
│
├── pattern-matching/           # NEW: YARA-X integration
│   ├── api/                    # Rule management API
│   ├── engine/                 # YARA-X engine (Rust)
│   ├── rules/                  # Rule repository
│   └── ai/                     # AI rule generation
│
├── network-monitoring/         # SecurityOnion integration
│   ├── api/                    # Analyzer orchestration
│   ├── analyzers/              # Threat intel analyzers
│   ├── detection/              # Suricata/Zeek integration
│   └── ui/                     # SOC dashboard
│
└── ai-integration/             # Security-specific AI layer
    ├── threat-intel/           # AI-powered threat correlation
    ├── rule-generation/        # LLM-based rule creation
    ├── incident-response/      # Automated response AI
    └── detection-tuning/       # ML-based detection optimization
```

### Option B: apps/ai/threat-hunting (Lighter Integration)

```
apps/ai/
├── threat-hunting/             # Unified security AI service
│   ├── api/
│   │   ├── incidents/         # From Dispatch
│   │   ├── hunting/           # From HELK
│   │   ├── patterns/          # From YARA-X
│   │   └── monitoring/        # From SecurityOnion
│   ├── ui/                    # Unified security dashboard
│   ├── ml/
│   │   ├── spark-pipelines/   # HELK ML
│   │   ├── anomaly-detection/
│   │   └── graph-analytics/
│   └── engines/
│       ├── dispatch-engine/
│       ├── yara-engine/
│       └── analyzer-engine/

apps/security/                  # Keep original services
├── dispatch/                   # Full Dispatch (uses threat-hunting APIs)
├── securityonion/             # Full SecurityOnion (sends to threat-hunting)
└── [HELK remains in features for now]
```

---

## Recommended Approach: Hybrid Security Platform

**Combine both options for maximum flexibility:**

### Phase 1: Core Security Services (apps/security)

```
apps/security/
├── dispatch/                   # Keep as full application
├── securityonion/             # Keep as full application
└── shared/                    # Security-specific shared libs
    ├── threat-intel/          # Threat intelligence clients
    ├── detections/            # Detection rule management
    └── alerting/              # Alert correlation
```

### Phase 2: Security AI Layer (apps/ai/threat-hunting)

```
apps/ai/threat-hunting/
├── api/
│   ├── hunting/               # Threat hunting AI
│   ├── patterns/              # Pattern analysis
│   └── incidents/             # Incident AI
├── ml/
│   ├── helk-integration/      # HELK Spark/Jupyter
│   ├── yara-generation/       # LLM-based YARA rules
│   └── anomaly-detection/     # Behavioral analytics
└── ui/
    └── security-dashboard/    # Unified security AI view
```

### Phase 3: Shared AI Libraries (libs/ai)

**Extract from security projects:**

```
libs/ai/
├── prompt-manager/            # From Dispatch (database-backed)
├── llm-clients/              # From n8n, Dispatch
├── vector-db-clients/        # For Elasticsearch (HELK, SecurityOnion)
├── threat-intel/             # Shared threat intelligence
└── ml-utils/                 # Spark, ML utilities
```

---

## Integration Strategy

### 1. Dispatch Integration

**Keep in:** `apps/security/dispatch/`

**Extract to libs/ai:**
- ✅ Prompt management system → `libs/ai/prompt-manager/`
- ✅ OpenAI plugin → Use shared `libs/ai/llm-clients/`
- ✅ Incident AI prompts → Prompt library

**Connect to apps/ai:**
- Use `apps/ai/chat` for incident collaboration
- Use `apps/ai/analytics` for AI cost tracking
- Feed incidents to `apps/ai/threat-hunting` for correlation

**Value:**
- Incident management stays with security workflows
- Prompt infrastructure shared across monorepo
- AI capabilities available to all services

### 2. HELK Integration

**Create new:** `apps/ai/threat-hunting/`

**Core Components:**
- Elasticsearch cluster (shared with SecurityOnion)
- Apache Spark for ML pipelines
- Jupyter notebooks for data science
- GraphFrames for threat correlation
- Kibana for visualization

**AI Capabilities:**
- **Behavioral Analytics**: Detect anomalies using Spark ML
- **Graph Analytics**: APT hunting via GraphFrames
- **Custom ML Models**: Jupyter notebooks for research
- **Real-time Streaming**: Streaming ML on security events

**Integration Points:**
- Consumes SecurityOnion data (Elasticsearch)
- Uses `libs/ai/vector-db-clients` for Elasticsearch
- Shares ML models with other AI services
- Feeds detections to Dispatch incidents

**Value:**
- Unique ML capabilities (Spark, GraphFrames)
- Production threat hunting platform
- Jupyter for security research
- Elasticsearch synergy with SecurityOnion

### 3. YARA-X Integration

**Create new:** `apps/security/pattern-matching/` or `apps/ai/threat-hunting/patterns/`

**Core Components:**
- YARA-X engine (Rust binary)
- Rule repository and versioning
- REST API for scanning
- Web UI for rule management

**AI Enhancements:**
- **LLM Rule Generation**: Generate YARA rules from malware descriptions
- **Rule Optimization**: AI-powered pattern refinement
- **Threat Correlation**: Link YARA hits to threat intelligence
- **Automated Testing**: AI validates rules against test sets

**Example AI Flow:**
```
1. Analyst: "Create rule for banking trojan with encrypted config"
2. LLM (via apps/ai/chat): Generates YARA rule
3. YARA-X: Validates and optimizes rule
4. SecurityOnion: Deploys rule for scanning
5. HELK: Correlates hits with other indicators
6. Dispatch: Creates incidents for confirmed threats
```

**Integration Points:**
- Use `apps/ai/chat` for natural language rule creation
- Feed detections to `apps/ai/threat-hunting`
- Share rules with SecurityOnion analyzers
- Log usage to `apps/ai/analytics`

**Value:**
- AI-assisted malware detection
- Faster rule development
- Production-proven engine
- Rust performance

### 4. SecurityOnion Integration

**Keep in:** `apps/security/securityonion/`

**Core Components:**
- Suricata/Zeek for network monitoring
- Elasticsearch for log storage (shared with HELK)
- Threat intelligence analyzers
- SOC dashboard

**AI Enhancements:**
- **Alert Correlation**: ML-based alert grouping
- **False Positive Reduction**: Learn from analyst feedback
- **Threat Prioritization**: AI scores alerts by severity
- **Automated Enrichment**: LLM-based context generation

**Integration Points:**
- Sends data to HELK Elasticsearch
- Uses `apps/ai/threat-hunting` for ML analysis
- Creates Dispatch incidents for high-severity alerts
- Deploys YARA-X rules for file scanning

**Value:**
- Network visibility layer
- Multiple threat intel feeds
- Elasticsearch foundation
- SOC workflow integration

---

## Shared Library Extraction Plan

### Priority 1: Immediate Value (1-2 weeks)

**1. libs/ai/prompt-manager/**
- Source: `features/dispatch/src/dispatch/ai/prompt/`
- Database-backed prompt storage
- Versioning and templating
- REST API for CRUD operations

**Benefits:**
- All AI services can manage prompts centrally
- Version control for prompt engineering
- A/B testing infrastructure
- Reusable across security and general AI

**2. libs/ai/vector-db-clients/elasticsearch/**
- Source: `features/securityonion/salt/sensoroni/files/analyzers/elasticsearch/`
- Elasticsearch query builder
- Connection pooling
- Index management

**Benefits:**
- Shared by HELK and SecurityOnion
- Standardized ES interactions
- Performance optimizations
- Single point of maintenance

**3. libs/ai/llm-clients/**
- Source: `features/dispatch/src/dispatch/plugins/dispatch_openai/`
- OpenAI client with structured output
- Error handling and retries
- Token tracking

**Benefits:**
- Consistent LLM usage across services
- Built-in cost tracking
- Error resilience
- Easy provider switching

### Priority 2: Enhanced Capabilities (3-4 weeks)

**4. libs/ai/threat-intel/**
- Source: Multiple SecurityOnion analyzers
- Threat intelligence feed clients
- IOC normalization
- Reputation scoring

**Benefits:**
- Centralized threat intelligence
- Consistent IOC handling
- Feed aggregation
- Caching and rate limiting

**5. libs/ai/ml-utils/**
- Source: HELK Spark notebooks
- Spark utilities
- ML model serialization
- Feature engineering helpers

**Benefits:**
- Reusable ML infrastructure
- Standardized model format
- Shared feature engineering
- Easier experimentation

### Priority 3: Advanced Features (4-6 weeks)

**6. libs/ai/detection-rules/**
- Source: HELK Sigma rules, YARA-X patterns
- Rule management utilities
- Syntax validation
- Performance testing

**Benefits:**
- Cross-tool rule management
- Automated testing
- Version control
- Rule optimization

---

## AI Security Service Nodes

Based on the request to integrate security AI as "AI security service nodes," here's the proposed architecture:

### Architecture: Security AI as Specialized Nodes

```
apps/ai/                        # General AI Platform
├── models/                     # Model registry
├── chat/                       # Chat interface
├── analytics/                  # Usage tracking
└── [security-nodes]/          # Security-specialized AI nodes
    ├── threat-hunting/        # HELK-powered ML threat hunting
    ├── incident-ai/           # Dispatch-powered incident response
    ├── pattern-generation/    # YARA-X rule generation
    └── alert-intelligence/    # SecurityOnion alert AI

apps/security/                  # Security Platform
├── dispatch/                   # Incident management
├── securityonion/             # Network monitoring
├── pattern-matching/          # YARA-X engine
└── [uses apps/ai security-nodes via APIs]

libs/ai/                        # Shared AI Infrastructure
├── prompt-manager/            # From Dispatch
├── vector-db-clients/         # Elasticsearch (HELK, SecurityOnion)
├── llm-clients/               # OpenAI, Anthropic, etc.
├── threat-intel/              # Threat intelligence clients
└── ml-utils/                  # Spark, ML utilities
```

### How It Works:

**1. Threat Hunting Node (`apps/ai/threat-hunting/`)**
- Exposes REST API for ML-powered threat hunting
- Uses HELK's Spark/Jupyter under the hood
- Available to all monorepo services
- Security services get priority access

**2. Incident AI Node (`apps/ai/incident-ai/`)**
- Powered by Dispatch's incident AI
- Summarization, tagging, report generation
- Available to any service that has "incidents"
- Dispatch is primary consumer but not exclusive

**3. Pattern Generation Node (`apps/ai/pattern-generation/`)**
- LLM generates detection rules (YARA, Sigma, Suricata)
- YARA-X validates and optimizes
- API for natural language → detection rule
- Used by security analysts across all tools

**4. Alert Intelligence Node (`apps/ai/alert-intelligence/`)**
- ML-based alert correlation and prioritization
- Learns from SecurityOnion analyzers
- Reduces false positives
- Available to any alerting system

### Benefits of Service Node Approach:

✅ **Reusability**: Security AI available to entire monorepo  
✅ **Specialization**: Each node focused on specific capability  
✅ **Scalability**: Nodes scale independently  
✅ **Discoverability**: All AI in one place (`apps/ai/`)  
✅ **Composability**: Combine nodes for complex workflows  
✅ **Integration**: Security tools remain intact, consume AI via APIs  

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Library Extraction**
- ✅ Extract `libs/ai/prompt-manager` from Dispatch
- ✅ Extract `libs/ai/vector-db-clients/elasticsearch` from SecurityOnion
- ✅ Extract `libs/ai/llm-clients` (enhance existing)
- ✅ Update `apps/security/dispatch` to use new libs
- ✅ Update `apps/security/securityonion` to use new libs

**Week 3-4: Initial AI Nodes**
- Create `apps/ai/incident-ai/` (using Dispatch AI)
- Create `apps/ai/alert-intelligence/` (using SecurityOnion patterns)
- Implement REST APIs for both nodes
- Basic UI for testing

**Deliverables:**
- 3 shared libraries
- 2 AI security nodes
- API documentation
- Integration examples

### Phase 2: ML Infrastructure (Weeks 5-10)

**Week 5-7: HELK Integration**
- Set up `apps/ai/threat-hunting/`
- Deploy Elasticsearch cluster (shared with SecurityOnion)
- Configure Apache Spark
- Deploy Jupyter notebooks
- Implement GraphFrames for threat correlation

**Week 8-10: ML Pipelines**
- Behavioral anomaly detection
- Graph-based APT hunting
- Real-time streaming analytics
- Custom ML model training
- API development

**Deliverables:**
- Threat hunting AI node
- ML pipeline infrastructure
- Jupyter environment
- Spark cluster
- Graph analytics

### Phase 3: Pattern Matching AI (Weeks 11-14)

**Week 11-12: YARA-X Integration**
- Deploy YARA-X engine
- Create rule repository
- Build REST API
- Web UI for rule management

**Week 13-14: AI Enhancement**
- LLM-based rule generation (via `apps/ai/chat`)
- Rule optimization algorithms
- Automated testing framework
- Integration with SecurityOnion

**Deliverables:**
- Pattern generation AI node
- YARA-X API
- Rule management UI
- LLM rule generator

### Phase 4: Integration & Refinement (Weeks 15-18)

**Week 15-16: Cross-Service Integration**
- Connect Dispatch to incident-ai node
- Connect SecurityOnion to alert-intelligence node
- Deploy YARA-X to SecurityOnion
- HELK consumes SecurityOnion data

**Week 17-18: Workflows & Automation**
- End-to-end threat detection workflows
- Automated incident creation
- Alert → Hunting → Incident → Response
- Dashboard and reporting

**Deliverables:**
- Integrated security AI platform
- Automated workflows
- Unified dashboard
- Documentation

---

## Decision Matrix

| Component | Location | AI Enhancement | Integration |
|-----------|----------|----------------|-------------|
| **Dispatch** | `apps/security/dispatch/` | Extract prompts to `libs/ai/prompt-manager` | Uses `apps/ai/incident-ai` node |
| **HELK** | `apps/ai/threat-hunting/` | Core ML platform (Spark, Jupyter) | Shared Elasticsearch with SecurityOnion |
| **YARA-X** | `apps/ai/pattern-generation/` | LLM rule generation | Deployed to SecurityOnion, creates Dispatch incidents |
| **SecurityOnion** | `apps/security/securityonion/` | ML alert correlation | Feeds HELK, uses pattern-generation node |

---

## Answers to User's Questions

### Q: Should these be integrated in apps/security or apps/ai/threat-hunting?

**A: Both, using the service node pattern:**

**apps/security/** - Full applications remain:
- `dispatch/` - Incident management platform
- `securityonion/` - Network monitoring platform
- Optional: `pattern-matching/` for YARA-X engine

**apps/ai/** - AI nodes extracted:
- `threat-hunting/` - HELK ML capabilities as API
- `incident-ai/` - Dispatch AI as reusable service
- `pattern-generation/` - LLM rule generation
- `alert-intelligence/` - ML alert correlation

**Benefits:**
- Security tools stay intact and functional
- AI capabilities available to entire monorepo
- Clear separation of concerns
- Maximum reusability

### Q: Should we extract reusable components to shared libraries?

**A: Yes, absolutely. Priority order:**

1. **libs/ai/prompt-manager/** (from Dispatch) - Immediate value
2. **libs/ai/vector-db-clients/elasticsearch/** (from SecurityOnion, HELK) - Critical for integration
3. **libs/ai/llm-clients/** (enhance existing) - Foundation
4. **libs/ai/threat-intel/** (from SecurityOnion) - Reusable threat intelligence
5. **libs/ai/ml-utils/** (from HELK) - ML infrastructure

### Q: How do the security projects work together?

**A: Integrated security workflow:**

```
1. SecurityOnion monitors network
   ↓
2. Detects suspicious activity
   ↓
3. YARA-X scans files (pattern-generation node)
   ↓
4. HELK correlates with historical data (threat-hunting node)
   ↓
5. Alert-intelligence node scores severity
   ↓
6. High-severity → Dispatch incident (incident-ai node)
   ↓
7. Analyst uses apps/ai/chat for investigation
   ↓
8. Resolution tracked in Dispatch
   ↓
9. Learnings improve ML models (feedback loop)
```

---

## Recommendation Summary

**Adopt the Hybrid Service Node Architecture:**

1. **Keep security platforms in `apps/security/`** (Dispatch, SecurityOnion)
2. **Create AI security nodes in `apps/ai/`** (threat-hunting, incident-ai, pattern-generation, alert-intelligence)
3. **Extract shared components to `libs/ai/`** (prompt-manager, vector-db-clients, threat-intel, ml-utils)
4. **Integrate via REST APIs** - Security platforms consume AI node APIs
5. **Tight integration where it matters** - Shared Elasticsearch, automated workflows

**This approach:**
- ✅ Makes security AI available to entire monorepo
- ✅ Keeps security tools functional and intact
- ✅ Enables composition of AI capabilities
- ✅ Maximizes code reuse without breaking existing systems
- ✅ Provides clear upgrade path (can move components incrementally)
- ✅ Separates concerns (security workflows vs. AI capabilities)

**Next Steps:**
1. Approve hybrid service node architecture
2. Begin Phase 1: Library extraction (4 weeks)
3. Create first AI security nodes (incident-ai, alert-intelligence)
4. Plan HELK integration as threat-hunting node
5. YARA-X integration as pattern-generation node

---

**Report Generated:** 2025-12-03  
**Recommendation:** Hybrid architecture with AI security service nodes  
**Timeline:** 18 weeks for full integration  
**Priority:** Extract shared libraries first (immediate ROI)
