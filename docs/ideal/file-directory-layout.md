╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    CONSOLIDATED MULTI-STAGE DDD MODULAR MONOLITHIC APPLICATION                          ║
║                                    FILE DIRECTORY LAYOUT                                                 ║
║                         (37 Features - Optimized Database Consolidation)                                ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

This document provides a comprehensive file directory layout for the consolidated multi-stage DDD modular 
monolithic application architecture. It maps out where each file type, Docker configuration, database schema,
and service component should reside in the monorepo structure.

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                                    SECTION 1: ROOT LEVEL STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

expert-dollop/                                    # Root monorepo directory
│
├── .github/                                      # GitHub workflows and actions
│   ├── workflows/                                # CI/CD pipeline definitions
│   │   ├── ci-build.yml                         # Main CI build for all contexts
│   │   ├── stage-1-edge.yml                     # Stage 1: Edge/Gateway layer
│   │   ├── stage-2-services.yml                 # Stage 2: Application services
│   │   ├── stage-3-infrastructure.yml           # Stage 3: Infrastructure layer
│   │   ├── stage-4-data.yml                     # Stage 4: Data persistence
│   │   ├── stage-5-testing.yml                  # Stage 5: Testing & dev tools
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
│   └── Dockerfile                               # Dev container image
│
├── .vscode/                                     # VS Code workspace settings
│   ├── settings.json                            # Editor settings
│   ├── extensions.json                          # Recommended extensions
│   ├── launch.json                              # Debug configurations
│   └── tasks.json                               # Task definitions
│
├── docker-compose.yml                           # **MAIN** Docker Compose (all stages)
├── docker-compose.dev.yml                       # Development override
├── docker-compose.prod.yml                      # Production override
├── docker-compose.test.yml                      # Testing override
│
├── docker-compose.stage-1-edge.yml             # Stage 1: Kong, Nginx
├── docker-compose.stage-2-services.yml         # Stage 2: All bounded contexts
├── docker-compose.stage-3-infra.yml            # Stage 3: Dapr, Redis, MCP Hub
├── docker-compose.stage-4-data.yml             # Stage 4: PostgreSQL, Redis, etc.
├── docker-compose.stage-5-testing.yml          # Stage 5: WireMock, Mailpit, etc.
│
├── Makefile                                     # Build automation commands
├── Taskfile.yml                                 # Modern task runner (alternative)
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
├── lerna.json                                   # Lerna monorepo management (optional)
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
├── apps/                                        # ➜ STAGE 2: Application/Service Layer
├── backend/                                     # ➜ STAGE 2: Backend Services
├── infrastructure/                              # ➜ STAGES 1, 3, 4, 5: Infrastructure
├── libs/                                        # ➜ Shared libraries (all stages)
├── docs/                                        # ➜ Documentation
├── tests/                                       # ➜ Integration & E2E tests
├── scripts/                                     # ➜ Build & deployment scripts
├── features/                                    # ➜ Original feature repos (reference)
└── omninexus/                                   # ➜ Unified dashboard/admin UI

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 2: BACKEND DIRECTORY - STAGE 2 SERVICES
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

backend/                                         # Backend services (Stage 2)
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
└── docker-compose.backend.yml                   # All backend services compose

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                             SECTION 3: APPS DIRECTORY - STAGE 2 FRONTENDS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

