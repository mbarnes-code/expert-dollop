# Django Security Project

This Django project handles security-related backend functionality.

## Setup

```bash
cd backend/django/security
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Structure

- `security_project/` - Main Django project settings
- `auth/` - Authentication and authorization app
- `audit/` - Audit logging app
- `compliance/` - Compliance management app
