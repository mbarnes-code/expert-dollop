-- PostgreSQL Schema: nemesis
-- Description: Nemesis game project data schema

CREATE SCHEMA IF NOT EXISTS nemesis;

SET search_path TO nemesis;

CREATE TABLE IF NOT EXISTS nemesis.characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(100),
    stats JSONB,
    abilities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nemesis.campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nemesis.sessions (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES nemesis.campaigns(id),
    session_number INTEGER,
    notes TEXT,
    events JSONB,
    played_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS nemesis.items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100),
    attributes JSONB,
    rarity VARCHAR(50)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON nemesis.sessions(campaign_id);