apps/                                            # Frontend applications (Stage 2)
│
├── portal/                                      # Main Public-Facing Website (User Entry Point)
│   ├── Dockerfile                               # Portal container
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js                           # Next.js configuration
│   ├── src/
│   │   ├── app/                                 # Next.js App Router
│   │   │   ├── layout.tsx                       # Root layout
│   │   │   ├── page.tsx                         # Home/landing page
│   │   │   ├── workflow/                        # Workflow context entry
│   │   │   │   └── page.tsx                     # Workflow overview + links to n8n
│   │   │   ├── security/                        # Security context entry
│   │   │   │   └── page.tsx                     # Security overview + links to apps
│   │   │   ├── productivity/                    # Productivity context entry
│   │   │   │   └── page.tsx                     # Productivity overview + links
│   │   │   ├── tcg/                             # TCG context entry
│   │   │   │   └── page.tsx                     # TCG overview + links
│   │   │   ├── ai/                              # AI/ML context entry
│   │   │   │   └── page.tsx                     # AI overview + links
│   │   │   └── api/                             # API routes
│   │   ├── components/                          # Portal-specific components
│   │   │   ├── Navigation/                      # Main navigation
│   │   │   ├── DomainCard/                      # Domain overview cards
│   │   │   ├── ServiceCard/                     # Service status cards
│   │   │   └── Footer/                          # Portal footer
│   │   ├── lib/                                 # Utilities
│   │   └── styles/                              # Portal styles
│   └── public/                                  # Static assets
│
├── omninexus/                                   # Unified Admin/Power-User Dashboard
│   ├── Dockerfile                               # OmniNexus container
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx                             # App entry
│   │   ├── App.tsx                              # Root component
│   │   ├── routes/                              # Dashboard routes (minimal switching)
│   │   │   ├── index.tsx                        # Main unified view
│   │   │   ├── overview.tsx                     # System overview (default)
│   │   │   ├── monitoring.tsx                   # Real-time monitoring
│   │   │   ├── logs.tsx                         # Centralized log viewer
│   │   │   └── admin.tsx                        # Admin controls
│   │   │
│   │   ├── components/                          # OmniNexus components
│   │   │   ├── UnifiedDashboard/                # Main dashboard layout
│   │   │   │   ├── WorkflowPanel.tsx            # Workflow context panel
│   │   │   │   ├── SecurityPanel.tsx            # Security context panel
│   │   │   │   ├── ProductivityPanel.tsx        # Productivity panel
│   │   │   │   ├── TCGPanel.tsx                 # TCG panel
│   │   │   │   └── AIMLPanel.tsx                # AI/ML panel
│   │   │   ├── MetricsGrid/                     # Metrics at-a-glance
│   │   │   ├── ServiceStatus/                   # All service statuses
│   │   │   ├── LogViewer/                       # Integrated log viewer
│   │   │   ├── GraphViewer/                     # Embedded Grafana/metrics
│   │   │   ├── ServiceControl/                  # Start/stop/restart controls
│   │   │   └── QuickActions/                    # Quick action toolbar
│   │   │
│   │   ├── integrations/                        # Embedded app integrations
│   │   │   ├── n8n-embed.tsx                    # Embedded n8n views
│   │   │   ├── ghostwriter-embed.tsx            # Embedded Ghostwriter
│   │   │   ├── kibana-embed.tsx                 # Embedded Kibana
│   │   │   ├── grafana-embed.tsx                # Embedded Grafana
│   │   │   └── index.ts                         # Integration registry
│   │   │
│   │   ├── services/                            # API clients
│   │   │   ├── graphql.ts                       # GraphQL client
│   │   │   ├── rest.ts                          # REST API client
│   │   │   ├── websocket.ts                     # WebSocket for real-time
│   │   │   └── mcp.ts                           # MCP client
│   │   │
│   │   ├── store/                               # State management
│   │   │   ├── services.ts                      # All services state
│   │   │   ├── metrics.ts                       # Real-time metrics
│   │   │   ├── logs.ts                          # Log streams
│   │   │   └── user.ts                          # User/auth state
│   │   │
│   │   └── styles/                              # OmniNexus styles
│   │       └── dashboard.css                    # Dashboard-specific styles
│   │
│   └── public/                                  # Static assets
│
├── shared/                                      # Shared Frontend Components & Utilities
│   ├── ui-components/                           # Shared UI Component Library
│   │   ├── package.json                         # Component library package
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts                       # Vite build config
│   │   ├── src/
│   │   │   ├── index.ts                         # Main export
│   │   │   ├── components/                      # React components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── Button.stories.tsx       # Storybook story
│   │   │   │   ├── Input/
│   │   │   │   ├── Table/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Card/
│   │   │   │   └── index.ts
│   │   │   ├── hooks/                           # Shared React hooks
│   │   │   │   ├── useFetch.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/                           # Utility functions
│   │   │   └── styles/                          # Shared styles
│   │   │       ├── theme.ts                     # Theme configuration
│   │   │       ├── tailwind.config.ts           # Tailwind config
│   │   │       └── globals.css                  # Global styles
│   │   └── .storybook/                          # Storybook configuration
│   │       ├── main.ts
│   │       └── preview.ts
│   │
│   ├── vue-components/                          # Shared Vue Component Library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/                      # Vue components
│   │   │   │   ├── VButton/
│   │   │   │   │   ├── VButton.vue
│   │   │   │   │   ├── VButton.test.ts
│   │   │   │   │   └── VButton.stories.ts
│   │   │   │   ├── VInput/
│   │   │   │   ├── VTable/
│   │   │   │   └── index.ts
│   │   │   ├── composables/                     # Vue composables
│   │   │   │   ├── useFetch.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   └── .storybook/
│   │
│   ├── design-system/                           # Design System Documentation
│   │   ├── Dockerfile                           # Storybook container
│   │   ├── package.json
│   │   ├── .storybook/                          # Main Storybook config
│   │   │   ├── main.ts                          # Storybook main config
│   │   │   ├── preview.ts                       # Preview configuration
│   │   │   └── manager.ts                       # Manager config
│   │   ├── stories/                             # Documentation stories
│   │   │   ├── Introduction.mdx                 # Getting started
│   │   │   ├── Colors.mdx                       # Color system
│   │   │   ├── Typography.mdx                   # Typography guide
│   │   │   └── Components.mdx                   # Component overview
│   │   └── public/                              # Static assets
│   │
│   └── types/                                   # Shared TypeScript types
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── user.ts                          # User types
│           ├── api.ts                           # API types
│           └── domain/                          # Domain types
│               ├── workflow.ts
│               ├── security.ts
│               ├── productivity.ts
│               └── tcg.ts
│
├── security/                                    # Security Context Frontends
│   ├── ghostwriter-ui/                          # Ghostwriter Frontend
│   │   ├── Dockerfile                           # React app container
│   │   ├── Dockerfile.dev                       # Development container
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx                         # App entry point
│   │   │   ├── App.tsx                          # Root component
│   │   │   ├── routes/                          # React Router routes
│   │   │   │   ├── index.tsx
│   │   │   │   ├── clients.tsx                  # Client management
│   │   │   │   ├── projects.tsx                 # Project tracking
│   │   │   │   ├── findings.tsx                 # Findings management
│   │   │   │   └── reports.tsx                  # Report generation
│   │   │   ├── components/                      # Ghostwriter components
│   │   │   │   ├── ClientList/
│   │   │   │   ├── ProjectCard/
│   │   │   │   ├── FindingEditor/
│   │   │   │   └── ReportBuilder/
│   │   │   ├── graphql/                         # GraphQL queries/mutations
│   │   │   │   ├── queries/
│   │   │   │   │   ├── clients.ts
│   │   │   │   │   ├── projects.ts
│   │   │   │   │   └── findings.ts
│   │   │   │   └── mutations/
│   │   │   │       ├── createClient.ts
│   │   │   │       └── updateFinding.ts
│   │   │   ├── hooks/                           # Custom hooks
│   │   │   ├── store/                           # State management (Zustand/Redux)
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── tests/
│   │
│   └── hexstrike-ui/                            # Hexstrike AI Testing UI
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.tsx
│           └── components/
│
├── workflow/                                    # Workflow Context Frontends
│   ├── n8n-frontend/                            # n8n Workflow Editor
│   │   ├── Dockerfile                           # n8n UI container
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── main.ts                          # Vue app entry
│   │   │   ├── App.vue                          # Root component
│   │   │   ├── views/                           # Vue views
│   │   │   │   ├── WorkflowEditor.vue           # Main editor
│   │   │   │   ├── ExecutionList.vue            # Execution history
│   │   │   │   └── CredentialsList.vue          # Credentials management
│   │   │   ├── components/                      # n8n components
│   │   │   │   ├── NodePanel/                   # Node selection panel
│   │   │   │   ├── Canvas/                      # Workflow canvas
│   │   │   │   ├── NodeSettings/                # Node configuration
│   │   │   │   └── ExecutionViewer/             # Execution results
│   │   │   ├── composables/                     # Vue composables
│   │   │   ├── store/                           # Pinia stores
│   │   │   │   ├── workflows.ts
│   │   │   │   ├── nodes.ts
│   │   │   │   └── credentials.ts
│   │   │   └── styles/
│   │   └── public/
│   │
│   └── benchmark-ui/                            # n8n Benchmark UI
│       ├── package.json
│       └── src/
│
├── productivity/                                # Productivity Context Frontends
│   ├── mealie-ui/                               # Mealie Recipe Manager UI
│   │   ├── Dockerfile                           # Vue app container
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── App.vue
│   │   │   ├── views/                           # Vue views
│   │   │   │   ├── RecipeList.vue
│   │   │   │   ├── RecipeDetail.vue
│   │   │   │   ├── MealPlanner.vue
│   │   │   │   └── ShoppingList.vue
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   └── store/
│   │   └── public/
│   │
│   ├── dispatch-ui/                             # Dispatch Incident Management UI
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       │   ├── incidents.tsx
│   │       │   ├── tasks.tsx
│   │       │   └── notifications.tsx
│   │       ├── components/
│   │       └── store/
│   │
│   ├── actual-ui/                               # Actual Budget UI
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       └── components/
│   │
│   └── it-tools-ui/                             # IT Tools Collection UI
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── views/                           # Tool views
│           │   ├── JsonFormatter.vue
│           │   ├── Base64Encoder.vue
│           │   ├── UuidGenerator.vue
│           │   └── index.ts
│           └── components/
│
├── tcg/                                         # TCG Context Frontends
│   ├── spellbook-ui/                            # Commander Spellbook Site
│   │   ├── Dockerfile                           # Next.js app container
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js                       # Next.js configuration
│   │   ├── src/
│   │   │   ├── app/                             # Next.js App Router
│   │   │   │   ├── layout.tsx                   # Root layout
│   │   │   │   ├── page.tsx                     # Home page
│   │   │   │   ├── search/                      # Search page
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── combo/                       # Combo details
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── api/                         # API routes
│   │   │   │       └── combos/
│   │   │   ├── components/                      # React components
│   │   │   │   ├── ComboCard/
│   │   │   │   ├── CardSearch/
│   │   │   │   └── ComboList/
│   │   │   ├── lib/                             # Utilities
│   │   │   └── styles/
│   │   └── public/
│   │
│   └── mtg-map-ui/                              # MTG Commander Map UI
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           └── components/
│
├── ai/                                          # AI/ML Context Frontends
│   ├── firecrawl-ui/                            # Firecrawl Web Interface
│   │   ├── Dockerfile                           # React app container
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── routes/
│   │   │   │   ├── crawl.tsx                    # Crawl management
│   │   │   │   ├── scrape.tsx                   # Scraping interface
│   │   │   │   └── jobs.tsx                     # Job monitoring
│   │   │   ├── components/
│   │   │   │   ├── CrawlConfig/
│   │   │   │   ├── JobList/
│   │   │   │   └── ResultViewer/
│   │   │   └── store/
│   │   └── public/
│   │
│   ├── inspector/                               # MCP Inspector UI
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── ServerList/                  # MCP server list
│   │       │   ├── ToolInspector/               # Tool testing
│   │       │   └── RequestLogger/               # Request logs
│   │       └── mcp/                             # MCP client
│   │
│   ├── analytics/                               # Analytics Dashboard
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       │   ├── dashboard.tsx                # Main dashboard
│   │       │   ├── reports.tsx                  # Report viewer
│   │       │   └── metrics.tsx                  # Metrics explorer
│   │       └── components/
│   │           ├── Charts/                      # Chart components
│   │           ├── MetricCard/
│   │           └── DataTable/
│   │
│   └── goose-ui/                                # Goose AI Interface (optional)
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│
└── docker-compose.apps.yml                      # All frontend apps compose

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                        SECTION 4: INFRASTRUCTURE DIRECTORY - STAGES 1, 3, 4, 5
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

