-- PostgreSQL Schema: hexstrike
-- Description: HexStrike game data schema

CREATE SCHEMA IF NOT EXISTS hexstrike;

SET search_path TO hexstrike;

-- Game entities
CREATE TABLE IF NOT EXISTS hexstrike.games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hexstrike.players (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    game_id INTEGER REFERENCES hexstrike.games(id),
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hexstrike.moves (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES hexstrike.games(id),
    player_id INTEGER REFERENCES hexstrike.players(id),
    move_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_game ON hexstrike.players(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_game ON hexstrike.moves(game_id);
