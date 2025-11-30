# Django Nemesis Project

This Django project handles Nemesis game backend functionality.

## Setup

```bash
cd backend/django/nemesis
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Structure

- `nemesis_project/` - Main Django project settings
- `characters/` - Character management app
- `campaigns/` - Campaign management app
- `inventory/` - Item and inventory app