infrastructure/                                  # Infrastructure components (Stages 1, 3, 4, 5)
│
├── README.md                                    # Infrastructure documentation
│
├── stage-1-edge/                                # STAGE 1: Edge/Gateway Layer
│   ├── kong/                                    # Kong API Gateway
│   │   ├── Dockerfile                           # Kong custom build
│   │   ├── docker-compose.yml                   # Kong standalone
│   │   ├── kong.yml                             # Declarative configuration
│   │   ├── plugins/                             # Custom plugins
│   │   │   └── (see backend/api/kong/plugins)
│   │   └── migrations/                          # Database migrations
│   │
│   └── nginx/                                   # Nginx Reverse Proxy
│       ├── Dockerfile                           # Nginx custom build
│       ├── docker-compose.yml                   # Nginx standalone
│       ├── nginx.conf                           # Main config
│       ├── conf.d/                              # Site configurations
│       │   ├── default.conf                     # Default site
│       │   ├── ghostwriter.conf                 # Ghostwriter routing
│       │   ├── n8n.conf                         # n8n routing
│       │   ├── firecrawl.conf                   # Firecrawl routing
│       │   ├── kibana.conf                      # Kibana routing
│       │   └── grafana.conf                     # Grafana routing
│       ├── ssl/                                 # SSL certificates
│       │   ├── certs/                           # Certificate files
│       │   └── dhparam.pem                      # DH parameters
│       └── static/                              # Static assets
│
├── stage-3-infrastructure/                      # STAGE 3: Infrastructure/Sidecar Layer
│   ├── dapr/                                    # Dapr Service Mesh
│   │   ├── Dockerfile.placement                 # Placement service
│   │   ├── Dockerfile.sidecar                   # Sidecar injector
│   │   ├── docker-compose.yml                   # Dapr components
│   │   ├── components/                          # Dapr components config
│   │   │   ├── pubsub-redis.yaml                # Redis pub/sub
│   │   │   ├── statestore-redis.yaml            # Redis state store
│   │   │   ├── secretstore.yaml                 # Secret store
│   │   │   └── bindings.yaml                    # Output bindings
│   │   ├── config/                              # Dapr configuration
│   │   │   ├── config.yaml                      # Main config
│   │   │   └── tracing.yaml                     # Tracing config
│   │   └── subscriptions/                       # Pub/sub subscriptions
│   │
│   ├── bullmq/                                  # BullMQ Job Queue
│   │   ├── Dockerfile.worker                    # Worker container
│   │   ├── docker-compose.yml                   # BullMQ setup
│   │   ├── workers/                             # Worker implementations
│   │   │   ├── email-worker.ts                  # Email processing
│   │   │   ├── report-worker.ts                 # Report generation
│   │   │   └── crawl-worker.ts                  # Web crawling
│   │   └── queues/                              # Queue configurations
│   │       ├── email.queue.ts
│   │       ├── report.queue.ts
│   │       └── crawl.queue.ts
│   │
│   ├── monitoring/                              # Monitoring & Metrics
│   │   ├── prometheus/                          # Prometheus
│   │   │   ├── Dockerfile                       # Custom Prometheus
│   │   │   ├── docker-compose.yml
│   │   │   ├── prometheus.yml                   # Main configuration
│   │   │   ├── alerts/                          # Alert rules
│   │   │   │   ├── containers.yml               # Container alerts
│   │   │   │   ├── services.yml                 # Service alerts
│   │   │   │   └── databases.yml                # Database alerts
│   │   │   └── targets/                         # Scrape targets
│   │   │
│   │   └── grafana/                             # Grafana
│   │       ├── Dockerfile                       # Custom Grafana
│   │       ├── docker-compose.yml
│   │       ├── grafana.ini                      # Main configuration
│   │       ├── dashboards/                      # Dashboard definitions
│   │       │   ├── system-overview.json         # System dashboard
│   │       │   ├── security-metrics.json        # Security metrics
│   │       │   ├── workflow-metrics.json        # Workflow metrics
│   │       │   └── database-metrics.json        # Database metrics
│   │       ├── provisioning/                    # Auto-provisioning
│   │       │   ├── datasources/                 # Data sources
│   │       │   │   ├── prometheus.yml
│   │       │   │   ├── elasticsearch.yml
│   │       │   │   └── postgres.yml
│   │       │   └── dashboards/                  # Dashboard config
│   │       └── plugins/                         # Custom plugins
│   │
│   ├── logging/                                 # Logging & Tracing
│   │   ├── syslog-ng/                           # Syslog-NG
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml
│   │   │   └── syslog-ng.conf                   # Configuration
│   │   │
│   │   ├── zipkin/                              # Zipkin Tracing
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml
│   │   │   └── zipkin.yml                       # Configuration
│   │   │
│   │   └── opentelemetry/                       # OpenTelemetry Collector
│   │       ├── Dockerfile
│   │       ├── docker-compose.yml
│   │       └── otel-collector-config.yml        # Collector config
│   │
│   └── service-mesh/                            # Service Discovery
│       └── nginx-load-balancer/                 # Nginx as LB
│           ├── Dockerfile
│           ├── nginx.conf                       # LB configuration
│           └── upstream.conf.template           # Upstream template
│
├── stage-4-data/                                # STAGE 4: Data Persistence Layer
│   ├── postgres/                                # PostgreSQL Database
│   │   ├── Dockerfile                           # Custom PostgreSQL image
│   │   ├── docker-compose.yml                   # PostgreSQL standalone
│   │   ├── postgresql.conf                      # Main configuration
│   │   ├── pg_hba.conf                          # Access control
│   │   ├── init/                                # Initialization scripts
│   │   │   ├── 00-extensions.sql                # Enable extensions
│   │   │   ├── 01-create-databases.sql          # Create databases
│   │   │   ├── 02-create-schemas.sql            # Create schemas
│   │   │   └── 03-create-users.sql              # Create users/roles
│   │   │
│   │   ├── schemas/                             # Schema Definitions (by context)
│   │   │   ├── workflow/                        # Workflow Context Schema
│   │   │   │   ├── 00-schema.sql                # Create workflow_schema
│   │   │   │   ├── 01-tables.sql                # Core tables
│   │   │   │   │   # Tables: n8n_main, n8n_executions, n8n_credentials,
│   │   │   │   │   #         n8n_workflows, benchmark_data
│   │   │   │   ├── 02-indexes.sql               # Indexes
│   │   │   │   ├── 03-constraints.sql           # Constraints
│   │   │   │   └── 04-functions.sql             # Stored functions
│   │   │   │
│   │   │   ├── security/                        # Security Context Schema
│   │   │   │   ├── 00-schema.sql                # Create security_schema
│   │   │   │   ├── 01-tables.sql                # Core tables
│   │   │   │   │   # Tables: ghostwriter_*, helk_metadata, maltrail_events,
│   │   │   │   │   #         nemesis_*, misp_*, kong_config
│   │   │   │   ├── 02-indexes.sql
│   │   │   │   ├── 03-constraints.sql
│   │   │   │   └── 04-functions.sql
│   │   │   │
│   │   │   ├── productivity/                    # Productivity Context Schema
│   │   │   │   ├── 00-schema.sql                # Create productivity_schema
│   │   │   │   ├── 01-tables.sql                # Core tables
│   │   │   │   │   # Tables: dispatch_*, mealie_*, actual_budget,
│   │   │   │   │   #         it_tools_data
│   │   │   │   ├── 02-indexes.sql
│   │   │   │   ├── 03-constraints.sql
│   │   │   │   └── 04-functions.sql
│   │   │   │
│   │   │   ├── tcg/                             # TCG Context Schema
│   │   │   │   ├── 00-schema.sql                # Create tcg_schema
│   │   │   │   ├── 01-tables.sql                # Core tables
│   │   │   │   │   # Tables: spellbook_*, mtg_cards, combo_index,
│   │   │   │   │   #         bot_state
│   │   │   │   ├── 02-indexes.sql
│   │   │   │   ├── 03-constraints.sql
│   │   │   │   └── 04-functions.sql
│   │   │   │
│   │   │   ├── ai_ml/                           # AI/ML Context Schema
│   │   │   │   ├── 00-schema.sql                # Create ai_ml_schema
│   │   │   │   ├── 01-tables.sql                # Core tables
│   │   │   │   │   # Tables: firecrawl_*, goose_sessions, analytics_meta,
│   │   │   │   │   #         playwright_jobs, chroma_metadata
│   │   │   │   ├── 02-indexes.sql
│   │   │   │   ├── 03-constraints.sql
│   │   │   │   └── 04-functions.sql
│   │   │   │
│   │   │   ├── testing/                         # Testing Schema
│   │   │   │   ├── 00-schema.sql                # Create testing_schema
│   │   │   │   ├── 01-tables.sql                # Test tables
│   │   │   │   │   # Tables: integration_tests, e2e_fixtures
│   │   │   │   └── 02-indexes.sql
│   │   │   │
│   │   │   └── shared/                          # Shared Schema
│   │   │       ├── 00-schema.sql                # Create shared_schema
│   │   │       ├── 01-tables.sql                # Shared tables
│   │   │       │   # Tables: users, auth_tokens, audit_log,
│   │   │       │   #         feature_flags, organizations
│   │   │       ├── 02-indexes.sql
│   │   │       ├── 03-constraints.sql
│   │   │       └── 04-functions.sql
│   │   │
│   │   ├── migrations/                          # Database Migrations (by context)
│   │   │   ├── workflow/                        # Workflow migrations
│   │   │   │   ├── 001_initial.sql
│   │   │   │   ├── 002_add_benchmark.sql
│   │   │   │   └── ...
│   │   │   ├── security/                        # Security migrations
│   │   │   ├── productivity/                    # Productivity migrations
│   │   │   ├── tcg/                             # TCG migrations
│   │   │   ├── ai_ml/                           # AI/ML migrations
│   │   │   ├── testing/                         # Testing migrations
│   │   │   └── shared/                          # Shared migrations
│   │   │
│   │   ├── backups/                             # Backup scripts
│   │   │   ├── backup.sh                        # Full backup
│   │   │   ├── restore.sh                       # Restore script
│   │   │   └── cron-backup.sh                   # Scheduled backup
│   │   │
│   │   └── scripts/                             # Utility scripts
│   │       ├── vacuum.sh                        # Vacuum database
│   │       ├── analyze.sh                       # Analyze tables
│   │       └── reindex.sh                       # Reindex tables
│   │
│   ├── redis/                                   # Redis Cache & Queue
│   │   ├── Dockerfile                           # Custom Redis image
│   │   ├── docker-compose.yml                   # Redis standalone
│   │   ├── redis.conf                           # Main configuration
│   │   ├── sentinel.conf                        # Sentinel configuration (HA)
│   │   ├── databases/                           # Database configurations
│   │   │   ├── README.md                        # Database allocation guide
│   │   │   │   # DB 0: n8n_queue
│   │   │   │   # DB 1: workflow_cache
│   │   │   │   # DB 2: security_cache
│   │   │   │   # DB 3: session_store
│   │   │   │   # DB 4: bullmq_jobs
│   │   │   │   # DB 5: kong_cache
│   │   │   │   # DB 6: api_rate_limit
│   │   │   │   # DB 7: temp_storage
│   │   │   │   # DB 8: firecrawl_jobs
│   │   │   │   # DB 9-15: (reserved)
│   │   │   └── init.redis                       # Initialization commands
│   │   │
│   │   ├── scripts/                             # Utility scripts
│   │   │   ├── flush-db.sh                      # Flush specific database
│   │   │   ├── monitor.sh                       # Monitor Redis
│   │   │   └── backup.sh                        # Backup RDB
│   │   │
│   │   └── cluster/                             # Redis Cluster config (optional)
│   │       ├── docker-compose.cluster.yml       # Cluster setup
│   │       └── redis-cluster.conf               # Cluster config
│   │
│   ├── elasticsearch/                           # Elasticsearch (Consolidated)
│   │   ├── Dockerfile                           # Custom Elasticsearch
│   │   ├── docker-compose.yml                   # Elasticsearch cluster
│   │   ├── elasticsearch.yml                    # Main configuration
│   │   ├── jvm.options                          # JVM settings
│   │   ├── log4j2.properties                    # Logging config
│   │   │
│   │   ├── indices/                             # Index templates & mappings
│   │   │   ├── helk/                            # HELK indices
│   │   │   │   ├── helk-template.json           # Index template
│   │   │   │   ├── helk-winlogbeat-mapping.json # Winlogbeat mapping
│   │   │   │   └── helk-sysmon-mapping.json     # Sysmon mapping
│   │   │   ├── securityonion/                   # Security Onion indices
│   │   │   │   ├── so-template.json             # Index template
│   │   │   │   ├── so-ids-mapping.json          # IDS alerts mapping
│   │   │   │   └── so-zeek-mapping.json         # Zeek logs mapping
│   │   │   └── logs/                            # General logs
│   │   │       └── logs-template.json           # General log template
│   │   │
│   │   ├── ilm/                                 # Index Lifecycle Management
│   │   │   ├── hot-warm-cold-delete.json        # ILM policy
│   │   │   └── retention-policy.json            # Retention policy
│   │   │
│   │   └── scripts/                             # Utility scripts
│   │       ├── create-indices.sh                # Create all indices
│   │       ├── snapshot.sh                      # Snapshot creation
│   │       └── restore.sh                       # Snapshot restore
│   │
│   ├── logstash/                                # Logstash (Shared)
│   │   ├── Dockerfile                           # Custom Logstash
│   │   ├── docker-compose.yml                   # Logstash standalone
│   │   ├── logstash.yml                         # Main configuration
│   │   ├── pipelines.yml                        # Pipeline routing
│   │   ├── pipeline/                            # Pipeline configurations
│   │   │   ├── helk.conf                        # HELK pipeline
│   │   │   ├── securityonion.conf               # Security Onion pipeline
│   │   │   └── general.conf                     # General logs pipeline
│   │   │
│   │   └── patterns/                            # Grok patterns
│   │       ├── windows.grok                     # Windows patterns
│   │       ├── linux.grok                       # Linux patterns
│   │       └── custom.grok                      # Custom patterns
│   │
│   ├── kibana/                                  # Kibana (Unified)
│   │   ├── Dockerfile                           # Custom Kibana
│   │   ├── docker-compose.yml                   # Kibana standalone
│   │   ├── kibana.yml                           # Main configuration
│   │   ├── spaces/                              # Kibana spaces
│   │   │   ├── helk-space.ndjson                # HELK workspace
│   │   │   ├── securityonion-space.ndjson       # Security Onion workspace
│   │   │   └── shared-space.ndjson              # Shared workspace
│   │   │
│   │   ├── dashboards/                          # Dashboard exports
│   │   │   ├── helk/                            # HELK dashboards
│   │   │   │   ├── hunting-overview.ndjson
│   │   │   │   └── threat-detection.ndjson
│   │   │   ├── securityonion/                   # Security Onion dashboards
│   │   │   │   ├── network-overview.ndjson
│   │   │   │   └── ids-alerts.ndjson
│   │   │   └── shared/                          # Shared dashboards
│   │   │       └── security-overview.ndjson
│   │   │
│   │   └── saved-objects/                       # Saved searches, visualizations
│   │
│   ├── clickhouse/                              # ClickHouse Analytics
│   │   ├── Dockerfile                           # Custom ClickHouse
│   │   ├── docker-compose.yml                   # ClickHouse standalone
│   │   ├── config.xml                           # Main configuration
│   │   ├── users.xml                            # User configuration
│   │   ├── databases/                           # Database schemas
│   │   │   ├── rita.sql                         # RITA database
│   │   │   └── helk_analytics.sql               # HELK analytics
│   │   │
│   │   └── tables/                              # Table definitions
│   │       ├── rita_beacons.sql                 # Beacon detection
│   │       ├── rita_dns.sql                     # DNS analysis
│   │       └── helk_events.sql                  # Event aggregation
│   │
│   ├── minio/                                   # MinIO Object Storage
│   │   ├── Dockerfile                           # Custom MinIO
│   │   ├── docker-compose.yml                   # MinIO standalone
│   │   ├── config/                              # MinIO configuration
│   │   │   └── config.env                       # Environment config
│   │   │
│   │   ├── buckets/                             # Bucket policies
│   │   │   ├── nemesis-files.json               # Nemesis bucket
│   │   │   ├── firecrawl-cache.json             # Firecrawl bucket
│   │   │   ├── backup-storage.json              # Backup bucket
│   │   │   ├── static-assets.json               # Static assets
│   │   │   └── debug-dumps.json                 # Debug dumps
│   │   │
│   │   └── lifecycle/                           # Lifecycle policies
│   │       ├── auto-delete-temp.json            # Auto-delete temp files
│   │       └── archive-old.json                 # Archive old files
│   │
│   ├── kafka/                                   # Apache Kafka (HELK)
│   │   ├── Dockerfile.broker                    # Kafka broker
│   │   ├── Dockerfile.zookeeper                 # Zookeeper
│   │   ├── docker-compose.yml                   # Kafka cluster
│   │   ├── server.properties                    # Broker config
│   │   └── topics/                              # Topic configurations
│   │       ├── winlogbeat.json                  # Winlogbeat topic
│   │       └── sysmon.json                      # Sysmon topic
│   │
│   └── spark/                                   # Apache Spark (HELK)
│       ├── Dockerfile.master                    # Spark master
│       ├── Dockerfile.worker                    # Spark worker
│       ├── docker-compose.yml                   # Spark cluster
│       ├── spark-defaults.conf                  # Spark config
│       └── notebooks/                           # Jupyter notebooks
│           ├── threat-hunting.ipynb             # Hunting notebook
│           └── data-analysis.ipynb              # Analysis notebook
│
├── stage-5-testing/                             # STAGE 5: Testing & Development
│   ├── wiremock/                                # WireMock API Mocking
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── mappings/                            # API mock definitions
│   │       ├── ghostwriter-api.json
│   │       ├── n8n-api.json
│   │       └── firecrawl-api.json
│   │
│   ├── mailpit/                                 # Mailpit Email Testing
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   │
│   ├── oidc-mock/                               # OIDC Mock Server
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── config/
│   │       └── clients.json                     # OAuth clients config
│   │
│   ├── grpcbin/                                 # gRPC Testing
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   │
│   ├── pgadmin/                                 # PgAdmin4
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── servers.json                         # Server definitions
│   │
│   └── ldap-mock/                               # LDAP Mock
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── ldif/                                # LDAP data
│           └── users.ldif
│
├── kubernetes/                                  # Kubernetes Manifests
│   ├── README.md                                # K8s deployment guide
│   ├── namespaces/                              # Namespace definitions
│   │   ├── workflow.yaml                        # Workflow namespace
│   │   ├── security.yaml                        # Security namespace
│   │   ├── productivity.yaml                    # Productivity namespace
│   │   ├── tcg.yaml                             # TCG namespace
│   │   ├── ai-ml.yaml                           # AI/ML namespace
│   │   ├── infrastructure.yaml                  # Infrastructure namespace
│   │   └── data.yaml                            # Data namespace
│   │
│   ├── stage-1-edge/                            # Stage 1 manifests
│   │   ├── kong/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── configmap.yaml
│   │   │   └── ingress.yaml
│   │   └── nginx/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── configmap.yaml
│   │
│   ├── stage-2-services/                        # Stage 2 manifests
│   │   ├── workflow/                            # Workflow services
│   │   │   └── n8n/
│   │   │       ├── deployment.yaml
│   │   │       ├── service.yaml
│   │   │       ├── configmap.yaml
│   │   │       └── pvc.yaml
│   │   ├── security/                            # Security services
│   │   │   ├── ghostwriter/
│   │   │   └── nemesis/
│   │   ├── productivity/                        # Productivity services
│   │   ├── tcg/                                 # TCG services
│   │   └── ai-ml/                               # AI/ML services
│   │
│   ├── stage-3-infrastructure/                  # Stage 3 manifests
│   │   ├── dapr/
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   └── zipkin/
│   │
│   ├── stage-4-data/                            # Stage 4 manifests
│   │   ├── postgres/
│   │   │   ├── statefulset.yaml
│   │   │   ├── service.yaml
│   │   │   ├── configmap.yaml
│   │   │   └── pvc.yaml
│   │   ├── redis/
│   │   ├── elasticsearch/
│   │   └── minio/
│   │
│   ├── helm/                                    # Helm Charts
│   │   ├── expert-dollop/                       # Main chart
│   │   │   ├── Chart.yaml
│   │   │   ├── values.yaml
│   │   │   ├── values.dev.yaml
│   │   │   ├── values.prod.yaml
│   │   │   └── templates/
│   │   └── charts/                              # Subcharts
│   │       ├── workflow/
│   │       ├── security/
│   │       └── data/
│   │
│   └── kustomize/                               # Kustomize Overlays
│       ├── base/                                # Base configurations
│       ├── overlays/
│       │   ├── development/                     # Dev overlay
│       │   ├── staging/                         # Staging overlay
│       │   └── production/                      # Production overlay
│       └── components/                          # Reusable components
│
└── docker/                                      # Docker Build Configurations
    ├── base/                                    # Base images
    │   ├── python.Dockerfile                    # Base Python image
    │   ├── node.Dockerfile                      # Base Node.js image
    │   ├── go.Dockerfile                        # Base Go image
    │   └── rust.Dockerfile                      # Base Rust image
    │
    ├── multi-stage/                             # Multi-stage builds
    │   ├── django.Dockerfile                    # Django multi-stage
    │   ├── fastapi.Dockerfile                   # FastAPI multi-stage
    │   └── nodejs.Dockerfile                    # Node.js multi-stage
    │
    └── scripts/                                 # Docker helper scripts
        ├── build-all.sh                         # Build all images
        ├── push-all.sh                          # Push to registry
        └── health-check.sh                      # Container health checks

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                         SECTION 5: LIBS DIRECTORY - SHARED LIBRARIES BY CONTEXT
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

