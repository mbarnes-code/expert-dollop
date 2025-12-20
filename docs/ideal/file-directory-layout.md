╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    DOMAIN-DRIVEN MODULAR MONOLITH FILE DIRECTORY LAYOUT                                 ║
║                         (Organized by Bounded Context & Business Domain)                                ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

This document provides a comprehensive file directory layout for the domain-driven modular monolith 
architecture. Following the Nemesis pattern, projects are organized by business domain in modules/, 
with minimal shared code in libs/, and all infrastructure centralized. Each module maintains its 
internal structure and is independently deployable.

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                                    SECTION 1: ROOT LEVEL STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

expert-dollop/                                    # Root monorepo directory
│
├── .github/                                      # GitHub workflows and actions
│   ├── workflows/                                # CI/CD pipeline definitions
│   │   ├── ci-modules.yml                       # CI for all modules
│   │   ├── ci-security.yml                      # Security domain CI
│   │   ├── ci-tcg.yml                           # TCG domain CI
│   │   ├── ci-productivity.yml                  # Productivity domain CI
│   │   ├── ci-workflow.yml                      # Workflow domain CI
│   │   ├── ci-ai.yml                            # AI domain CI
│   │   ├── deploy-production.yml                # Production deployment
│   │   ├── security-scan.yml                    # Security scanning
│   │   └── dependency-updates.yml               # Automated dependency updates
│   ├── actions/                                  # Custom GitHub Actions
│   │   ├── build-docker/                        # Docker build action
│   │   ├── run-tests/                           # Test execution action
│   │   └── deploy-k8s/                          # Kubernetes deployment action
│   └── CODEOWNERS                               # Code ownership mapping
│
├── .devcontainer/                               # VS Code dev container configuration
│   ├── devcontainer.json                        # Main dev container config
│   ├── docker-compose.yml                       # Dev environment composition
│   ├── Dockerfile                               # Dev container image
│   ├── post-create.sh                           # Post-creation setup script
│   └── README.md                                # Dev container documentation
│
├── .vscode/                                     # VS Code workspace settings
│   ├── settings.json                            # Editor settings
│   ├── extensions.json                          # Recommended extensions
│   ├── launch.json                              # Debug configurations
│   └── tasks.json                               # Task definitions
│
├── docker-compose.yml                           # Main orchestration (all domains)
├── docker-compose.dev.yml                       # Development override
├── docker-compose.prod.yml                      # Production override
├── docker-compose.test.yml                      # Testing override
│
├── docker-compose.security.yml                  # Security domain services
├── docker-compose.tcg.yml                       # TCG domain services
├── docker-compose.productivity.yml              # Productivity domain services
├── docker-compose.workflow.yml                  # Workflow domain services
├── docker-compose.ai.yml                        # AI domain services
│
├── Makefile                                     # Build automation commands
├── Taskfile.yml                                 # Modern task runner
│
├── package.json                                 # Root workspace package.json (pnpm)
├── pnpm-workspace.yaml                          # PNPM workspace configuration
├── pnpm-lock.yaml                               # PNPM lock file
│
├── tsconfig.base.json                           # Base TypeScript configuration
├── tsconfig.json                                # Root TypeScript config
│
├── nx.json                                      # Nx monorepo configuration
├── jest.preset.js                               # Jest test preset
├── vitest.workspace.ts                          # Vitest workspace config
│
├── .eslintrc.js                                 # Root ESLint configuration
├── .prettierrc.js                               # Prettier formatting config
├── .editorconfig                                # Editor configuration
├── biome.jsonc                                  # Biome linter/formatter config
│
├── turbo.json                                   # Turborepo build orchestration
│
├── .gitignore                                   # Git ignore patterns
├── .dockerignore                                # Docker ignore patterns
│
├── README.md                                    # Main project documentation
├── LICENSE                                      # Project license
├── CONTRIBUTING.md                              # Contribution guidelines
├── CODE_OF_CONDUCT.md                           # Code of conduct
├── SECURITY.md                                  # Security policy
│
├── modules/                                     # ➜ Domain-based modules (bounded contexts)
├── libs/                                        # ➜ Minimal shared libraries
├── infrastructure/                              # ➜ Cross-cutting infrastructure
├── docs/                                        # ➜ Documentation
├── tests/                                       # ➜ Integration & E2E tests
├── scripts/                                     # ➜ Build & deployment scripts
└── omninexus/                                   # ➜ Unified dashboard/admin UI

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 2: MODULES - DOMAIN-BASED BOUNDED CONTEXTS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

