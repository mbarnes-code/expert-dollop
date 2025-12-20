# Django Infrastructure

Shared Django web framework infrastructure and best practices for security domain projects.

## Projects Using Django

### Ghostwriter
- **Path**: `modules/security/ghostwriter`
- **Version**: Django 3.2
- **Python**: 3.10
- **Purpose**: Collaborative red team operations and assessment platform
- **Features**:
  - Project management
  - Report generation
  - Finding library
  - OpSec tracking
  - Team collaboration

## Common Configuration Files

### Dockerfile
```dockerfile
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### settings.py Structure
```python
# Core settings
import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env()
env.read_env(os.path.join(BASE_DIR, '.env'))

# Security
SECRET_KEY = env('DJANGO_SECRET_KEY')
DEBUG = env.bool('DJANGO_DEBUG', default=False)
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=[])
CSRF_TRUSTED_ORIGINS = env.list('DJANGO_CSRF_TRUSTED_ORIGINS', default=[])

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': env('POSTGRES_PORT', default='5432'),
    }
}

# Cache (Redis)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session backend
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### requirements.txt
```txt
# Core Django
Django==3.2.x
django-environ==0.9.0
psycopg2-binary==2.9.x

# Database & Caching
django-redis==5.2.x
redis==4.5.x

# API & GraphQL
djangorestframework==3.14.x
django-filter==22.1
graphene-django==3.0.x

# Authentication
django-allauth==0.52.x
djangorestframework-simplejwt==5.2.x

# Task Queue
celery==5.2.x
django-celery-beat==2.4.x

# Async support
channels==4.0.x
channels-redis==4.0.x

# Web server
gunicorn==20.1.x
whitenoise==6.3.x

# Security
django-cors-headers==3.13.x
django-csp==3.7

# Utilities
python-dateutil==2.8.x
pytz==2022.x
```

### docker-compose.yml
```yaml
services:
  django:
    build:
      context: .
      dockerfile: ./compose/production/django/Dockerfile
    image: security_django
    depends_on:
      - postgres
      - redis
    volumes:
      - ./app:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    env_file:
      - .env
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    healthcheck:
      test: curl --fail http://localhost:8000/health/ || exit 1
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - security-network

  celery_worker:
    build:
      context: .
      dockerfile: ./compose/production/django/Dockerfile
    image: security_django
    command: celery -A config.celery_app worker --loglevel=info
    depends_on:
      - postgres
      - redis
    env_file:
      - .env
    networks:
      - security-network

  celery_beat:
    build:
      context: .
      dockerfile: ./compose/production/django/Dockerfile
    image: security_django
    command: celery -A config.celery_app beat --loglevel=info
    depends_on:
      - postgres
      - redis
    env_file:
      - .env
    networks:
      - security-network

volumes:
  static_volume:
  media_volume:

networks:
  security-network:
```

## Django Project Structure

```
project/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── apps/
│   ├── users/
│   ├── api/
│   └── core/
├── static/
├── media/
├── templates/
├── requirements/
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
├── compose/
│   ├── production/
│   │   ├── django/
│   │   └── nginx/
│   └── local/
├── manage.py
└── .env.example
```

## Common Django Apps

### Authentication & Users
- `django.contrib.auth`
- `django-allauth` (social auth)
- Custom user models
- JWT tokens (REST API)

### API Development
- Django REST Framework
- GraphQL (Graphene)
- API versioning
- Pagination, filtering

### Task Queuing
- Celery (async tasks)
- Celery Beat (scheduled tasks)
- Redis as broker

### Real-time Features
- Django Channels (WebSockets)
- Server-Sent Events
- channels-redis

## Security Best Practices

### Authentication
- Use strong password validators
- Implement 2FA
- JWT token rotation
- Session timeout

### Authorization
- Django permissions system
- Row-level permissions
- API throttling
- CSRF protection

### Data Protection
- Encrypt sensitive data
- Use HTTPS only
- Secure cookies
- Content Security Policy

### Configuration
```python
# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 12}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

## Performance Optimization

### Database
- Use `select_related()` and `prefetch_related()`
- Database indices
- Query optimization
- Connection pooling

### Caching
- Redis caching
- Template fragment caching
- View caching
- QuerySet caching

### Static Files
- WhiteNoise for serving static files
- CDN for production
- Compression (gzip/brotli)
- Cache headers

## Testing

```python
# pytest configuration
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
python_files = tests.py test_*.py *_tests.py
addopts = --reuse-db --cov=. --cov-report=html

# Test example
import pytest
from django.test import Client

@pytest.mark.django_db
def test_user_creation():
    from apps.users.models import User
    user = User.objects.create_user(
        username='test',
        email='test@example.com',
        password='secure_password_123'
    )
    assert user.is_active
```

## Deployment

### Production Checklist
- [ ] DEBUG = False
- [ ] Secure SECRET_KEY
- [ ] ALLOWED_HOSTS configured
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Media files storage configured
- [ ] SSL/TLS enabled
- [ ] Security headers configured
- [ ] Logging configured
- [ ] Monitoring setup

### Environment Variables
```bash
# .env.example
DJANGO_SECRET_KEY=generate-with-django-secret-key-generator
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=example.com,www.example.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://example.com

POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=secure-password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379/0

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

## Integration with Hasura (Ghostwriter)

Ghostwriter uses Hasura GraphQL engine alongside Django:

```yaml
hasura:
  image: hasura/graphql-engine:latest
  ports:
    - "8080:8080"
  environment:
    HASURA_GRAPHQL_DATABASE_URL: postgres://user:pass@postgres:5432/db
    HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET}
    HASURA_ACTION_SECRET: ${HASURA_ACTION_SECRET}
  depends_on:
    - postgres
```

## Resources

- Django Documentation: https://docs.djangoproject.com
- Django REST Framework: https://www.django-rest-framework.org
- Celery Documentation: https://docs.celeryproject.org
- Ghostwriter: See `modules/security/ghostwriter/` for reference implementation