libs/                                            # Shared libraries (all stages)
│
├── shared/                                      # Cross-context shared libraries
│   ├── typescript/                              # Shared TypeScript libraries
│   │   ├── utils/                               # Common utilities
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   └── src/
│   │   │       ├── index.ts
│   │   │       ├── date.ts                      # Date utilities
│   │   │       ├── string.ts                    # String utilities
│   │   │       ├── validation.ts                # Validation helpers
│   │   │       └── crypto.ts                    # Crypto helpers
│   │   │
│   │   ├── types/                               # Shared types (already in apps/shared/types)
│   │   ├── constants/                           # Shared constants
│   │   │   ├── package.json
│   │   │   └── src/
│   │   │       ├── index.ts
│   │   │       ├── http-status.ts               # HTTP status codes
│   │   │       ├── error-codes.ts               # Error codes
│   │   │       └── regex.ts                     # Common regex patterns
│   │   │
│   │   └── config/                              # Configuration management
│   │       ├── package.json
│   │       └── src/
│   │           ├── index.ts
│   │           ├── env.ts                       # Environment config
│   │           └── logger.ts                    # Logger configuration
│   │
│   ├── python/                                  # Shared Python libraries
│   │   ├── utils/                               # Common utilities
│   │   │   ├── setup.py
│   │   │   ├── pyproject.toml
│   │   │   └── shared_utils/
│   │   │       ├── __init__.py
│   │   │       ├── date.py
│   │   │       ├── string.py
│   │   │       ├── validation.py
│   │   │       └── crypto.py
│   │   │
│   │   ├── database/                            # Database utilities
│   │   │   ├── setup.py
│   │   │   └── shared_db/
│   │   │       ├── __init__.py
│   │   │       ├── session.py                   # SQLAlchemy session
│   │   │       ├── base.py                      # Base model classes
│   │   │       └── migrations.py                # Migration helpers
│   │   │
│   │   └── auth/                                # Authentication utilities
│   │       ├── setup.py
│   │       └── shared_auth/
│   │           ├── __init__.py
│   │           ├── jwt.py                       # JWT handling
│   │           ├── oauth.py                     # OAuth helpers
│   │           └── permissions.py               # Permission checks
│   │
│   ├── go/                                      # Shared Go libraries
│   │   ├── utils/                               # Common utilities
│   │   │   ├── go.mod
│   │   │   ├── go.sum
│   │   │   └── utils.go
│   │   │
│   │   └── database/                            # Database utilities
│   │       ├── go.mod
│   │       └── db.go
│   │
│   └── rust/                                    # Shared Rust libraries
│       ├── utils/                               # Common utilities
│       │   ├── Cargo.toml
│       │   └── src/
│       │       └── lib.rs
│       │
│       └── ffi/                                 # FFI bindings
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs
│               ├── python.rs                    # Python bindings
│               └── go.rs                        # Go bindings
│
├── workflow/                                    # Workflow Context Libraries
│   ├── n8n/                                     # n8n specific libraries
│   │   ├── custom-nodes/                        # Custom node library
│   │   │   ├── package.json
│   │   │   └── nodes/
│   │   │       ├── GhostwriterNode/             # Ghostwriter integration
│   │   │       ├── NemesisNode/                 # Nemesis integration
│   │   │       └── FirecrawlNode/               # Firecrawl integration
│   │   │
│   │   ├── credentials/                         # Custom credentials
│   │   │   ├── package.json
│   │   │   └── credentials/
│   │   │       ├── GhostwriterApi.credentials.ts
│   │   │       └── NemesisApi.credentials.ts
│   │   │
│   │   └── workflow-templates/                  # Workflow templates
│   │       ├── package.json
│   │       └── templates/
│   │           ├── security-scan.json           # Security scanning workflow
│   │           ├── report-generation.json       # Report generation
│   │           └── data-enrichment.json         # Data enrichment
│   │
│   └── bullmq/                                  # BullMQ queue libraries
│       ├── package.json
│       └── src/
│           ├── queue-factory.ts                 # Queue creation
│           ├── job-types.ts                     # Job type definitions
│           └── processors/                      # Job processors
│
├── security/                                    # Security Context Libraries
│   ├── ghostwriter/                             # Ghostwriter libraries
│   │   ├── reporting/                           # Report generation library
│   │   │   ├── setup.py
│   │   │   └── ghostwriter_reporting/
│   │   │       ├── __init__.py
│   │   │       ├── docx_generator.py            # DOCX reports
│   │   │       ├── pdf_generator.py             # PDF reports
│   │   │       └── templates/                   # Report templates
│   │   │
│   │   └── findings/                            # Findings library
│   │       ├── setup.py
│   │       └── ghostwriter_findings/
│   │           ├── __init__.py
│   │           ├── severity.py                  # Severity scoring
│   │           └── cvss.py                      # CVSS calculations
│   │
│   ├── nemesis/                                 # Nemesis libraries
│   │   ├── enrichment/                          # Data enrichment
│   │   │   ├── setup.py
│   │   │   └── nemesis_enrichment/
│   │   │       ├── __init__.py
│   │   │       ├── file_analysis.py
│   │   │       └── metadata_extraction.py
│   │   │
│   │   └── dapr-client/                         # Dapr client library
│   │       ├── setup.py
│   │       └── nemesis_dapr/
│   │           ├── __init__.py
│   │           ├── pubsub.py
│   │           └── state.py
│   │
│   ├── threat-intel/                            # Threat intelligence library
│   │   ├── setup.py
│   │   └── threat_intel/
│   │       ├── __init__.py
│   │       ├── misp.py                          # MISP integration
│   │       ├── ioc.py                           # IOC handling
│   │       └── enrichment.py                    # Threat enrichment
│   │
│   └── yara/                                    # YARA library
│       ├── Cargo.toml                           # Rust library
│       └── src/
│           ├── lib.rs
│           └── rules/                           # YARA rules
│
├── productivity/                                # Productivity Context Libraries
│   ├── mealie/                                  # Mealie libraries
│   │   ├── recipe-parser/                       # Recipe parsing
│   │   │   ├── setup.py
│   │   │   └── recipe_parser/
│   │   │       ├── __init__.py
│   │   │       ├── web_scraper.py               # Web recipe scraping
│   │   │       └── schema_org.py                # Schema.org parsing
│   │   │
│   │   └── meal-planning/                       # Meal planning algorithms
│   │       ├── setup.py
│   │       └── meal_planning/
│   │           ├── __init__.py
│   │           └── optimizer.py                 # Meal plan optimization
│   │
│   ├── dispatch/                                # Dispatch libraries
│   │   ├── incident/                            # Incident management
│   │   │   ├── setup.py
│   │   │   └── dispatch_incident/
│   │   │       ├── __init__.py
│   │   │       ├── severity.py                  # Severity calculation
│   │   │       └── workflow.py                  # Incident workflows
│   │   │
│   │   └── plugins/                             # Dispatch plugin SDK
│   │       ├── setup.py
│   │       └── dispatch_plugins/
│   │           ├── __init__.py
│   │           ├── base.py                      # Base plugin
│   │           └── slack.py                     # Slack integration
│   │
│   └── budget/                                  # Budget management library
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── sync.ts                          # Sync algorithm
│           └── reconcile.ts                     # Reconciliation
│
├── tcg/                                         # TCG Context Libraries
│   ├── spellbook/                               # Commander Spellbook libraries
│   │   ├── combo-finder/                        # Combo finding algorithm
│   │   │   ├── setup.py
│   │   │   └── combo_finder/
│   │   │       ├── __init__.py
│   │   │       ├── algorithm.py                 # Combo detection
│   │   │       └── graph.py                     # Graph analysis
│   │   │
│   │   └── card-parser/                         # MTG card parsing
│   │       ├── setup.py
│   │       └── card_parser/
│   │           ├── __init__.py
│   │           ├── scryfall.py                  # Scryfall API
│   │           └── rules.py                     # Rules parsing
│   │
│   └── mtg-data/                                # MTG data library
│       ├── setup.py
│       └── mtg_data/
│           ├── __init__.py
│           ├── cards.py                         # Card database
│           └── sets.py                          # Set information
│
└── ai/                                          # AI/ML Context Libraries
    ├── firecrawl/                               # Firecrawl libraries
    │   ├── crawlers/                            # Crawler library
    │   │   ├── package.json
    │   │   └── src/
    │   │       ├── index.ts
    │   │       ├── playwright-crawler.ts        # Playwright crawler
    │   │       └── puppeteer-crawler.ts         # Puppeteer crawler
    │   │
    │   └── scrapers/                            # Scraper library
    │       ├── package.json
    │       └── src/
    │           ├── index.ts
    │           ├── html-parser.ts               # HTML parsing
    │           └── markdown-converter.ts        # Markdown conversion
    │
    ├── goose/                                   # Goose AI libraries
    │   ├── mcp-sdk/                             # MCP SDK
    │   │   ├── Cargo.toml
    │   │   └── src/
    │   │       ├── lib.rs
    │   │       ├── server.rs                    # MCP server
    │   │       └── client.rs                    # MCP client
    │   │
    │   └── ai-toolkit/                          # AI toolkit
    │       ├── Cargo.toml
    │       └── src/
    │           ├── lib.rs
    │           └── llm.rs                       # LLM integration
    │
    ├── analytics/                               # Analytics libraries
    │   ├── ml-models/                           # ML models library
    │   │   ├── setup.py
    │   │   └── ml_models/
    │   │       ├── __init__.py
    │   │       ├── classifier.py                # Classification models
    │   │       └── anomaly.py                   # Anomaly detection
    │   │
    │   └── data-processing/                     # Data processing
    │       ├── setup.py
    │       └── data_processing/
    │           ├── __init__.py
    │           ├── etl.py                       # ETL pipelines
    │           └── transform.py                 # Data transformations
    │
    ├── mcp/                                     # MCP libraries
    │   ├── protocol/                            # MCP protocol library
    │   │   ├── package.json
    │   │   └── src/
    │   │       ├── index.ts
    │   │       ├── jsonrpc.ts                   # JSON-RPC 2.0
    │   │       ├── types.ts                     # MCP types
    │   │       └── client.ts                    # MCP client
    │   │
    │   └── servers/                             # MCP server libraries
    │       ├── chroma/                          # Chroma MCP
    │       │   ├── package.json
    │       │   └── src/
    │       ├── malware/                         # MalwareBazaar MCP
    │       │   ├── setup.py
    │       │   └── malware_mcp/
    │       └── virustotal/                      # VirusTotal MCP
    │           ├── setup.py
    │           └── virustotal_mcp/
    │
    └── playwright/                              # Playwright library
        ├── setup.py
        └── playwright_lib/
            ├── __init__.py
            ├── browser.py                       # Browser automation
            └── screenshot.py                    # Screenshot utilities

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                           SECTION 6: ADDITIONAL DIRECTORIES & FINAL STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

