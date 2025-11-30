# PostgreSQL Database Configuration

This directory contains the PostgreSQL database schema configurations for the expert-dollop platform.

## Schemas

The database is organized into 8 distinct schemas:

1. **dispatch** - Dispatch and routing operations
2. **hexstrike** - HexStrike game data
3. **mealie** - Mealie recipe management
4. **tcg** - Trading Card Game data
5. **nemesis** - Nemesis game project data
6. **main** - Core application data
7. **ghostwriter** - Ghostwriter content data
8. **nemesis** - NEMESIS data

## Usage

Each schema is defined in its own SQL file and can be applied using standard PostgreSQL tools.

```bash
psql -h localhost -U postgres -d expert_dollop -f schemas/dispatch.sql
```
