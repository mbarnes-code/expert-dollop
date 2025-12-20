expert-dollop/
│
├── modules/                              # DOMAIN-BASED (like Nemesis "projects")
│   │
│   ├── security/                         # Security Domain
│   │   ├── ghostwriter/                  # Complete product (keeps internal structure)
│   │   │   ├── ghostwriter/             # Django apps (internal)
│   │   │   │   ├── commandcenter/
│   │   │   │   ├── reporting/
│   │   │   │   ├── rolodex/
│   │   │   │   └── shepherd/
│   │   │   ├── config/                  # Django settings (internal)
│   │   │   ├── compose/                 # Docker configs (internal)
│   │   │   ├── javascript/              # Frontend (internal)
│   │   │   ├── manage.py
│   │   │   ├── requirements.txt
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   ├── nemesis/                     # Complete product (keeps internal structure)
│   │   │   ├── libs/                    # Nemesis-specific libs (internal)
│   │   │   │   ├── chromium/
│   │   │   │   ├── common/
│   │   │   │   └── file_enrichment_modules/
│   │   │   ├── projects/                # Nemesis services (internal)
│   │   │   │   ├── agents/
│   │   │   │   ├── web_api/
│   │   │   │   ├── file_enrichment/
│   │   │   │   └── frontend/
│   │   │   ├── infra/                   # Nemesis-specific infra (internal)
│   │   │   ├── tools/
│   │   │   ├── compose.yaml
│   │   │   ├── pyproject.toml
│   │   │   └── README.md
│   │   │
│   │   ├── misp/                        # MISP integration
│   │   │   ├── src/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │   │
│   │   ├── maltrail/                    # Maltrail service
│   │   ├── yara-x/                      # YARA-X service
│   │   ├── goose/                       # Goose AI (security aspects)
│   │   │
│   │   ├── docker-compose.yml           # Security domain compose
│   │   └── README.md                    # Security domain overview
│   │
│   ├── tcg/                             # Trading Card Game Domain
│   │   ├── spellbook/                   # Complete product (keeps internal structure)
│   │   │   ├── backend/                 # Django backend (internal)
│   │   │   │   ├── backend/            # Django project
│   │   │   │   ├── spellbook/          # Django app
│   │   │   │   ├── common/
│   │   │   │   └── manage.py
│   │   │   ├── bot/                     # Bots (internal)
│   │   │   │   ├── discord/
│   │   │   │   ├── reddit/
│   │   │   │   └── telegram/
│   │   │   ├── client/                  # API clients (internal)
│   │   │   ├── docker-compose.yml
│   │   │   ├── requirements.txt
│   │   │   └── README.md
│   │   │
│   │   ├── marketplace/                 # Marketplace service
│   │   ├── analytics/                   # TCG analytics
│   │   ├── collection/                  # Collection manager
│   │   │
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   ├── productivity/                    # Productivity Domain
│   │   ├── mealie/                      # Complete product
│   │   │   ├── src/                     # FastAPI app (internal)
│   │   │   ├── frontend/                # Vue frontend (internal)
│   │   │   ├── alembic/
│   │   │   ├── pyproject.toml
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   ├── dispatch/                    # Complete product
│   │   │   ├── src/                     # FastAPI app (internal)
│   │   │   ├── frontend/                # React frontend (internal)
│   │   │   ├── alembic/
│   │   │   ├── pyproject.toml
│   │   │   └── README.md
│   │   │
│   │   ├── actual/                      # Budget app
│   │   ├── tasks/                       # Task manager
│   │   ├── calendar/                    # Calendar
│   │   │
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   ├── workflow/                        # Workflow Automation Domain
│   │   ├── n8n/                         # Complete product
│   │   │   ├── packages/                # n8n packages (internal)
│   │   │   ├── nodes/                   # Custom nodes (internal)
│   │   │   ├── docker-compose.yml
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── mcp-hub/                     # MCP router
│   │   │   ├── src/
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   │
│   │   ├── docker-compose.yml
│   │   └── README.md
│   │
│   └── ai/                              # AI/ML Domain
│       ├── firecrawl/                   # Complete product
│       │   ├── api/                     # API (internal)
│       │   ├── redis/                   # Queue (internal)
│       │   ├── ui/                      # UI (internal)
│       │   ├── docker-compose.yml
│       │   └── README.md
│       │
│       ├── analytics/                   # Analytics service
│       ├── chat/                        # Chat service
│       ├── models/                      # ML models
│       │
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
├── infrastructure/                      # INFRASTRUCTURE (Stages 1, 3, 4, 5)
│   ├── gateway/                         # Stage 1: Edge layer
│   │   ├── kong/                        # API Gateway
│   │   ├── nginx/                       # Reverse proxy
│   │   └── traefik/                     # Alternative gateway
│   │
│   ├── middleware/                      # Stage 3: Infrastructure
│   │   ├── dapr/                        # Dapr components
│   │   ├── redis/                       # Shared Redis
│   │   └── rabbitmq/                    # Message queue
│   │
│   ├── data/                            # Stage 4: Data persistence
│   │   ├── postgres/                    # PostgreSQL
│   │   │   ├── init/                    # Init scripts
│   │   │   └── schemas/                 # Schema definitions
│   │   └── hasura/                      # GraphQL engine
│   │
│   ├── observability/                   # Monitoring/Logging
│   │   ├── grafana/
│   │   ├── prometheus/
│   │   ├── loki/
│   │   └── jaeger/
│   │
│   ├── testing/                         # Stage 5: Testing tools
│   │   ├── wiremock/
│   │   └── mailpit/
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
├── docker-compose.ai.yml                # AI domain override
│
├── package.json                         # Root workspace
├── pnpm-workspace.yaml
├── nx.json
└── README.md