docs/                                            # Documentation
├── README.md                                    # Documentation index
├── architecture/                                # Architecture documentation
│   ├── overview.md                              # System overview
│   ├── stage-1-edge.md                          # Edge layer docs
│   ├── stage-2-services.md                      # Service layer docs
│   ├── stage-3-infrastructure.md                # Infrastructure docs
│   ├── stage-4-data.md                          # Data layer docs
│   ├── stage-5-testing.md                       # Testing layer docs
│   └── diagrams/                                # Architecture diagrams
│       ├── system-overview.png
│       ├── data-flow.png
│       └── deployment.png
│
├── api/                                         # API documentation
│   ├── graphql/                                 # GraphQL documentation
│   │   ├── schema.graphql                       # Combined schema
│   │   └── README.md                            # GraphQL guide
│   ├── rest/                                    # REST API docs
│   │   ├── openapi.yaml                         # OpenAPI spec
│   │   └── README.md                            # REST API guide
│   └── mcp/                                     # MCP protocol docs
│       ├── protocol.md                          # Protocol spec
│       └── servers.md                           # Server list
│
├── deployment/                                  # Deployment guides
│   ├── docker-compose.md                        # Docker Compose guide
│   ├── kubernetes.md                            # Kubernetes guide
│   ├── production.md                            # Production deployment
│   └── troubleshooting.md                       # Troubleshooting guide
│
├── development/                                 # Development guides
│   ├── getting-started.md                       # Getting started
│   ├── contributing.md                          # Contribution guide
│   ├── coding-standards.md                      # Coding standards
│   └── testing.md                               # Testing guide
│
├── enumeration/                                 # System enumeration docs
│   ├── theoretical-architecture.md              # Theoretical architecture
│   ├── file-directory-layout.md                 # This document!
│   └── technology-stack.md                      # Technology details
│
└── runbooks/                                    # Operational runbooks
    ├── backup-restore.md                        # Backup procedures
    ├── monitoring.md                            # Monitoring guide
    └── incident-response.md                     # Incident response