modules/                                         # Domain-based modules (bounded contexts)
│
├── security/                                    # SECURITY DOMAIN
│   │
│   ├── ghostwriter/                             # Ghostwriter - Red Team C2 & Reporting
│   │   ├── README.md                            # Project documentation
│   │   ├── docker-compose.yml                   # Ghostwriter compose
│   │   ├── Dockerfile                           # Django application
│   │   ├── requirements.txt                     # Python dependencies
│   │   ├── manage.py                            # Django management
│   │   ├── pytest.ini                           # Test configuration
│   │   │
│   │   ├── config/                              # Django settings
│   │   │   ├── settings/
│   │   │   │   ├── base.py
│   │   │   │   ├── development.py
│   │   │   │   ├── production.py
│   │   │   │   └── test.py
│   │   │   ├── urls.py
│   │   │   ├── wsgi.py
│   │   │   └── asgi.py
│   │   │
│   │   ├── ghostwriter/                         # Django apps
│   │   │   ├── api/                             # REST API
│   │   │   ├── commandcenter/                   # Command center
│   │   │   ├── home/                            # Home dashboard
│   │   │   ├── oplog/                           # Operation logs
│   │   │   ├── reporting/                       # Report generation
│   │   │   ├── rolodex/                         # Client/contact management
│   │   │   ├── shepherd/                        # Infrastructure tracking
│   │   │   └── users/                           # User management
│   │   │
│   │   ├── static/                              # Static files
│   │   ├── media/                               # Uploaded media
│   │   ├── templates/                           # Django templates
│   │   │
│   │   ├── graphql/                             # GraphQL API
│   │   │   ├── schema.py
│   │   │   ├── queries.py
│   │   │   └── mutations.py
│   │   │
│   │   └── tests/                               # Test suite
│   │
│   ├── nemesis/                                 # Nemesis - Offensive Security Platform
│   │   ├── README.md
│   │   ├── docker-compose.yml                   # Multi-service compose
│   │   ├── Makefile                             # Build automation
│   │   │
│   │   ├── libs/                                # Shared libraries
│   │   │   ├── README.md
│   │   │   ├── chromium/                        # Chromium parsing
│   │   │   ├── common/                          # Common utilities
│   │   │   ├── dpapi/                           # DPAPI operations
│   │   │   ├── file_enrichment_modules/         # File enrichment
│   │   │   └── file_linking/                    # File relationship tracking
│   │   │
│   │   ├── projects/                            # Nemesis services
│   │   │   ├── enrichment/                      # Data enrichment service
│   │   │   │   ├── Dockerfile
│   │   │   │   ├── requirements.txt
│   │   │   │   └── enrichment/
│   │   │   │       ├── tasks/
│   │   │   │       ├── lib/
│   │   │   │       └── cli/
│   │   │   ├── hasura/                          # GraphQL API
│   │   │   │   ├── Dockerfile
│   │   │   │   └── metadata/
│   │   │   ├── jupyter/                         # Analysis notebooks
│   │   │   ├── kibana/                          # Dashboard
│   │   │   └── web_api/                         # FastAPI web service
│   │   │       ├── Dockerfile
│   │   │       ├── requirements.txt
│   │   │       └── web_api/
│   │   │           ├── api/
│   │   │           ├── models/
│   │   │           └── schemas/
│   │   │
│   │   ├── infra/                               # Infrastructure
│   │   │   ├── kubernetes/                      # K8s manifests
│   │   │   ├── terraform/                       # IaC
│   │   │   └── helm/                            # Helm charts
│   │   │
│   │   └── tests/                               # Integration tests
│   │
│   ├── misp/                                    # MISP - Threat Intelligence Platform
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   │
│   │   ├── app/                                 # MISP application
│   │   │   ├── Controller/
│   │   │   ├── Model/
│   │   │   ├── View/
│   │   │   └── webroot/
│   │   │
│   │   ├── PyMISP/                              # Python library
│   │   │   ├── pymisp/
│   │   │   └── examples/
│   │   │
│   │   └── INSTALL/                             # Installation scripts
│   │
│   ├── dispatch/                                # Dispatch - Incident Management
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ├── pyproject.toml                       # Poetry config
│   │   │
│   │   ├── src/
│   │   │   └── dispatch/
│   │   │       ├── main.py                      # FastAPI app
│   │   │       ├── api/                         # API routes
│   │   │       │   └── v1/
│   │   │       │       ├── incidents.py
│   │   │       │       ├── tasks.py
│   │   │       │       └── teams.py
│   │   │       ├── models/                      # SQLAlchemy models
│   │   │       ├── schemas/                     # Pydantic schemas
│   │   │       ├── plugins/                     # Plugin system
│   │   │       │   ├── slack/
│   │   │       │   ├── jira/
│   │   │       │   └── pagerduty/
│   │   │       └── database/
│   │   │
│   │   └── tests/
│   │
│   ├── yara-x/                                  # YARA-X - Malware Pattern Matching
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── Cargo.toml                           # Rust workspace
│   │   │
│   │   ├── yara-x/                              # Core library
│   │   │   ├── Cargo.toml
│   │   │   └── src/
│   │   ├── yara-x-cli/                          # CLI tool
│   │   │   ├── Cargo.toml
│   │   │   └── src/
│   │   └── py/                                  # Python bindings
│   │       ├── Cargo.toml
│   │       └── src/
│   │
│   ├── maltrail/                                # Maltrail - Malicious Traffic Detection
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── maltrail.conf                        # Configuration
│   │   ├── server.py                            # Web server
│   │   ├── sensor.py                            # Traffic sensor
│   │   ├── core/                                # Core logic
│   │   └── trails/                              # IOC feeds
│   │
│   ├── rita/                                    # RITA - Beacon Detection
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── pkg/                                 # Go packages
│   │   │   ├── beacon/
│   │   │   ├── blacklist/
│   │   │   └── dns/
│   │   └── config/
│   │
│   ├── helk/                                    # HELK - Hunting ELK Stack
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── elasticsearch/
│   │   ├── logstash/
│   │   ├── kibana/
│   │   └── winlogbeat/
│   │
│   ├── cyberchef/                               # CyberChef - Data Analysis
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── core/
│   │       └── web/
│   │
│   ├── malwarebazaar-mcp/                       # MalwareBazaar MCP Server
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── api.ts
│   │
│   ├── virustotal-mcp/                          # VirusTotal MCP Server
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── api.ts
│   │
│   └── docker-compose.security.yml              # Security domain compose
│
├── tcg/                                         # TRADING CARD GAME DOMAIN
│   │
│   ├── commander-spellbook/                     # Commander Spellbook - MTG Combos
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   │
│   │   ├── backend/                             # Django backend
│   │   │   ├── Dockerfile
│   │   │   ├── requirements.txt
│   │   │   ├── manage.py
│   │   │   ├── spellbook/                       # Django apps
│   │   │   │   ├── models/
│   │   │   │   │   ├── card.py
│   │   │   │   │   ├── combo.py
│   │   │   │   │   └── variant.py
│   │   │   │   ├── views/
│   │   │   │   ├── serializers/
│   │   │   │   └── graphql/
│   │   │   └── common/                          # Common utilities
│   │   │
│   │   ├── client/                              # Next.js frontend
│   │   │   ├── Dockerfile
│   │   │   ├── package.json
│   │   │   ├── next.config.js
│   │   │   └── src/
│   │   │       ├── app/
│   │   │       ├── components/
│   │   │       └── lib/
│   │   │
│   │   └── bots/                                # Discord/Reddit bots
│   │       ├── discord/
│   │       │   ├── Dockerfile
│   │       │   ├── requirements.txt
│   │       │   └── bot.py
│   │       └── reddit/
│   │           ├── Dockerfile
│   │           └── bot.py
│   │
│   ├── commander-map/                           # MTG Commander Map
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   ├── mtg-scripting-toolkit/                   # MTG Scripting Tools
│   │   ├── README.md
│   │   ├── package.json
│   │   └── src/
│   │
│   └── docker-compose.tcg.yml                   # TCG domain compose
│
├── productivity/                                # PRODUCTIVITY DOMAIN
│   │
│   ├── mealie/                                  # Mealie - Recipe & Meal Planning
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   │
│   │   ├── backend/                             # FastAPI backend
│   │   │   ├── Dockerfile
│   │   │   ├── pyproject.toml
│   │   │   └── mealie/
│   │   │       ├── main.py
│   │   │       ├── api/
│   │   │       │   └── v1/
│   │   │       │       ├── recipes.py
│   │   │       │       ├── meals.py
│   │   │       │       └── shopping.py
│   │   │       ├── models/
│   │   │       ├── schemas/
│   │   │       ├── crud/
│   │   │       └── services/
│   │   │
│   │   └── frontend/                            # Nuxt.js frontend
│   │       ├── Dockerfile
│   │       ├── package.json
│   │       ├── nuxt.config.ts
│   │       ├── components/
│   │       ├── pages/
│   │       └── store/
│   │
│   ├── actual/                                  # Actual Budget - Personal Finance
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── sync/
│   │       └── api/
│   │
│   ├── it-tools/                                # IT Tools - Developer Utilities
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── tools/
│   │       └── components/
│   │
│   └── docker-compose.productivity.yml          # Productivity domain compose
│
├── workflow/                                    # WORKFLOW AUTOMATION DOMAIN
│   │
│   ├── n8n/                                     # n8n - Workflow Automation
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ├── Dockerfile.worker                    # Worker nodes
│   │   │
│   │   ├── packages/                            # n8n packages
│   │   │   ├── cli/                             # CLI
│   │   │   ├── core/                            # Core logic
│   │   │   ├── nodes-base/                      # Base nodes
│   │   │   ├── workflow/                        # Workflow engine
│   │   │   └── editor-ui/                       # Web UI
│   │   │
│   │   ├── custom-nodes/                        # Custom nodes
│   │   │   ├── n8n-nodes-goose/                 # Goose AI node
│   │   │   └── security-nodes/                  # Security integrations
│   │   │
│   │   ├── workflows/                           # Workflow templates
│   │   │   ├── security/                        # Security workflows
│   │   │   └── productivity/                    # Productivity workflows
│   │   │
│   │   └── credentials/                         # Custom credentials
│   │
│   ├── n8n-mcp/                                 # n8n MCP Server
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── workflows.ts
│   │
│   └── docker-compose.workflow.yml              # Workflow domain compose
│
├── ai/                                          # AI/ML DOMAIN
│   │
│   ├── firecrawl/                               # Firecrawl - Web Scraping & Crawling
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   │
│   │   ├── api/                                 # FastAPI service
│   │   │   ├── Dockerfile
│   │   │   ├── requirements.txt
│   │   │   └── firecrawl/
│   │   │       ├── main.py
│   │   │       ├── api/
│   │   │       ├── crawlers/
│   │   │       ├── scrapers/
│   │   │       └── processors/
│   │   │
│   │   ├── ui/                                  # Next.js UI
│   │   │   ├── Dockerfile
│   │   │   ├── package.json
│   │   │   └── src/
│   │   │
│   │   ├── redis/                               # Redis queue
│   │   │   └── Dockerfile
│   │   │
│   │   ├── examples/                            # Example scripts
│   │   └── sdks/                                # Client SDKs
│   │       ├── python/
│   │       ├── javascript/
│   │       └── go/
│   │
│   ├── firecrawl-mcp/                           # Firecrawl MCP Server
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── scraper.ts
│   │
│   ├── goose/                                   # Goose - AI Agent
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── Cargo.toml                           # Rust workspace
│   │   │
│   │   ├── crates/                              # Rust crates
│   │   │   ├── goose/                           # Core agent
│   │   │   ├── goose-cli/                       # CLI interface
│   │   │   └── goose-mcp/                       # MCP server
│   │   │
│   │   ├── extensions/                          # Agent extensions
│   │   │   ├── developer/
│   │   │   └── researcher/
│   │   │
│   │   └── ui/                                  # Web UI
│   │       ├── Dockerfile
│   │       └── src/
│   │
│   ├── chroma-mcp/                              # Chroma Vector DB MCP
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/
│   │       ├── server.py
│   │       └── embeddings.py
│   │
│   ├── filescope-mcp/                           # FileScope MCP Server
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/
│   │       └── server.py
│   │
│   ├── inspector/                               # MCP Inspector
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── analytics/                               # Analytics Service
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/
│   │       ├── main.py
│   │       ├── models/
│   │       └── pipelines/
│   │
│   ├── playwright-service/                      # Playwright Automation
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/
│   │       └── server.py
│   │
│   ├── html-to-md-service/                      # HTML to Markdown
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── main.go
│   │
│   ├── nuq-postgres/                            # PostgreSQL for AI
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   └── init.sql
│   │
│   ├── kasmvnc/                                 # Remote Desktop for AI
│   │   ├── README.md
│   │   └── Dockerfile
│   │
│   └── docker-compose.ai.yml                    # AI domain compose
│
└── shared/                                      # CROSS-DOMAIN UTILITIES (if needed)
    ├── README.md
    └── docker-compose.shared.yml
