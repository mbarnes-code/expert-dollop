-- Migration: Create prompts table
-- Version: 001
-- Description: Initial schema for prompt management
-- Author: GitHub Copilot
-- Date: 2025-12-03

-- Create prompts table with all constraints and indexes
BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    project_id VARCHAR(255),
    organization_id VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT prompts_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT prompts_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000),
    CONSTRAINT prompts_type_valid CHECK (type IN (
        'question-answering',
        'summarization',
        'entity-extraction',
        'text-generation',
        'translation',
        'classification',
        'custom'
    )),
    CONSTRAINT prompts_version_positive CHECK (version > 0)
);

-- Create indexes
CREATE INDEX idx_prompts_name ON prompts(name);
CREATE INDEX idx_prompts_project_id ON prompts(project_id);
CREATE INDEX idx_prompts_organization_id ON prompts(organization_id);
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_enabled ON prompts(enabled);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_project_enabled ON prompts(project_id, enabled) WHERE enabled = true;
CREATE UNIQUE INDEX idx_prompts_project_enabled_unique ON prompts(project_id) WHERE enabled = true AND project_id IS NOT NULL;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE prompts IS 'Stores AI prompts with versioning and multi-tenancy support';
COMMENT ON COLUMN prompts.id IS 'Unique identifier for the prompt';
COMMENT ON COLUMN prompts.name IS 'Human-readable name for the prompt';
COMMENT ON COLUMN prompts.description IS 'Optional description of what the prompt does';
COMMENT ON COLUMN prompts.content IS 'The actual prompt text/template';
COMMENT ON COLUMN prompts.type IS 'Type of prompt (question-answering, summarization, etc.)';
COMMENT ON COLUMN prompts.project_id IS 'Optional project identifier for multi-tenancy';
COMMENT ON COLUMN prompts.organization_id IS 'Optional organization identifier for multi-tenancy';
COMMENT ON COLUMN prompts.enabled IS 'Whether this prompt is currently active';
COMMENT ON COLUMN prompts.version IS 'Version number of the prompt (incremented on updates)';
COMMENT ON COLUMN prompts.created_at IS 'Timestamp when the prompt was created';
COMMENT ON COLUMN prompts.updated_at IS 'Timestamp when the prompt was last updated';

COMMIT;