tests/                                           # Integration & E2E Tests
├── integration/                                 # Integration tests
│   ├── workflow/                                # Workflow context tests
│   │   └── test_n8n_integration.ts
│   ├── security/                                # Security context tests
│   │   ├── test_ghostwriter_api.py
│   │   └── test_nemesis_enrichment.py
│   ├── productivity/                            # Productivity context tests
│   ├── tcg/                                     # TCG context tests
│   └── ai/                                      # AI/ML context tests
│
├── e2e/                                         # End-to-end tests
│   ├── playwright/                              # Playwright E2E tests
│   │   ├── ghostwriter.spec.ts                  # Ghostwriter E2E
│   │   ├── n8n.spec.ts                          # n8n E2E
│   │   └── spellbook.spec.ts                    # Spellbook E2E
│   └── cypress/                                 # Cypress E2E tests
│
├── performance/                                 # Performance tests
│   ├── k6/                                      # k6 load tests
│   │   ├── api-load.js                          # API load test
│   │   └── workflow-load.js                     # Workflow load test
│   └── artillery/                               # Artillery tests
│
└── security/                                    # Security tests
    ├── zap/                                     # OWASP ZAP tests
    └── snyk/                                    # Snyk scans

scripts/                                         # Build & Deployment Scripts
├── build/                                       # Build scripts
│   ├── build-all.sh                             # Build all services
│   ├── build-stage.sh                           # Build specific stage
│   └── clean.sh                                 # Clean build artifacts
│
├── deploy/                                      # Deployment scripts
│   ├── deploy-dev.sh                            # Deploy to dev
│   ├── deploy-staging.sh                        # Deploy to staging
│   ├── deploy-prod.sh                           # Deploy to production
│   └── rollback.sh                              # Rollback deployment
│
├── database/                                    # Database scripts
│   ├── init-all-schemas.sh                      # Initialize all schemas
│   ├── migrate-all.sh                           # Run all migrations
│   ├── seed-dev-data.sh                         # Seed development data
│   └── backup-all.sh                            # Backup all databases
│
├── monitoring/                                  # Monitoring scripts
│   ├── health-check-all.sh                      # Check all services
│   └── metrics-export.sh                        # Export metrics
│
└── ci/                                          # CI/CD scripts
    ├── pr-check.sh                              # PR validation
    ├── integration-test.sh                      # Run integration tests
    └── security-scan.sh                         # Security scanning