│
├── Dockerfile.base                              # Base image for all backend services
├── requirements.base.txt                        # Shared Python requirements
├── package.base.json                            # Shared Node.js dependencies
│
├── api/                                         # API Gateway & Routing Layer
│   ├── kong/                                    # Kong API Gateway
│   │   ├── Dockerfile                           # Kong custom image
│   │   ├── kong.yml                             # Kong declarative config
│   │   ├── plugins/                             # Custom Kong plugins
│   │   │   ├── auth/                            # Custom auth plugin
│   │   │   ├── rate-limit/                      # Custom rate limiting
│   │   │   └── logging/                         # Custom logging plugin
│   │   └── migrations/                          # Kong database migrations
│   │
│   ├── graphql-gateway/                         # GraphQL Federation Gateway
│   │   ├── Dockerfile                           # Apollo/Hasura gateway
│   │   ├── package.json                         # Node.js dependencies
│   │   ├── src/                                 
│   │   │   ├── index.ts                         # Main gateway entry
│   │   │   ├── schema-stitching.ts              # Schema federation
│   │   │   ├── subgraphs/                       # Subgraph configurations
│   │   │   │   ├── ghostwriter.graphql          # Ghostwriter schema
│   │   │   │   ├── nemesis.graphql              # Nemesis schema
│   │   │   │   ├── security.graphql             # Security context schema
│   │   │   │   └── workflow.graphql             # Workflow context schema
│   │   │   ├── resolvers/                       # Custom resolvers
│   │   │   └── middleware/                      # Auth, logging, etc.
│   │   └── docker-compose.yml                   # Standalone gateway compose
│   │
│   └── mcp-hub/                                 # MCP Protocol Hub
│       ├── Dockerfile                           # MCP router image
│       ├── package.json                         # TypeScript MCP router
│       ├── src/
│       │   ├── index.ts                         # Main router entry
│       │   ├── router.ts                        # Protocol routing logic
│       │   ├── discovery.ts                     # Service discovery
│       │   ├── health.ts                        # Health checks
│       │   └── servers/                         # MCP server configs
│       │       ├── chroma.config.ts             # Chroma MCP
│       │       ├── malware.config.ts            # MalwareBazaar MCP
│       │       ├── virustotal.config.ts         # VirusTotal MCP
│       │       ├── n8n.config.ts                # n8n MCP
│       │       ├── firecrawl.config.ts          # Firecrawl MCP
│       │       └── filescope.config.ts          # Filescope MCP
│       └── docker-compose.yml                   # MCP hub compose
│
├── auth/                                        # Unified Authentication Service
│   ├── Dockerfile                               # Auth service image
│   ├── package.json                             # Node.js/TypeScript
│   ├── src/
│   │   ├── index.ts                             # Main auth entry
│   │   ├── strategies/                          # Auth strategies
│   │   │   ├── jwt.ts                           # JWT authentication
│   │   │   ├── oauth2.ts                        # OAuth2 provider
│   │   │   ├── saml.ts                          # SAML SSO
│   │   │   └── ldap.ts                          # LDAP integration
│   │   ├── providers/                           # External auth providers
│   │   │   ├── github.ts                        # GitHub OAuth
│   │   │   ├── google.ts                        # Google OAuth
│   │   │   └── azure-ad.ts                      # Azure AD
│   │   ├── middleware/                          # Auth middleware
│   │   └── models/                              # User/session models
│   └── migrations/                              # Database migrations
│
├── django/                                      # Django Services Layer
│   ├── Dockerfile                               # Django base image
│   ├── Dockerfile.dev                           # Development image
│   ├── requirements.txt                         # Django dependencies
│   ├── manage.py                                # Django management script
│   ├── pytest.ini                               # Test configuration
│   │
│   ├── config/                                  # Django project settings
│   │   ├── __init__.py
│   │   ├── settings/                            # Split settings
│   │   │   ├── __init__.py
│   │   │   ├── base.py                          # Base settings
│   │   │   ├── development.py                   # Dev settings
│   │   │   ├── production.py                    # Prod settings
│   │   │   └── test.py                          # Test settings
│   │   ├── urls.py                              # Root URL configuration
│   │   ├── wsgi.py                              # WSGI application
│   │   └── asgi.py                              # ASGI application
│   │
│   ├── shared/                                  # Shared Django components
│   │   ├── __init__.py
│   │   ├── models/                              # Common models
│   │   │   ├── base.py                          # Base model classes
│   │   │   ├── user.py                          # User model (extends)
│   │   │   ├── organization.py                  # Organization model
│   │   │   └── audit.py                         # Audit logging
│   │   ├── middleware/                          # Shared middleware
│   │   │   ├── auth.py                          # Auth middleware
│   │   │   ├── cors.py                          # CORS handling
│   │   │   └── logging.py                       # Request logging
│   │   ├── serializers/                         # Common serializers
│   │   ├── permissions/                         # Permission classes
│   │   ├── viewsets/                            # Base viewsets
│   │   └── utils/                               # Utility functions
│   │
│   ├── ghostwriter/                             # Ghostwriter App (Security)
│   │   ├── __init__.py
│   │   ├── apps.py                              # App configuration
│   │   ├── models/                              # Ghostwriter models
│   │   │   ├── __init__.py
│   │   │   ├── client.py                        # Client management
│   │   │   ├── project.py                       # Project tracking
│   │   │   ├── finding.py                       # Security findings
│   │   │   └── report.py                        # Report generation
│   │   ├── views/                               # API views
│   │   ├── serializers/                         # DRF serializers
│   │   ├── admin.py                             # Django admin
│   │   ├── urls.py                              # App URLs
│   │   ├── tasks.py                             # Celery tasks
│   │   ├── graphql/                             # GraphQL schema
│   │   │   ├── schema.py                        # Ghostwriter schema
│   │   │   ├── queries.py                       # Query resolvers
│   │   │   └── mutations.py                     # Mutation resolvers
│   │   ├── migrations/                          # Database migrations
│   │   └── tests/                               # Unit tests
│   │
│   ├── spellbook/                               # Commander Spellbook (TCG)
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models/                              # Card & combo models
│   │   │   ├── __init__.py
│   │   │   ├── card.py                          # MTG card model
│   │   │   ├── combo.py                         # Combo model
│   │   │   ├── variant.py                       # Combo variant
│   │   │   └── bot.py                           # Bot state
│   │   ├── views/
│   │   ├── serializers/
│   │   ├── admin.py
│   │   ├── urls.py
│   │   ├── bots/                                # Discord/Reddit/Telegram bots
│   │   │   ├── discord/                         # Discord bot
│   │   │   │   ├── Dockerfile                   # Bot container
│   │   │   │   ├── requirements.txt
│   │   │   │   └── bot.py                       # Bot logic
│   │   │   ├── reddit/                          # Reddit bot
│   │   │   └── telegram/                        # Telegram bot
│   │   ├── migrations/
│   │   └── tests/
│   │
│   ├── misp/                                    # MISP Integration (Security)
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models/                              # MISP models
│   │   │   ├── event.py                         # MISP events
│   │   │   ├── attribute.py                     # Event attributes
│   │   │   └── object.py                        # MISP objects
│   │   ├── views/
│   │   ├── serializers/
│   │   ├── api/                                 # MISP API integration
│   │   ├── migrations/
│   │   └── tests/
│   │
│   ├── docker-compose.django.yml                # Django services compose
│   └── alembic/                                 # Alembic migration framework
│       ├── alembic.ini                          # Alembic configuration
│       ├── env.py                               # Migration environment
│       └── versions/                            # Migration versions
│
├── fastapi/                                     # FastAPI Services Layer
│   ├── Dockerfile                               # FastAPI base image
│   ├── Dockerfile.dev                           # Development image
│   ├── pyproject.toml                           # Poetry/uv configuration
│   ├── requirements.txt                         # FastAPI dependencies
│   ├── pytest.ini                               # Test configuration
│   │
│   ├── shared/                                  # Shared FastAPI components
│   │   ├── __init__.py
│   │   ├── models/                              # Pydantic models
│   │   │   ├── base.py                          # Base models
│   │   │   ├── user.py                          # User model
│   │   │   └── response.py                      # Response models
│   │   ├── database/                            # Database utilities
│   │   │   ├── session.py                       # SQLAlchemy session
│   │   │   ├── base.py                          # Base ORM classes
│   │   │   └── utils.py                         # DB utilities
│   │   ├── dependencies/                        # FastAPI dependencies
│   │   │   ├── auth.py                          # Auth dependencies
│   │   │   └── db.py                            # Database dependencies
│   │   ├── middleware/                          # Shared middleware
│   │   └── utils/                               # Utility functions
│   │
│   ├── mealie/                                  # Mealie Service (Productivity)
│   │   ├── __init__.py
│   │   ├── main.py                              # FastAPI app entry
│   │   ├── api/                                 # API routes
│   │   │   ├── __init__.py
│   │   │   ├── v1/                              # API v1
│   │   │   │   ├── recipes.py                   # Recipe endpoints
│   │   │   │   ├── meals.py                     # Meal planning
│   │   │   │   └── shopping.py                  # Shopping lists
│   │   │   └── deps.py                          # Route dependencies
│   │   ├── models/                              # SQLAlchemy models
│   │   ├── schemas/                             # Pydantic schemas
│   │   ├── crud/                                # CRUD operations
│   │   ├── core/                                # Core logic
│   │   ├── alembic/                             # Migrations
│   │   └── tests/
│   │
│   ├── dispatch/                                # Dispatch Service (Productivity)
│   │   ├── __init__.py
│   │   ├── main.py                              # FastAPI app entry
│   │   ├── api/                                 # API routes
│   │   │   ├── v1/
│   │   │   │   ├── incidents.py                 # Incident management
│   │   │   │   ├── tasks.py                     # Task tracking
│   │   │   │   └── notifications.py             # Notifications
│   │   │   └── deps.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   ├── plugins/                             # Dispatch plugins
│   │   ├── alembic/
│   │   └── tests/
│   │
│   ├── nemesis-api/                             # Nemesis API Components (Security)
│   │   ├── __init__.py
│   │   ├── main.py                              # FastAPI app entry
│   │   ├── api/                                 # API routes
│   │   │   ├── v1/
│   │   │   │   ├── files.py                     # File operations
│   │   │   │   ├── enrichment.py                # Data enrichment
│   │   │   │   └── artifacts.py                 # Artifact management
│   │   │   └── deps.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── dapr/                                # Dapr integration
│   │   │   ├── pubsub.py                        # Pub/sub client
│   │   │   ├── state.py                         # State management
│   │   │   └── service-invocation.py            # Service calls
│   │   ├── alembic/
│   │   └── tests/
│   │
│   └── docker-compose.fastapi.yml               # FastAPI services compose
│
├── nodejs/                                      # Node.js Services Layer
│   ├── Dockerfile.base                          # Node.js base image
│   ├── package.json                             # Workspace root
│   ├── tsconfig.base.json                       # Base TypeScript config
│   │
│   ├── n8n/                                     # n8n Workflow Engine (Workflow)
│   │   ├── Dockerfile                           # n8n custom image
│   │   ├── Dockerfile.worker                    # Worker image
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts                         # Main entry
│   │   │   ├── workflows/                       # Workflow definitions
│   │   │   ├── nodes/                           # Custom nodes
│   │   │   ├── credentials/                     # Custom credentials
│   │   │   └── hooks/                           # Workflow hooks
│   │   ├── workers/                             # Background workers
│   │   │   ├── main.worker.ts                   # Main worker
│   │   │   └── webhook.worker.ts                # Webhook worker
│   │   └── migrations/                          # Database migrations
│   │
│   ├── firecrawl/                               # Firecrawl API (AI/ML)
│   │   ├── Dockerfile                           # Firecrawl image
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts                         # Main entry
│   │   │   ├── api/                             # API routes
│   │   │   ├── crawlers/                        # Crawler logic
│   │   │   ├── scrapers/                        # Scraper engines
│   │   │   └── processors/                      # Data processors
│   │   └── redis/                               # Redis queue config
│   │
│   ├── actual/                                  # Actual Budget (Productivity)
│   │   ├── Dockerfile                           # Actual image
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts                         # Sync server
│   │   │   ├── sync/                            # Sync logic
│   │   │   └── api/                             # API routes
│   │   └── migrations/
│   │
│   ├── inspector/                               # MCP Inspector (AI/ML)
│   │   ├── Dockerfile                           # Inspector image
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts                         # Main entry
│   │       └── mcp-client/                      # MCP client logic
│   │
│   └── docker-compose.nodejs.yml                # Node.js services compose
│
├── services/                                    # Additional Services
│   ├── python/                                  # Python Services
│   │   ├── maltrail/                            # Maltrail (Security)
│   │   │   ├── Dockerfile
│   │   │   ├── requirements.txt
│   │   │   └── src/
│   │   │       ├── server.py                    # Maltrail server
│   │   │       └── sensor.py                    # Maltrail sensor
│   │   │
│   │   ├── analytics/                           # Analytics Service (AI/ML)
│   │   │   ├── Dockerfile
│   │   │   ├── requirements.txt
│   │   │   └── src/
│   │   │       ├── main.py                      # Analytics API
│   │   │       ├── models/                      # ML models
│   │   │       └── pipelines/                   # Data pipelines
│   │   │
│   │   └── playwright/                          # Playwright Service (AI/ML)
│   │       ├── Dockerfile
│   │       ├── requirements.txt
│   │       └── src/
│   │           └── server.py                    # Playwright API
│   │
│   ├── go/                                      # Go Services
│   │   ├── rita/                                # RITA (Security)
│   │   │   ├── Dockerfile
│   │   │   ├── go.mod
│   │   │   ├── go.sum
│   │   │   └── main.go                          # RITA entry
│   │   │
│   │   └── html-to-md/                          # HTML to Markdown (AI/ML)
│   │       ├── Dockerfile
│   │       ├── go.mod
│   │       ├── go.sum
│   │       └── main.go                          # Service entry
│   │
│   ├── rust/                                    # Rust Services
│   │   ├── goose/                               # Goose AI (AI/ML, Security)
│   │   │   ├── Dockerfile
│   │   │   ├── Cargo.toml
│   │   │   ├── src/
│   │   │   │   ├── main.rs                      # Main entry
│   │   │   │   ├── ai/                          # AI logic
│   │   │   │   └── mcp/                         # MCP server
│   │   │   └── target/                          # Build artifacts
│   │   │
│   │   └── yara-x/                              # YARA-X (Security)
│   │       ├── Dockerfile
│   │       ├── Cargo.toml
│   │       └── src/
│   │           └── main.rs
│   │
│   ├── dotnet/                                  # .NET Services
│   │   └── nemesis/                             # Nemesis Core (Security)
│   │       ├── Dockerfile
│   │       ├── Nemesis.sln                      # Solution file
│   │       ├── src/
│   │       │   ├── Nemesis.Core/                # Core library
│   │       │   ├── Nemesis.Services/            # Services
│   │       │   └── Nemesis.Worker/              # Background worker
│   │       └── tests/
│   │
│   └── docker-compose.services.yml              # Additional services compose
│


