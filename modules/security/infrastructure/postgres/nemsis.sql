-- PostgreSQL Schema: nemsis
-- Description: NEMSIS medical data schema

CREATE SCHEMA IF NOT EXISTS nemsis;

SET search_path TO nemsis;

CREATE TABLE IF NOT EXISTS nemsis.patients (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE,
    demographics JSONB,
    medical_history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nemsis.incidents (
    id SERIAL PRIMARY KEY,
    incident_number VARCHAR(100) UNIQUE NOT NULL,
    incident_type VARCHAR(100),
    location JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS nemsis.responses (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES nemsis.incidents(id),
    patient_id INTEGER REFERENCES nemsis.patients(id),
    responders JSONB,
    assessment JSONB,
    treatment JSONB,
    outcome VARCHAR(100),
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nemsis.units (
    id SERIAL PRIMARY KEY,
    unit_number VARCHAR(50) UNIQUE NOT NULL,
    unit_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    location JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_number ON nemsis.incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_responses_incident ON nemsis.responses(incident_id);
CREATE INDEX IF NOT EXISTS idx_responses_patient ON nemsis.responses(patient_id);
