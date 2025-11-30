# Django MTG Project

This Django project handles Magic: The Gathering related backend functionality.

## Setup

```bash
cd backend/django/mtg
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Structure

- `mtg_project/` - Main Django project settings
- `cards/` - Card management app
- `decks/` - Deck building app
- `tournaments/` - Tournament management app