═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 3: LIBS - MINIMAL SHARED LIBRARIES
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

libs/                                            # Minimal shared libraries (ONLY cross-domain code)
│
├── README.md                                    # Libs usage guidelines
│
├── typescript/                                  # TypeScript shared libraries
│   ├── common/                                  # Common utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/                           # Shared types
│   │       ├── utils/                           # Utility functions
│   │       └── constants/                       # Constants
│   │
│   ├── ui-components/                           # Shared UI components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── Button/
│   │       ├── Card/
│   │       ├── Form/
│   │       └── Layout/
│   │
│   └── api-client/                              # Shared API client
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── client.ts
│           ├── auth.ts
│           └── types.ts
│
├── python/                                      # Python shared libraries
│   ├── common/                                  # Common utilities
│   │   ├── pyproject.toml
│   │   ├── setup.py
│   │   └── src/
│   │       └── common/
│   │           ├── __init__.py
│   │           ├── config.py                    # Configuration utilities
│   │           ├── logging.py                   # Logging utilities
│   │           └── exceptions.py                # Custom exceptions
│   │
│   └── database/                                # Database utilities
│       ├── pyproject.toml
│       └── src/
│           └── database/
│               ├── __init__.py
│               ├── session.py                   # Database session
│               └── migrations.py                # Migration helpers
│
├── rust/                                        # Rust shared libraries
│   └── common/                                  # Common utilities
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           └── utils/
│
└── go/                                          # Go shared libraries
    └── common/                                  # Common utilities
        ├── go.mod
        └── pkg/
            └── utils/

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 4: INFRASTRUCTURE - CROSS-CUTTING CONCERNS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

