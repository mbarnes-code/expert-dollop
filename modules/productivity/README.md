# Productivity Domain

This domain contains all productivity-focused modules including:
- Mealie (Recipe & Meal Planning)
- Actual Budget (Personal Finance)
- IT Tools (Developer Utilities)

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
