-- PostgreSQL Schema: main
-- Description: Core application data schema

CREATE SCHEMA IF NOT EXISTS main;

SET search_path TO main;

CREATE TABLE IF NOT EXISTS main.users (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    profile JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main.memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES main.users(id),
    organization_id INTEGER REFERENCES main.organizations(id),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS main.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON main.users(email);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON main.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON main.memberships(organization_id);