infrastructure/                                  # Cross-cutting infrastructure
│
├── README.md                                    # Infrastructure documentation
│
├── kong/                                        # Kong API Gateway
│   ├── Dockerfile                               # Kong custom image
│   ├── kong.yml                                 # Kong declarative config
│   ├── docker-compose.yml                       # Kong compose
│   ├── plugins/                                 # Custom Kong plugins
│   │   ├── auth/                                # Custom auth plugin
│   │   ├── rate-limit/                          # Custom rate limiting
│   │   └── logging/                             # Custom logging plugin
│   └── migrations/                              # Kong database migrations
│
├── graphql-gateway/                             # GraphQL Federation Gateway
│   ├── Dockerfile                               # Apollo/Hasura gateway
│   ├── package.json                             # Node.js dependencies
│   ├── docker-compose.yml                       # Gateway compose
│   ├── src/                                 
│   │   ├── index.ts                             # Main gateway entry
│   │   ├── schema-stitching.ts                  # Schema federation
│   │   ├── subgraphs/                           # Subgraph configurations
│   │   │   ├── ghostwriter.graphql              # Ghostwriter schema
│   │   │   ├── nemesis.graphql                  # Nemesis schema
│   │   │   ├── spellbook.graphql                # Spellbook schema
│   │   │   ├── security.graphql                 # Security domain schema
│   │   │   ├── tcg.graphql                      # TCG domain schema
│   │   │   ├── productivity.graphql             # Productivity domain schema
│   │   │   ├── workflow.graphql                 # Workflow domain schema
│   │   │   └── ai.graphql                       # AI domain schema
│   │   ├── resolvers/                           # Custom resolvers
│   │   └── middleware/                          # Auth, logging, etc.
│   └── config/                                  # Gateway configuration
│
├── mcp-hub/                                     # MCP Protocol Hub & Router
│   ├── Dockerfile                               # MCP router image
│   ├── package.json                             # TypeScript MCP router
│   ├── docker-compose.yml                       # MCP hub compose
│   ├── src/
│   │   ├── index.ts                             # Main router entry
│   │   ├── router.ts                            # Protocol routing logic
│   │   ├── discovery.ts                         # Service discovery
│   │   ├── health.ts                            # Health checks
│   │   └── servers/                             # MCP server configs
│   │       ├── chroma.config.ts                 # Chroma MCP
│   │       ├── malwarebazaar.config.ts          # MalwareBazaar MCP
│   │       ├── virustotal.config.ts             # VirusTotal MCP
│   │       ├── n8n.config.ts                    # n8n MCP
│   │       ├── firecrawl.config.ts              # Firecrawl MCP
│   │       └── filescope.config.ts              # Filescope MCP
│   └── config/                                  # Router configuration
│
├── auth/                                        # Unified Authentication Service
│   ├── Dockerfile                               # Auth service image
│   ├── package.json                             # Node.js/TypeScript
│   ├── docker-compose.yml                       # Auth compose
│   ├── src/
│   │   ├── index.ts                             # Main auth entry
│   │   ├── strategies/                          # Auth strategies
│   │   │   ├── jwt.ts                           # JWT authentication
│   │   │   ├── oauth2.ts                        # OAuth2 provider
│   │   │   ├── saml.ts                          # SAML SSO
│   │   │   └── ldap.ts                          # LDAP integration
│   │   ├── providers/                           # External auth providers
│   │   │   ├── github.ts                        # GitHub OAuth
│   │   │   ├── google.ts                        # Google OAuth
│   │   │   └── azure-ad.ts                      # Azure AD
│   │   ├── middleware/                          # Auth middleware
│   │   └── models/                              # User/session models
│   └── migrations/                              # Database migrations
│
├── postgres/                                    # PostgreSQL Database
│   ├── Dockerfile                               # Custom PostgreSQL image
│   ├── docker-compose.yml                       # PostgreSQL compose
│   ├── init/                                    # Initialization scripts
│   │   ├── 00-extensions.sql                    # PostgreSQL extensions
│   │   ├── 01-databases.sql                     # Create databases
│   │   └── 02-schemas.sql                       # Create schemas
│   ├── backup/                                  # Backup scripts
│   │   ├── backup.sh                            # Backup script
│   │   └── restore.sh                           # Restore script
│   └── config/                                  # PostgreSQL configuration
│       └── postgresql.conf                      # Custom config
│
├── redis/                                       # Redis Cache & Queue
│   ├── Dockerfile                               # Custom Redis image
│   ├── docker-compose.yml                       # Redis compose
│   ├── redis.conf                               # Redis configuration
│   └── sentinel/                                # Redis Sentinel (HA)
│       ├── Dockerfile
│       └── sentinel.conf
│
├── bullmq/                                      # BullMQ Job Queue
│   ├── Dockerfile                               # BullMQ dashboard
│   ├── docker-compose.yml                       # BullMQ compose
│   ├── package.json
│   └── src/
│       └── dashboard.ts                         # BullMQ UI
│
├── dapr/                                        # Dapr Service Mesh
│   ├── docker-compose.yml                       # Dapr compose
│   ├── components/                              # Dapr components
│   │   ├── pubsub.yaml                          # Pub/sub configuration
│   │   ├── statestore.yaml                      # State store
│   │   ├── bindings.yaml                        # Bindings
│   │   └── secrets.yaml                         # Secret management
│   ├── config/                                  # Dapr configuration
│   │   └── config.yaml                          # Dapr config
│   └── middleware/                              # Dapr middleware
│       ├── ratelimit.yaml
│       └── tracing.yaml
│
├── monitoring/                                  # Monitoring & Observability
│   ├── prometheus/                              # Prometheus metrics
│   │   ├── Dockerfile
│   │   ├── prometheus.yml
│   │   └── alerts/
│   ├── grafana/                                 # Grafana dashboards
│   │   ├── Dockerfile
│   │   ├── dashboards/
│   │   └── datasources/
│   ├── jaeger/                                  # Jaeger tracing
│   │   └── docker-compose.yml
│   └── loki/                                    # Loki logging
│       └── docker-compose.yml
│
├── elasticsearch/                               # Elasticsearch (HELK, Security)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── elasticsearch.yml
│   └── indices/                                 # Index templates
│
├── rabbitmq/                                    # RabbitMQ Message Broker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── rabbitmq.conf
│   └── definitions.json                         # Queue/exchange definitions
│
├── nginx/                                       # Nginx Reverse Proxy
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf                               # Main nginx config
│   ├── conf.d/                                  # Server configurations
│   │   ├── security.conf                        # Security domain
│   │   ├── tcg.conf                             # TCG domain
│   │   ├── productivity.conf                    # Productivity domain
│   │   ├── workflow.conf                        # Workflow domain
│   │   └── ai.conf                              # AI domain
│   └── ssl/                                     # SSL certificates
│
├── kubernetes/                                  # Kubernetes Manifests
│   ├── namespaces/                              # Namespace definitions
│   │   ├── security.yaml
│   │   ├── tcg.yaml
│   │   ├── productivity.yaml
│   │   ├── workflow.yaml
│   │   └── ai.yaml
│   ├── deployments/                             # Deployment manifests
│   ├── services/                                # Service definitions
│   ├── ingress/                                 # Ingress rules
│   ├── configmaps/                              # ConfigMaps
│   ├── secrets/                                 # Secrets
│   └── helm/                                    # Helm charts
│       ├── security/
│       ├── tcg/
│       ├── productivity/
│       ├── workflow/
│       └── ai/
│
├── terraform/                                   # Infrastructure as Code
│   ├── main.tf                                  # Main Terraform config
│   ├── variables.tf                             # Variable definitions
│   ├── outputs.tf                               # Output values
│   ├── modules/                                 # Terraform modules
│   │   ├── network/
│   │   ├── compute/
│   │   ├── database/
│   │   └── security/
│   └── environments/                            # Environment configs
│       ├── dev/
│       ├── staging/
│       └── production/
│
└── docker/                                      # Shared Docker Resources
    ├── base-images/                             # Base images
    │   ├── python/
    │   │   ├── Dockerfile.3.12
    │   │   └── Dockerfile.3.11
    │   ├── node/
    │   │   ├── Dockerfile.22
    │   │   └── Dockerfile.20
    │   ├── rust/
    │   │   └── Dockerfile.latest
    │   └── go/
    │       └── Dockerfile.1.21
    └── scripts/                                 # Build scripts
        ├── build.sh
        ├── push.sh
        └── clean.sh

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 5: OMNINEXUS - UNIFIED DASHBOARD
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

