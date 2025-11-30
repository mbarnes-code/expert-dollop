# Commander Spellbook Backend

A Django-based backend for Commander Spellbook, integrated using the **Strangler Fig Pattern** for gradual migration into the expert-dollop modular monolith.

## Overview

This module provides the backend API for Commander Spellbook, a combo database engine for Magic: The Gathering's Commander format. It follows Domain-Driven Design (DDD) principles and is designed to work within the larger expert-dollop ecosystem.

## Architecture

### Strangler Fig Pattern

This integration uses the strangler fig pattern to gradually migrate functionality from the legacy Commander Spellbook backend:

1. **Phase 1**: Abstract domain layer with entity definitions
2. **Phase 2**: Repository interfaces and service abstractions  
3. **Phase 3**: Infrastructure implementations connecting to legacy data
4. **Phase 4**: Gradual migration of API endpoints
5. **Phase 5**: Full migration with legacy system retirement

### Domain-Driven Design Structure

```
backend/django/spellbook/
├── domain/                    # Core domain layer (DDD abstractions)
│   ├── entities/              # Domain entities (Card, Combo, Variant, etc.)
│   ├── repositories/          # Repository interfaces
│   └── services/              # Domain services
├── application/               # Application layer
│   └── use_cases/             # Application services/use cases
├── infrastructure/            # Infrastructure layer
├── spellbook_project/         # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── db_router.py          # Database router for migration
├── spellbook_app/             # Main Django spellbook app
│   ├── models/                # Django models
│   ├── views/                 # API views
│   ├── serializers/           # DRF serializers
│   ├── admin/                 # Admin configuration
│   ├── management/            # Management commands
│   ├── variants/              # Variant generation logic
│   ├── parsers/               # Input parsers
│   ├── transformers/          # Data transformers
│   └── tests/                 # Tests
├── website/                   # Website app
├── common/                    # Common utilities
│   ├── hybridrouter.py        # Hybrid router for API views
│   ├── abstractions.py        # Data classes
│   └── serializers.py         # Common serializers
├── bots/                      # Bot integrations
│   ├── discord/               # Discord bot
│   ├── reddit/                # Reddit bot
│   └── telegram/              # Telegram bot
├── client/                    # API client generators
│   ├── generate-client-python.sh
│   ├── generate-client-typescript.sh
│   └── generate-openapi.sh
├── nginx/                     # Nginx configurations
│   ├── demo.conf
│   └── production.conf
├── docs/                      # Documentation
├── Dockerfile                 # Docker build configuration
├── docker-compose.yml         # Development compose file
├── docker-compose.prod.yml    # Production compose file
├── manage.py
├── requirements.txt
└── README.md
```

### Shared Libraries

This module uses shared DDD abstractions from `libs/shared/python/ddd/`:

- `Entity`, `AggregateRoot`, `ValueObject` - Base entity classes
- `Repository`, `ReadOnlyRepository` - Repository interfaces
- `DomainService`, `ApplicationService` - Service abstractions

## Components

### Spellbook App

The main Django app containing:
- **Models**: Card, Combo, Variant, Feature, Template, and related models
- **Views**: REST API views for all resources
- **Serializers**: DRF serializers for data transformation
- **Admin**: Django admin configurations
- **Management Commands**: Data management and maintenance commands

### Website App

Supporting website functionality and properties management.

### Bots

Integration bots for:
- **Discord**: Discord bot for searching combos
- **Reddit**: Reddit bot for posting combo of the day
- **Telegram**: Telegram bot with inline search

### Nginx

Production-ready nginx configurations for:
- Demo environment (development)
- Production environment (with gzip, caching)

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Navigate to spellbook directory
cd backend/django/spellbook

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install shared library
pip install -e ../../../libs/shared/python

# Set environment variables
export DJANGO_SECRET_KEY="your-secret-key"
export DB_HOST="localhost"
export DB_NAME="expert_dollop"
export DB_USER="postgres"
export DB_PASSWORD="your-password"

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver 8003
```

### Docker Setup

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## API Endpoints

### Health & Info

- `GET /health` - Health check
- `GET /api/v1/info` - API information

### Spellbook API

- `GET /api/v1/variants/` - List variants
- `GET /api/v1/cards/` - List cards
- `GET /api/v1/features/` - List features
- `GET /api/v1/templates/` - List templates
- `POST /api/v1/find-my-combos/` - Find combos with cards
- `POST /api/v1/estimate-bracket/` - Estimate deck bracket

### DAPR Integration

- `GET /dapr/subscribe` - DAPR subscription configuration
- `POST /events/spellbook/*` - Event handlers

## Development

### Running Tests

```bash
pytest
```

### Linting

```bash
flake8
```

### Generating API Clients

```bash
cd client
./generate-openapi.sh
./generate-client-python.sh
./generate-client-typescript.sh
```

## Integration with Expert Dollop

This module integrates with the larger expert-dollop system:

- **DAPR**: Event-driven communication via pub/sub
- **Shared Libraries**: Uses `libs/shared/python/ddd` for DDD patterns
- **Database**: Uses PostgreSQL with schema isolation (`spellbook` schema)
- **Cache**: Uses Redis for caching (database 7)

## Legacy System Reference

Original Commander Spellbook backend: `features/commander-spellbook-backend/`

The strangler fig pattern allows this new implementation to gradually replace the legacy system while maintaining API compatibility.
