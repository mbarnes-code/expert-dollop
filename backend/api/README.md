# Backend API Layer

This directory contains the modular API layer for the expert-dollop platform.

## Architecture

The API layer is designed to support both FastAPI and Django REST Framework, allowing you to choose the framework that best fits your needs.

### Directory Structure

```
backend/api/
├── core/              # Shared API utilities and abstractions
├── fastapi/           # FastAPI implementation
└── django/            # Django REST Framework implementation
```

## Choosing Your Backend

### FastAPI
- High performance with async support
- Automatic OpenAPI/Swagger documentation
- Modern Python type hints
- Best for: Real-time applications, microservices

### Django REST Framework
- Full-featured admin interface
- Built-in authentication/authorization
- ORM with migrations
- Best for: Complex applications requiring rapid development

## Configuration

Set the `API_BACKEND` environment variable to choose your backend:

```bash
export API_BACKEND=fastapi  # or 'django'
```