omninexus/                                       # Unified Dashboard & Admin Portal
│
├── README.md                                    # OmniNexus documentation
├── Dockerfile                                   # Dashboard container
├── docker-compose.yml                           # OmniNexus compose
├── package.json                                 # Node.js dependencies
├── tsconfig.json                                # TypeScript config
├── vite.config.ts                               # Vite configuration
├── index.html                                   # HTML entry
├── index.tsx                                    # React entry
├── App.tsx                                      # Main App component
├── metadata.json                                # App metadata
├── types.ts                                     # TypeScript types
│
├── components/                                  # React components
│   ├── Navigation/                              # Navigation components
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── DomainSwitcher.tsx
│   │
│   ├── Dashboard/                               # Dashboard components
│   │   ├── Overview.tsx                         # System overview
│   │   ├── DomainCard.tsx                       # Domain status card
│   │   ├── ServiceCard.tsx                      # Service status card
│   │   └── MetricsPanel.tsx                     # Metrics display
│   │
│   ├── Security/                                # Security domain components
│   │   ├── GhostwriterPanel.tsx
│   │   ├── NemesisPanel.tsx
│   │   ├── MISPPanel.tsx
│   │   └── SecurityDashboard.tsx
│   │
│   ├── TCG/                                     # TCG domain components
│   │   ├── SpellbookPanel.tsx
│   │   └── TCGDashboard.tsx
│   │
│   ├── Productivity/                            # Productivity domain components
│   │   ├── MealiePanel.tsx
│   │   ├── ActualPanel.tsx
│   │   ├── DispatchPanel.tsx
│   │   └── ProductivityDashboard.tsx
│   │
│   ├── Workflow/                                # Workflow domain components
│   │   ├── N8NPanel.tsx
│   │   └── WorkflowDashboard.tsx
│   │
│   ├── AI/                                      # AI domain components
│   │   ├── FirecrawlPanel.tsx
│   │   ├── GoosePanel.tsx
│   │   ├── MCPPanel.tsx
│   │   └── AIDashboard.tsx
│   │
│   └── Common/                                  # Common UI components
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Table.tsx
│       └── Modal.tsx
│
└── services/                                    # Service integrations
    ├── api.ts                                   # API client
    ├── auth.ts                                  # Authentication service
    ├── websocket.ts                             # WebSocket client
    └── domains/                                 # Domain-specific services
        ├── security.ts
        ├── tcg.ts
        ├── productivity.ts
        ├── workflow.ts
        └── ai.ts

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 6: DOCS - DOCUMENTATION
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

