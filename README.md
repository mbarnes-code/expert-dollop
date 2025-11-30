# Expert-Dollop Platform

A domain-based NX monorepo implementing a comprehensive multi-domain architecture using PNPM as the package manager.

## Architecture Overview

This platform consists of 22 Next.js frontend applications organized by domain, with a modular backend supporting both FastAPI and Django, PostgreSQL with 8 schemas, Redis with 9 databases, and MCP server integration.

### Frontend Applications (Next.js + React)

| Domain | Applications | Count |
|--------|--------------|-------|
| **Security** | auth, firewall, scanner, monitor, vault, compliance, audit | 7 |
| **Productivity** | tasks, calendar, notes, documents, projects, dashboard | 6 |
| **AI** | chat, models, training, analytics | 4 |
| **TCG** | collection, decks, marketplace, tournaments, analytics | 5 |

### Backend Architecture

#### API Layer
- **FastAPI**: High-performance async API
- **Django REST Framework**: Full-featured web framework
- **Modular design**: Choose backend per service

#### Django Projects
- `mtg` - Magic: The Gathering backend
- `nemesis` - Nemesis game backend
- `security` - Security services backend

#### PostgreSQL Schemas (8)
| Schema | Purpose |
|--------|---------|
| dispatch | Dispatch and routing operations |
| hexstrike | HexStrike game data |
| mealie | Recipe management |
| tcg | Trading Card Game data |
| nemesis | Nemesis game data |
| main | Core application data |
| ghostwriter | Content management |
| nemsis | NEMSIS medical data |

#### Redis Databases (9)
| DB | Purpose |
|----|---------|
| 0 | User sessions |
| 1 | Application cache |
| 2 | Rate limiting |
| 3 | Job queues |
| 4 | Pub/sub channels |
| 5 | Security tokens |
| 6 | TCG state cache |
| 7 | AI model cache |
| 8 | Analytics data |

#### MCP Server Integration
- Extensible MCP server framework
- Tool, prompt, and resource protocols
- AI model integration ready

## Project Structure

```
expert-dollop/
├── apps/                          # Frontend applications
│   ├── security/                  # 7 security apps
│   ├── productivity/              # 6 productivity apps
│   ├── ai/                        # 4 AI apps
│   └── tcg/                       # 5 TCG apps
├── libs/                          # Shared libraries
│   ├── shared/                    # Cross-domain shared libs
│   ├── security/                  # Security domain libs
│   ├── productivity/              # Productivity domain libs
│   ├── ai/                        # AI domain libs
│   └── tcg/                       # TCG domain libs
├── backend/                       # Backend services
│   ├── api/                       # API layer (FastAPI/Django)
│   ├── django/                    # Django projects
│   └── services/                  # Additional services (MCP)
├── infrastructure/                # Infrastructure configs
│   ├── docker/                    # Docker configurations
│   ├── postgres/                  # PostgreSQL schemas
│   └── redis/                     # Redis configurations
└── tools/                         # Build tools and generators
```

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 10+
- Python 3.11+ (for backend)
- Docker & Docker Compose (for infrastructure)

### Installation

```bash
# Install dependencies
pnpm install

# Start infrastructure
cd infrastructure/docker
docker-compose up -d postgres redis

# Start development
pnpm dev
```

### Common Commands

```bash
# Build all projects
pnpm build

# Lint all projects
pnpm lint

# Test all projects
pnpm test

# Run specific app
pnpm nx dev security-auth

# Build specific library
pnpm nx build shared-ui
```

## Domain Architecture

### Security Domain
Applications and services for authentication, authorization, firewall management, security scanning, monitoring, vault management, compliance tracking, and audit logging.

### Productivity Domain
Applications for task management, calendar, notes, document editing, project management, and unified dashboards.

### AI Domain
Applications for AI chat interfaces, model management, training pipelines, and AI analytics.

### TCG Domain
Applications for trading card game collection management, deck building, marketplace, tournaments, and analytics.

## Backend Selection

The backend API layer supports both FastAPI and Django. Choose based on your needs:

### FastAPI
```bash
cd backend/api/fastapi
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Django
```bash
cd backend/django/mtg  # or nemesis, security
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## License

Apache-2.0