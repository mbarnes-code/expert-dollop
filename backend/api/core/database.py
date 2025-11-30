"""
Database configuration utilities for both FastAPI and Django.
"""

import os
from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class PostgresSchema:
    """PostgreSQL schema configuration."""
    name: str
    description: str


# Define all 8 PostgreSQL schemas
POSTGRES_SCHEMAS = {
    "dispatch": PostgresSchema("dispatch", "Dispatch and routing operations"),
    "hexstrike": PostgresSchema("hexstrike", "HexStrike game data"),
    "mealie": PostgresSchema("mealie", "Mealie recipe management"),
    "tcg": PostgresSchema("tcg", "Trading Card Game data"),
    "nemesis": PostgresSchema("nemesis", "Nemesis game project data"),
    "main": PostgresSchema("main", "Core application data"),
    "ghostwriter": PostgresSchema("ghostwriter", "Ghostwriter content data"),
    "nemsis": PostgresSchema("nemsis", "NEMSIS medical data"),
}


@dataclass
class RedisDatabase:
    """Redis database configuration."""
    db: int
    purpose: str
    description: str


# Define all 9 Redis databases
REDIS_DATABASES = {
    "sessions": RedisDatabase(0, "sessions", "User session storage"),
    "cache": RedisDatabase(1, "cache", "Application cache"),
    "rate_limit": RedisDatabase(2, "rate_limit", "Rate limiting counters"),
    "queue": RedisDatabase(3, "queue", "Background job queues"),
    "pubsub": RedisDatabase(4, "pubsub", "Real-time pub/sub channels"),
    "security": RedisDatabase(5, "security", "Security tokens and locks"),
    "tcg": RedisDatabase(6, "tcg", "TCG game state cache"),
    "ai": RedisDatabase(7, "ai", "AI model cache and embeddings"),
    "analytics": RedisDatabase(8, "analytics", "Analytics data aggregation"),
}


def get_postgres_dsn(schema: str = "public") -> str:
    """Get PostgreSQL connection string with schema."""
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    name = os.environ.get("DB_NAME", "expert_dollop")
    user = os.environ.get("DB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD", "")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{name}?options=-c%20search_path%3D{schema}"


def get_redis_url(database: str = "cache") -> str:
    """Get Redis URL for specific database."""
    host = os.environ.get("REDIS_HOST", "localhost")
    port = os.environ.get("REDIS_PORT", "6379")
    password = os.environ.get("REDIS_PASSWORD", "")
    
    db_config = REDIS_DATABASES.get(database, REDIS_DATABASES["cache"])
    
    if password:
        return f"redis://:{password}@{host}:{port}/{db_config.db}"
    return f"redis://{host}:{port}/{db_config.db}"


def get_database_config() -> Dict[str, Any]:
    """Get complete database configuration."""
    return {
        "postgres": {
            "schemas": {k: v.__dict__ for k, v in POSTGRES_SCHEMAS.items()},
            "default_dsn": get_postgres_dsn(),
        },
        "redis": {
            "databases": {k: v.__dict__ for k, v in REDIS_DATABASES.items()},
            "default_url": get_redis_url(),
        }
    }