docs/                                            # Documentation
│
├── README.md                                    # Documentation index
│
├── architecture/                                # Architecture documentation
│   ├── domain-model.md                          # Domain model overview
│   ├── bounded-contexts.md                      # Bounded context definitions
│   ├── module-structure.md                      # Module organization
│   ├── data-flow.md                             # Data flow diagrams
│   └── deployment.md                            # Deployment architecture
│
├── modules/                                     # Module-specific docs
│   ├── security/                                # Security domain
│   │   ├── README.md
│   │   ├── ghostwriter.md
│   │   ├── nemesis.md
│   │   ├── misp.md
│   │   └── dispatch.md
│   ├── tcg/                                     # TCG domain
│   │   ├── README.md
│   │   └── commander-spellbook.md
│   ├── productivity/                            # Productivity domain
│   │   ├── README.md
│   │   ├── mealie.md
│   │   └── actual.md
│   ├── workflow/                                # Workflow domain
│   │   ├── README.md
│   │   └── n8n.md
│   └── ai/                                      # AI domain
│       ├── README.md
│       ├── firecrawl.md
│       ├── goose.md
│       └── mcp-servers.md
│
├── infrastructure/                              # Infrastructure docs
│   ├── kong.md                                  # Kong API Gateway
│   ├── graphql-gateway.md                       # GraphQL federation
│   ├── mcp-hub.md                               # MCP protocol hub
│   ├── auth.md                                  # Authentication
│   ├── postgres.md                              # PostgreSQL
│   ├── redis.md                                 # Redis
│   ├── dapr.md                                  # Dapr
│   └── kubernetes.md                            # Kubernetes
│
├── development/                                 # Development guides
│   ├── getting-started.md                       # Getting started
│   ├── local-setup.md                           # Local development
│   ├── testing.md                               # Testing guidelines
│   ├── coding-standards.md                      # Coding standards
│   └── contributing.md                          # Contribution guide
│
├── api/                                         # API documentation
│   ├── graphql/                                 # GraphQL schemas
│   │   ├── security.graphql
│   │   ├── tcg.graphql
│   │   ├── productivity.graphql
│   │   ├── workflow.graphql
│   │   └── ai.graphql
│   └── rest/                                    # REST API docs
│       └── openapi.yaml                         # OpenAPI specification
│
└── operations/                                  # Operations docs
    ├── deployment.md                            # Deployment procedures
    ├── monitoring.md                            # Monitoring setup
    ├── backup-restore.md                        # Backup procedures
    ├── troubleshooting.md                       # Troubleshooting guide
    └── runbooks/                                # Operational runbooks
        ├── incident-response.md
        ├── scaling.md
        └── maintenance.md

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 7: TESTS - INTEGRATION & E2E TESTS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

tests/                                           # Integration & E2E tests
│
├── README.md                                    # Testing documentation
├── pytest.ini                                   # Pytest configuration
├── jest.config.js                               # Jest configuration
├── vitest.config.ts                             # Vitest configuration
│
├── integration/                                 # Integration tests
│   ├── security/                                # Security domain tests
│   │   ├── test_ghostwriter_api.py
│   │   ├── test_nemesis_api.py
│   │   └── test_misp_integration.py
│   ├── tcg/                                     # TCG domain tests
│   │   └── test_spellbook_api.py
│   ├── productivity/                            # Productivity tests
│   │   ├── test_mealie_api.py
│   │   └── test_actual_sync.py
│   ├── workflow/                                # Workflow tests
│   │   └── test_n8n_workflows.py
│   └── ai/                                      # AI tests
│       ├── test_firecrawl_api.py
│       ├── test_goose_agent.py
│       └── test_mcp_servers.py
│
├── e2e/                                         # End-to-end tests
│   ├── security/                                # Security E2E tests
│   │   ├── ghostwriter_flow.spec.ts
│   │   └── nemesis_flow.spec.ts
│   ├── tcg/                                     # TCG E2E tests
│   │   └── spellbook_flow.spec.ts
│   ├── productivity/                            # Productivity E2E tests
│   │   └── mealie_flow.spec.ts
│   ├── workflow/                                # Workflow E2E tests
│   │   └── n8n_flow.spec.ts
│   └── ai/                                      # AI E2E tests
│       └── firecrawl_flow.spec.ts
│
├── contract/                                    # Contract tests
│   ├── security/                                # Security contracts
│   ├── tcg/                                     # TCG contracts
│   ├── productivity/                            # Productivity contracts
│   ├── workflow/                                # Workflow contracts
│   └── ai/                                      # AI contracts
│
├── fixtures/                                    # Test fixtures
│   ├── security/                                # Security test data
│   ├── tcg/                                     # TCG test data
│   ├── productivity/                            # Productivity test data
│   ├── workflow/                                # Workflow test data
│   └── ai/                                      # AI test data
│
├── mocks/                                       # Mock services
│   ├── auth/                                    # Auth mocks
│   ├── database/                                # Database mocks
│   └── external/                                # External API mocks
│
└── utils/                                       # Test utilities
    ├── helpers.py                               # Python helpers
    ├── helpers.ts                               # TypeScript helpers
    └── factories/                               # Data factories
        ├── user.py
        ├── project.py
        └── workflow.py

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 8: SCRIPTS - BUILD & DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

scripts/                                         # Build & deployment scripts
│
├── README.md                                    # Scripts documentation
│
├── setup/                                       # Setup scripts
│   ├── install-dependencies.sh                  # Install all dependencies
│   ├── init-databases.sh                        # Initialize databases
│   ├── generate-certs.sh                        # Generate SSL certificates
│   └── setup-local.sh                           # Full local setup
│
├── build/                                       # Build scripts
│   ├── build-all.sh                             # Build all modules
│   ├── build-security.sh                        # Build security domain
│   ├── build-tcg.sh                             # Build TCG domain
│   ├── build-productivity.sh                    # Build productivity domain
│   ├── build-workflow.sh                        # Build workflow domain
│   ├── build-ai.sh                              # Build AI domain
│   └── docker/                                  # Docker build scripts
│       ├── build-images.sh                      # Build Docker images
│       ├── push-images.sh                       # Push to registry
│       └── clean-images.sh                      # Clean unused images
│
├── deploy/                                      # Deployment scripts
│   ├── deploy-dev.sh                            # Deploy to dev
│   ├── deploy-staging.sh                        # Deploy to staging
│   ├── deploy-prod.sh                           # Deploy to production
│   ├── rollback.sh                              # Rollback deployment
│   └── kubernetes/                              # K8s deployment scripts
│       ├── apply-manifests.sh                   # Apply K8s manifests
│       └── update-secrets.sh                    # Update secrets
│
├── database/                                    # Database scripts
│   ├── migrate.sh                               # Run migrations
│   ├── seed.sh                                  # Seed databases
│   ├── backup.sh                                # Backup databases
│   └── restore.sh                               # Restore from backup
│
├── testing/                                     # Testing scripts
│   ├── run-tests.sh                             # Run all tests
│   ├── run-unit-tests.sh                        # Run unit tests
│   ├── run-integration-tests.sh                 # Run integration tests
│   ├── run-e2e-tests.sh                         # Run E2E tests
│   └── coverage.sh                              # Generate coverage reports
│
├── monitoring/                                  # Monitoring scripts
│   ├── health-check.sh                          # Health check all services
│   ├── logs.sh                                  # View aggregated logs
│   └── metrics.sh                               # Collect metrics
│
└── utils/                                       # Utility scripts
    ├── format-code.sh                           # Format all code
    ├── lint-code.sh                             # Lint all code
    ├── generate-docs.sh                         # Generate documentation
    └── cleanup.sh                               # Clean build artifacts

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 9: MIGRATION STRATEGY
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