features/                                        # Original Feature Repositories (Reference)
├── README.md                                    # Migration guide
└── [38 original project directories]           # Keep for reference during migration
    # These will eventually be deprecated after full migration

# Note: omninexus/ and portal/ are now in apps/ directory above

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                                SECTION 7: DOCKER COMPOSE FILE MAPPINGS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

DOCKER COMPOSE FILE HIERARCHY:
==============================

Root Level (Orchestration):
---------------------------
docker-compose.yml                               # MAIN: All stages together
  ├── includes:
  │   ├── docker-compose.stage-1-edge.yml
  │   ├── docker-compose.stage-2-services.yml
  │   ├── docker-compose.stage-3-infra.yml
  │   ├── docker-compose.stage-4-data.yml
  │   └── docker-compose.stage-5-testing.yml
  │
  └── overrides:
      ├── docker-compose.dev.yml                 # Development overrides
      ├── docker-compose.prod.yml                # Production overrides
      └── docker-compose.test.yml                # Testing overrides

Stage-Specific Compose Files:
------------------------------
docker-compose.stage-1-edge.yml                  # Stage 1: Kong, Nginx
docker-compose.stage-2-services.yml              # Stage 2: All bounded contexts
  ├── includes:
  │   ├── backend/docker-compose.backend.yml
  │   ├── apps/docker-compose.apps.yml
  │   ├── backend/django/docker-compose.django.yml
  │   ├── backend/fastapi/docker-compose.fastapi.yml
  │   └── backend/nodejs/docker-compose.nodejs.yml
  │
docker-compose.stage-3-infra.yml                 # Stage 3: Dapr, monitoring, logging
docker-compose.stage-4-data.yml                  # Stage 4: All databases
docker-compose.stage-5-testing.yml               # Stage 5: Testing services

Infrastructure Compose Files:
------------------------------
infrastructure/stage-1-edge/kong/docker-compose.yml
infrastructure/stage-1-edge/nginx/docker-compose.yml
infrastructure/stage-3-infrastructure/dapr/docker-compose.yml
infrastructure/stage-4-data/postgres/docker-compose.yml
infrastructure/stage-4-data/redis/docker-compose.yml
infrastructure/stage-4-data/elasticsearch/docker-compose.yml
infrastructure/stage-4-data/minio/docker-compose.yml

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                              SECTION 8: DOCKERFILE LOCATION MAPPING
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

DOCKERFILE HIERARCHY:
=====================

Base Images (infrastructure/docker/base/):
------------------------------------------
infrastructure/docker/base/python.Dockerfile     # Base Python image
infrastructure/docker/base/node.Dockerfile       # Base Node.js image
infrastructure/docker/base/go.Dockerfile         # Base Go image
infrastructure/docker/base/rust.Dockerfile       # Base Rust image

Multi-Stage Builds (infrastructure/docker/multi-stage/):
--------------------------------------------------------
infrastructure/docker/multi-stage/django.Dockerfile
infrastructure/docker/multi-stage/fastapi.Dockerfile
infrastructure/docker/multi-stage/nodejs.Dockerfile

Backend Service Dockerfiles:
----------------------------
backend/api/kong/Dockerfile                      # Kong API Gateway
backend/api/graphql-gateway/Dockerfile           # GraphQL Gateway
backend/api/mcp-hub/Dockerfile                   # MCP Hub
backend/auth/Dockerfile                          # Auth Service
backend/django/Dockerfile                        # Django base
backend/django/Dockerfile.dev                    # Django dev
backend/fastapi/Dockerfile                       # FastAPI base
backend/fastapi/Dockerfile.dev                   # FastAPI dev
backend/nodejs/n8n/Dockerfile                    # n8n main
backend/nodejs/n8n/Dockerfile.worker             # n8n worker
backend/nodejs/firecrawl/Dockerfile              # Firecrawl
backend/nodejs/actual/Dockerfile                 # Actual Budget
backend/services/python/maltrail/Dockerfile      # Maltrail
backend/services/go/rita/Dockerfile              # RITA
backend/services/go/html-to-md/Dockerfile        # HTML-to-MD
backend/services/rust/goose/Dockerfile           # Goose AI
backend/services/dotnet/nemesis/Dockerfile       # Nemesis

