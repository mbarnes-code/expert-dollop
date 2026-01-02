-- PostgreSQL Schema: dispatch
-- Description: Dispatch and routing operations schema

CREATE SCHEMA IF NOT EXISTS dispatch;

-- Set search path
SET search_path TO dispatch;

-- Core dispatch tables
CREATE TABLE IF NOT EXISTS dispatch.routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispatch.assignments (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES dispatch.routes(id),
    assignee_id VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS dispatch.events (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES dispatch.routes(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_routes_status ON dispatch.routes(status);
CREATE INDEX IF NOT EXISTS idx_assignments_route ON dispatch.assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_events_route ON dispatch.events(route_id);
