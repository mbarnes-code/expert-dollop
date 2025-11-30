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
├── domain/                    # Core domain layer
│   ├── entities/              # Domain entities (Card, Combo, Variant, etc.)
│   ├── repositories/          # Repository interfaces
│   └── services/              # Domain services
├── application/               # Application layer
│   └── use_cases/             # Application services/use cases
├── infrastructure/            # Infrastructure layer
│   └── (implementations)      # Repository implementations, adapters
├── spellbook_project/         # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── db_router.py          # Database router for migration
├── manage.py
├── requirements.txt
└── README.md
```

### Shared Libraries

This module uses shared DDD abstractions from `libs/shared/python/ddd/`:

- `Entity`, `AggregateRoot`, `ValueObject` - Base entity classes
- `Repository`, `ReadOnlyRepository` - Repository interfaces
- `DomainService`, `ApplicationService` - Service abstractions

## Domain Model

### Aggregate Roots

- **Card**: Magic: The Gathering cards with Scryfall data
- **Combo**: Recipes describing card combinations
- **Variant**: Specific instances of combos with concrete cards
- **Feature**: Effects produced by combos (e.g., "Infinite mana")
- **Template**: Abstract card requirements (e.g., "Any sacrifice outlet")

### Key Domain Services

- **ComboFinderService**: Finds combos based on available cards
- **BracketEstimatorService**: Estimates Commander deck power brackets

### Use Cases

- `FindMyCombosUseCase`: Find combos with user's card collection
- `EstimateBracketUseCase`: Estimate deck power level
- `SearchVariantsUseCase`: Search combo variants
- `GetVariantDetailsUseCase`: Get detailed variant information

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Redis 7+

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

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | (required) | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `expert_dollop` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | (required) | Database password |
| `REDIS_URL` | `redis://127.0.0.1:6379/7` | Redis URL |
| `ENABLE_LEGACY_API` | `true` | Enable legacy API compatibility |

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

### Code Style

Follow PEP 8 and use type hints. The codebase uses:
- Black for formatting
- isort for import sorting
- mypy for type checking

## Integration with Expert Dollop

This module integrates with the larger expert-dollop system:

- **DAPR**: Event-driven communication via pub/sub
- **Shared Libraries**: Uses `libs/shared/python/ddd` for DDD patterns
- **Database**: Uses PostgreSQL with schema isolation (`spellbook` schema)
- **Cache**: Uses Redis for caching (database 7)

## Legacy System Reference

Original Commander Spellbook backend: `features/commander-spellbook-backend/`

The strangler fig pattern allows this new implementation to gradually replace the legacy system while maintaining API compatibility.
