expert-dollop/
│
├── modules/                              # DOMAIN-BASED (like Nemesis "projects")
│   │
│   ├── security/                        # Security Domain
│   │   ├── ghostwriter/                 # Complete product 
│   │   ├── nemesis/                     # Complete product    
│   │   ├── misp/                        # MISP integration
│   │   ├── maltrail/                    # Maltrail service
│   │   ├── yara-x/                      # YARA-X service
│   │   ├── dispatch/                    # Security dispatch
│   │   ├── cyberchef/                   # CyberChef
│   │   ├── helk/                        # HELK
│   │   ├── hexstrike-ai/                # HexStrike AI
│   │   ├── securityonion/               # Security Onion
│   │   ├── securityonion-n8n-workflows/ # Security Onion N8N workflows
│   │   ├── rita/                        # RITA
│   │   ├── it-tools/                    # IT tools
│   │   ├── vscode/                      # VS Code
│   │   ├── apiscout/                    # API Scout
│   │   ├── blackarch/                   # BlackArch
│   │   ├── Brute-Ratel-C4-Community-Kit/ # Brute Ratel C4
│   │   ├── lscript/                     # LScript
│   │   ├── meterpreter/                 # Meterpreter
│   │   ├── onex/                        # OneX
│   │   ├── software-forensic-kit/       # Software Forensic Kit
│   │   ├── malwarebazaar-mcp/           # MalwareBazaar MCP
│   │   ├── virustotal-mcp/              # VirusTotal MCP
│   │   ├──infrastructure/               # Security-specific infrastructure
│   │   │   ├── postgres/                # Module-specific PostgreSQL schemas
│   │   │   │   ├── dispatch.sql         # Dispatch routing schema
│   │   │   │   ├── ghostwriter.sql      # Ghostwriter content mgmt schema  
│   │   │   │   └── nemesis.sql          # Nemesis project schema
│   │   │   ├── dapr/                    # Module-specific DAPR components
│   │   │   │   ├── statestore-dispatch.yaml
│   │   │   │   ├── statestore-ghostwriter.yaml
│   │   │   │   └── statestore-nemesis.yaml
│   │   │   ├── bullmq/                  # Module-specific job queues
│   │   │   │   ├── dispatch.ts          # Dispatch routing queues
│   │   │   │   ├── ghostwriter.ts       # Ghostwriter export queues
│   │   │   │   └── nemesis.ts           # Nemesis processing queues
│   │   │   ├── elasticsearch/           # Shared Elasticsearch (HELK + Security Onion)
│   │   │   │   ├── config/
│   │   │   │   └── index-templates/
│   │   │   ├── kibana/                  # Unified visualization platform
│   │   │   ├── logstash/                # Multi-pipeline data ingestion
│   │   │   │   ├── config/
│   │   │   │   └── pipelines/
│   │   │   ├── clickhouse/              # ClickHouse analytics (RITA)
│   │   │   └── java-maven/              # Java/Maven (Software Forensic Kit)
│   │   ├── docker-compose.yml           # Security domain compose
│   │   └── README.md                    # Security domain overview
│   │
│   ├── tcg/                             # Trading Card Game Domain
│   │   ├── commander-spellbook/         # Complete product
│   │   ├── commander-map/               # Commander map
│   │   ├── scripting-toolkit/           # Scripting toolkit
│   │   ├──infrastructure/               # TCG-specific infrastructure
│   │   │   ├── postgres/                # Module-specific PostgreSQL schema
│   │   │   │   └── tcg.sql              # Trading card game schema
│   │   │   ├── dapr/                    # Module-specific DAPR component
│   │   │   │   └── statestore-tcg.yaml
│   │   │   ├── bullmq/                  # Module-specific job queues
│   │   │   │   ├── mtg.ts               # MTG card analysis & deck optimization
│   │   │   │   └── tools.ts             # Spellbook combo search
│   │   │   └── data-science/            # Data science stack (NumPy, Pandas, UMAP, scikit-learn, HDBSCAN)
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   ├── productivity/                    # Productivity Domain
│   │   ├── mealie/                      # Complete product
│   │   ├── actual/                      # Budget app
│   │   ├──infrastructure/               # Productivity-specific infrastructure
│   │   │   ├── postgres/                # Module-specific PostgreSQL schema
│   │   │   │   └── mealie.sql           # Recipe management schema
│   │   │   ├── dapr/                    # Module-specific DAPR component
│   │   │   │   └── statestore-mealie.yaml
│   │   │   ├── bullmq/                  # Module-specific job queues
│   │   │   │   ├── mealie.ts            # Recipe import & image processing
│   │   │   │   └── actual.ts            # Budget sync & backup
│   │   │   ├── sqlite/                  # SQLite (Actual local-first database with better-sqlite3)
│   │   │   └── electron/                # Electron 38 (Actual desktop app)
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   ├── workflow/                        # Workflow Automation Domain
│   │   ├── n8n/                         # Complete product
│   |   ├── n8n-mcp/                     # n8n MCP Server
│   |   ├── mcp-hub/                     # MCP router
│   |   ├──infrastructure/               # Workflow-specific infrastructure
│   |   │   ├── bullmq/                  # Module-specific job queues
│   |   │   │   └── n8n.ts               # N8N workflow, webhook, execution queues
│   |   │   └── mcp-sdk/                 # Model Context Protocol SDK (@modelcontextprotocol/sdk)
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   └── ai/                              # AI/ML Domain
│       ├── firecrawl/                   # Complete product
│       ├── analytics/                   # Analytics service
│       ├── goose/                       # Goose AI
│       ├── NVIDIA/                      # NVIDIA models
│       ├── inspector/                   # Inspector
│       ├── kasmvnc/                     # KasmVNC
│       ├── html-to-md-service/          # HTML to Markdown service
│       ├── playwright-service/          # Playwright service
│       ├── nuq-postgres/                # Nuq Postgres
│       ├── chroma-mcp/                  # Chroma MCP
│       ├── firecrawl-mcp/               # Firecrawl MCP
│       ├── filescope-mcp/               # FileScope MCP
│       ├──infrastructure/               # AI-specific infrastructure
│       │   ├── postgres/                # Module-specific PostgreSQL schemas
│       │   │   ├── firecrawl.sql        # Web scraping schema
│       │   │   ├── goose.sql            # AI assistant schema
│       │   │   └── hexstrike.sql        # HexStrike game schema
│       │   ├── dapr/                    # Module-specific DAPR components
│       │   │   ├── statestore-firecrawl.yaml
│       │   │   ├── statestore-goose.yaml
│       │   │   ├── statestore-hexstrike.yaml
│       │   │   ├── pubsub-firecrawl.yaml
│       │   │   └── pubsub-goose.yaml
│       │   ├── bullmq/                  # Module-specific job queues
│       │   │   ├── inspector.ts         # Inspector analysis queue
│       │   │   └── filescope.ts         # FileScope indexing & dependency analysis
│       │   └── golang/                  # Go (HTML-to-MD service)
│		├── docker-compose-models.yml    # AI domain models 
│       ├── docker-compose.yml
│       └── README.md
│
├── apps/                                # CROSS-DOMAIN APPLICATIONS
│   ├── portal/                          # Public website (entry point)
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── omninexus/                       # Admin dashboard (power users)
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       └── vite.config.ts
│
├── libs/                                # TRULY SHARED CODE ONLY
│   ├── shared/                          # Cross-domain utilities
│   │   ├── auth/                        # Shared auth utilities
│   │   ├── database/                    # DB connection pooling
│   │   ├── logging/                     # Logging utilities
│   │   └── monitoring/                  # Monitoring utilities
│   │
│   ├── api-client/                      # Generated API clients
│   │   ├── python/                      # Python client
│   │   └── typescript/                  # TypeScript client
│   │
│   └── ui-components/                   # Shared React components
│       └── src/
│
├── infrastructure/                      # TRULY SHARED Infrastructure only
│   ├── gateway/                         # Stage 1: Edge/API Gateway layer
│   │   ├── traefik/                     # Reverse proxy & load balancer
│   │   │   ├── config/
│   │   │   └── certs/
│   │   ├── kong/                        # API Gateway (optional)
│   │   └── nginx/                       # Alternative reverse proxy
│   │
│   ├── runtimes/                        # Stage 2: Language runtimes & frameworks (shared by 2+ modules)
│   │   ├── nodejs-typescript/           # Node.js/TypeScript (5 modules: security, tcg, productivity, workflow, ai)
│   │   ├── python/                      # Python (3 modules: tcg, productivity, ai)
│   │   ├── django/                      # Django framework (2 modules: security, tcg)
│   │   ├── rust/                        # Rust tooling (2 modules: security, ai)
│   │   └── jupyter/                     # Jupyter Notebooks (2 modules: tcg, ai)
│   │
│   ├── middleware/                      # Stage 3: Core infrastructure services
│   │   ├── redis/                       # Shared Redis instance (connection pooling, core cache)
│   │   │   └── configs/
│   │   ├── rabbitmq/                    # Message broker (DAPR pub/sub, Celery)
│   │   ├── dapr/                        # DAPR runtime config (NOT module-specific components)
│   │   │   └── config/
│   │   └── bullmq/                      # BullMQ base configuration (NOT module-specific queues)
│   │       └── config/
│   │
│   ├── data/                            # Stage 4: Core data persistence
│   │   ├── postgres/                    # PostgreSQL instance (NOT module-specific schemas)
│   │   │   ├── init/                    # Database initialization scripts
│   │   │   └── config/
│   │   └── hasura/                      # GraphQL engine
│   │       └── metadata/
│   │
│   ├── ai-platform/                     # AI/ML platform services (cross-module)
│   │   ├── litellm/                     # LLM proxy/gateway
│   │   └── tika/                        # Document extraction service
│   │
│   ├── observability/                   # Monitoring & Logging (all modules)
│   │   ├── grafana/                     # Dashboards & visualization
│   │   │   └── provisioning/
│   │   ├── prometheus/                  # Metrics collection
│   │   ├── loki/                        # Log aggregation
│   │   ├── promtail/                    # Log shipping
│   │   ├── jaeger/                      # Distributed tracing
│   │   ├── otel-collector/              # OpenTelemetry collector
│   │   └── postgres-exporter/           # PostgreSQL metrics
│   │
│   ├── docker/                          # Shared Docker configs
│   │   ├── docker-compose.yml           # Base compose
│   │   ├── Dockerfile.django            # Shared Django image
│   │   └── Dockerfile.fastapi           # Shared FastAPI image
│   │
│   └── kubernetes/                      # K8s manifests
│       ├── base/
│       └── overlays/
│
├── docs/                                # Documentation
├── tests/                               # Integration/E2E tests
├── scripts/                             # Build/deployment scripts
│
├── docker-compose.yml                   # Root compose (includes all domains)
├── docker-compose.security.yml          # Security domain override
├── docker-compose.tcg.yml               # TCG domain override
├── docker-compose.productivity.yml      # Productivity domain override
├── docker-compose.workflow.yml          # Workflow domain override
│
├── package.json                         # Root workspace
├── pnpm-workspace.yaml
├── nx.json
└── README.md