## Migration from Current Structure to Domain-Based Modules

### Phase 1: Create Domain Structure (Week 1)
```bash
# 1. Create modules directory
mkdir -p modules/{security,tcg,productivity,workflow,ai}

# 2. Create libs directory with minimal shared code
mkdir -p libs/{typescript,python,rust,go}

# 3. Keep infrastructure directory as-is
# infrastructure/ already exists
```

### Phase 2: Move Security Domain (Week 2)
```bash
# Move from features/security/ to modules/security/
mv features/security/Ghostwriter modules/security/ghostwriter
mv features/security/Nemesis modules/security/nemesis
mv features/security/MISP modules/security/misp
mv features/security/dispatch modules/security/dispatch
mv features/security/yara-x modules/security/yara-x
mv features/security/maltrail modules/security/maltrail
mv features/security/rita modules/security/rita
mv features/security/HELK modules/security/helk
mv features/security/CyberChef modules/security/cyberchef
mv features/security/MalwareBazaar_MCP modules/security/malwarebazaar-mcp
mv features/security/mcp-virustotal modules/security/virustotal-mcp

# Update docker-compose references
cp docker-compose.yml docker-compose.yml.backup
# Edit docker-compose.security.yml to point to modules/security/
```

### Phase 3: Move TCG Domain (Week 3)
```bash
# Move from features/ to modules/tcg/
mv features/commander-spellbook-backend modules/tcg/commander-spellbook
mv features/mtg-commander-map modules/tcg/commander-map
mv features/mtg-scripting-toolkit modules/tcg/scripting-toolkit

# Update docker-compose.tcg.yml
```

### Phase 4: Move Productivity Domain (Week 3)
```bash
# Move from features/ to modules/productivity/
mv features/mealie modules/productivity/mealie
mv features/actual modules/productivity/actual
mv features/it-tools modules/productivity/it-tools

# Update docker-compose.productivity.yml
```

### Phase 5: Move Workflow Domain (Week 4)
```bash
# Move from features/AI\ core/n8n to modules/workflow/
mv features/AI\ core/n8n modules/workflow/n8n
mv features/AI\ core/n8n-mcp-server modules/workflow/n8n-mcp

# Update docker-compose.workflow.yml
```

### Phase 6: Move AI Domain (Week 4-5)
```bash
# Move from features/AI\ core/ and apps/ai/ to modules/ai/
mv features/AI\ core/firecrawl modules/ai/firecrawl
mv features/AI\ core/firecrawl-mcp-server modules/ai/firecrawl-mcp
mv features/AI\ core/goose modules/ai/goose
mv features/chroma-mcp modules/ai/chroma-mcp
mv features/FileScopeMCP modules/ai/filescope-mcp
mv features/AI\ core/inspector modules/ai/inspector
mv apps/ai/analytics modules/ai/analytics
mv apps/ai/playwright-service modules/ai/playwright-service
mv apps/ai/go-html-to-md-service modules/ai/html-to-md-service
mv apps/ai/nuq-postgres modules/ai/nuq-postgres
mv features/AI\ core/KasmVNC modules/ai/kasmvnc

# Update docker-compose.ai.yml
```

### Phase 7: Extract Shared Libraries (Week 5-6)
```bash
# Analyze code for truly shared utilities
# Extract ONLY cross-domain code to libs/

# Example: Extract TypeScript common utilities
mkdir -p libs/typescript/common/src
# Move genuinely shared TypeScript code

# Example: Extract Python common utilities
mkdir -p libs/python/common/src
# Move genuinely shared Python code
```

### Phase 8: Update Infrastructure References (Week 6)
```bash
# Update infrastructure/ to reference modules/ instead of backend/ or apps/
# Update kong/kong.yml to point to new module paths
# Update graphql-gateway/src/subgraphs/ to reference modules/
# Update mcp-hub/src/servers/ to reference modules/
```

### Phase 9: Update CI/CD Pipelines (Week 7)
```bash
# Update .github/workflows/ to build domain-specific pipelines
# ci-security.yml -> builds modules/security/*
# ci-tcg.yml -> builds modules/tcg/*
# ci-productivity.yml -> builds modules/productivity/*
# ci-workflow.yml -> builds modules/workflow/*
# ci-ai.yml -> builds modules/ai/*
```

### Phase 10: Remove Old Directories (Week 8)
```bash
# After verifying everything works:
rm -rf features/
rm -rf apps/ (if empty after extracting to modules/)
rm -rf backend/ (if empty after extracting to modules/)

# Keep only:
# - modules/
# - libs/
# - infrastructure/
# - omninexus/
# - docs/
# - tests/
# - scripts/
```

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 10: DEPENDENCY RULES
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

## Module Dependency Principles

### 1. Modules are Independent
- ✅ modules/security/ghostwriter/ can use libs/python/common
- ✅ modules/tcg/commander-spellbook/ can use libs/typescript/ui-components
- ❌ modules/security/ghostwriter/ CANNOT import from modules/tcg/
- ❌ modules/productivity/mealie/ CANNOT import from modules/security/

### 2. Libs are Minimal
- Only extract to libs/ when code is used by 3+ modules across different domains
- Prefer duplication over premature abstraction
- Each lib should have a clear, single purpose

### 3. Infrastructure is Shared
- infrastructure/ components can be used by all modules
- Kong routes traffic to any module
- GraphQL gateway federates schemas from any module
- MCP hub routes requests to any MCP server in any module

### 4. Communication Between Modules
- Use events (via Dapr pub/sub or RabbitMQ)
- Use API calls through Kong API Gateway
- Use GraphQL federation through GraphQL Gateway
- NEVER direct code imports between modules

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 11: BENEFITS OF THIS STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

### 1. Clear Bounded Contexts
- Each domain (security, tcg, productivity, workflow, ai) is a clear bounded context
- Each module within a domain is independently deployable
- Business domains are explicit in the directory structure

### 2. Independent Development
- Teams can work on different domains without conflicts
- Each module maintains its internal structure (Django apps, FastAPI routes, Rust crates)
- No forced framework unification

### 3. Scalable Architecture
- Scale modules independently based on load
- Deploy only changed modules
- Roll back individual modules without affecting others

### 4. Technology Freedom
- Security domain can use Django (Ghostwriter), FastAPI (Dispatch), .NET (Nemesis), Rust (YARA-X)
- TCG domain can use Django (Spellbook) + Next.js (frontend)
- Productivity domain can use FastAPI (Mealie) + Nuxt.js (frontend)
- No tech-stack lock-in

### 5. Easy Navigation
- Developers immediately understand domain organization
- New team members can find relevant code quickly
- Clear ownership and responsibility

### 6. Minimal Shared Code
- Libs contain only truly cross-domain utilities
- Reduces coupling between modules
- Makes refactoring easier

### 7. Infrastructure Flexibility
- Centralized infrastructure/ makes cross-cutting concerns easy
- API Gateway, auth, databases, monitoring all in one place
- Easy to swap infrastructure components without touching modules

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              END OF FILE DIRECTORY LAYOUT
