-- PostgreSQL Schema: tcg
-- Description: Trading Card Game data schema

CREATE SCHEMA IF NOT EXISTS tcg;

SET search_path TO tcg;

CREATE TABLE IF NOT EXISTS tcg.cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set_code VARCHAR(50),
    card_number VARCHAR(50),
    rarity VARCHAR(50),
    card_type VARCHAR(100),
    attributes JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tcg.decks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(50),
    cards JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tcg.collections (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    card_id INTEGER REFERENCES tcg.cards(id),
    quantity INTEGER DEFAULT 1,
    condition VARCHAR(50),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tcg.tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    config JSONB,
    status VARCHAR(50) DEFAULT 'upcoming'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_set ON tcg.cards(set_code);
CREATE INDEX IF NOT EXISTS idx_decks_user ON tcg.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON tcg.collections(user_id);
