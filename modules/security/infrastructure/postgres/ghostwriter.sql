-- PostgreSQL Schema: ghostwriter
-- Description: Ghostwriter content data schema

CREATE SCHEMA IF NOT EXISTS ghostwriter;

SET search_path TO ghostwriter;

CREATE TABLE IF NOT EXISTS ghostwriter.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ghostwriter.documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES ghostwriter.projects(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ghostwriter.templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    variables JSONB,
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS ghostwriter.revisions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES ghostwriter.documents(id),
    content TEXT,
    revision_number INTEGER,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_project ON ghostwriter.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_revisions_document ON ghostwriter.revisions(document_id);