Frontend App Dockerfiles:
-------------------------
apps/portal/Dockerfile                           # Main public-facing website
apps/omninexus/Dockerfile                        # Admin/power-user unified dashboard
apps/shared/design-system/Dockerfile             # Storybook
apps/security/ghostwriter-ui/Dockerfile          # Ghostwriter UI
apps/workflow/n8n-frontend/Dockerfile            # n8n UI
apps/productivity/mealie-ui/Dockerfile           # Mealie UI
apps/productivity/dispatch-ui/Dockerfile         # Dispatch UI
apps/tcg/spellbook-ui/Dockerfile                 # Spellbook UI
apps/ai/firecrawl-ui/Dockerfile                  # Firecrawl UI
apps/ai/inspector/Dockerfile                     # MCP Inspector

Infrastructure Dockerfiles:
---------------------------
infrastructure/stage-1-edge/kong/Dockerfile
infrastructure/stage-1-edge/nginx/Dockerfile
infrastructure/stage-3-infrastructure/dapr/Dockerfile.placement
infrastructure/stage-3-infrastructure/dapr/Dockerfile.sidecar
infrastructure/stage-3-infrastructure/bullmq/Dockerfile.worker
infrastructure/stage-3-infrastructure/monitoring/prometheus/Dockerfile
infrastructure/stage-3-infrastructure/monitoring/grafana/Dockerfile
infrastructure/stage-4-data/postgres/Dockerfile
infrastructure/stage-4-data/redis/Dockerfile
infrastructure/stage-4-data/elasticsearch/Dockerfile
infrastructure/stage-4-data/clickhouse/Dockerfile
infrastructure/stage-4-data/minio/Dockerfile
infrastructure/stage-4-data/kafka/Dockerfile.broker
infrastructure/stage-4-data/kafka/Dockerfile.zookeeper
infrastructure/stage-4-data/spark/Dockerfile.master
infrastructure/stage-4-data/spark/Dockerfile.worker

Testing Dockerfiles:
--------------------
infrastructure/stage-5-testing/wiremock/Dockerfile
infrastructure/stage-5-testing/mailpit/Dockerfile
infrastructure/stage-5-testing/oidc-mock/Dockerfile
infrastructure/stage-5-testing/grpcbin/Dockerfile
infrastructure/stage-5-testing/pgadmin/Dockerfile

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                                   SECTION 9: MIGRATION SUMMARY
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

PROJECT TO NEW LOCATION MAPPING:
=================================

FRONTEND INFRASTRUCTURE:
------------------------
omninexus/ (existing)            → apps/omninexus/                    # Admin/power-user unified dashboard
NEW: Portal Website              → apps/portal/                       # Public-facing main website
apps/shared/design-system/       → Shared component library for all UIs

WORKFLOW CONTEXT:
-----------------
features/n8n/                    → backend/nodejs/n8n/ + apps/workflow/n8n-frontend/
features/n8n/packages/@n8n/benchmark/ → backend/nodejs/n8n/ + apps/workflow/benchmark-ui/

SECURITY CONTEXT:
-----------------
features/Ghostwriter/            → backend/django/ghostwriter/ + apps/security/ghostwriter-ui/
features/Nemesis/                → backend/services/dotnet/nemesis/ + backend/fastapi/nemesis-api/
features/goose/                  → backend/services/rust/goose/ + libs/ai/goose/
features/HELK/                   → infrastructure/stage-4-data/elasticsearch/ + kafka/ + spark/
features/securityonion/          → infrastructure/stage-4-data/elasticsearch/ (consolidated)
features/maltrail/               → backend/services/python/maltrail/
features/rita/                   → backend/services/go/rita/ + infrastructure/stage-4-data/clickhouse/
features/MISP/                   → backend/django/misp/
features/hexstrike-ai/           → apps/security/hexstrike-ui/ (GraphQL testing)
features/apiscout/               → tools/ (utility)
features/yara-x/                 → backend/services/rust/yara-x/ + libs/security/yara/

PRODUCTIVITY CONTEXT:
---------------------
features/dispatch/               → backend/fastapi/dispatch/ + apps/productivity/dispatch-ui/
features/mealie/                 → backend/fastapi/mealie/ + apps/productivity/mealie-ui/
features/actual/                 → backend/nodejs/actual/ + apps/productivity/actual-ui/
features/it-tools/               → apps/productivity/it-tools-ui/
features/CyberChef/              → apps/productivity/ (static site)

TCG CONTEXT:
------------
features/commander-spellbook-backend/ → backend/django/spellbook/
features/commander-spellbook-site/    → apps/tcg/spellbook-ui/
features/mtg-commander-map/           → apps/tcg/mtg-map-ui/ + libs/tcg/mtg-data/
features/mtg-scripting-toolkit/       → libs/tcg/spellbook/

AI/ML CONTEXT:
--------------
features/firecrawl/              → backend/nodejs/firecrawl/ + apps/ai/firecrawl-ui/
features/inspector/              → apps/ai/inspector/
features/chroma-mcp/             → libs/ai/mcp/servers/chroma/
features/MalwareBazaar_MCP/      → libs/ai/mcp/servers/malware/
features/mcp-virustotal/         → libs/ai/mcp/servers/virustotal/
features/n8n-mcp-server/         → backend/api/mcp-hub/ (integrated)
features/firecrawl-mcp-server/   → backend/api/mcp-hub/ (integrated)
features/FileScopeMCP/           → libs/ai/mcp/servers/filescope/

INFRASTRUCTURE:
---------------
features/kong/                   → backend/api/kong/ + infrastructure/stage-1-edge/kong/

TOOLS & UTILITIES:
------------------
features/blackarch/              → scripts/ or tools/ (scripts)
features/lscript/                → scripts/ (scripts)
features/onex/                   → scripts/ (scripts)
features/Brute-Ratel-C4-Community-Kit/ → tools/ (optional)
features/meterpreter/            → tools/ (optional)
features/KasmVNC/                → infrastructure/ (if used for remote access)
features/software-forensic-kit/  → tools/ (Java tools)

═══════════════════════════════════════════════════════════════════════════════════════════════════════════
                                      END OF FILE DIRECTORY LAYOUT
═══════════════════════════════════════════════════════════════════════════════════════════════════════════

NOTES:
======
1. All PostgreSQL schemas are defined in: infrastructure/stage-4-data/postgres/schemas/
2. All migrations are in: infrastructure/stage-4-data/postgres/migrations/
3. Redis database allocation is documented in: infrastructure/stage-4-data/redis/databases/README.md
4. Docker Compose files follow a hierarchical inclusion pattern
5. Dockerfiles are co-located with their respective services for easy maintenance
6. Shared libraries are organized by bounded context in libs/
7. Frontend apps use shared component libraries from apps/shared/
8. All infrastructure components have standalone docker-compose.yml for independent testing

MULTI-STAGE BUILD PROCESS:
===========================
Stage 1: Build edge layer (Kong, Nginx)
Stage 2: Build all application services (Django, FastAPI, Node.js, etc.)
Stage 3: Build infrastructure services (Dapr, monitoring, logging)
Stage 4: Initialize data layer (PostgreSQL schemas, Redis, Elasticsearch)
Stage 5: Build testing services (WireMock, Mailpit, etc.)

Each stage can be built and tested independently using:
  docker-compose -f docker-compose.stage-<N>-<name>.yml up --build

Full system build:
  docker-compose up --build

FRONTEND ACCESS PATTERNS:
=========================
Regular Users:
  → Access via apps/portal/ (main website)
  → Portal provides navigation to all domain-specific apps
  → Each domain app runs independently (n8n, Ghostwriter, Mealie, etc.)

Admin/Power Users:
  → Access via apps/omninexus/ (unified dashboard)
  → Single view of all services, metrics, logs, and controls
  → Embedded views from other apps (minimal page switching)
  → Real-time monitoring and management

