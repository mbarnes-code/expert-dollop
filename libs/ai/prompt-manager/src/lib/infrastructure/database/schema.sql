-- Prompt Management Schema for PostgreSQL
-- Compatible with Netflix Dispatch database structure
--
-- This schema supports:
-- - Multi-tenancy (organization_id, project_id)
-- - Versioning
-- - Soft constraints (unique enabled per project)
-- - Audit trails (created_at, updated_at)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    -- Multi-tenancy
    project_id VARCHAR(255),
    organization_id VARCHAR(255),
    
    -- State
    enabled BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_prompts_organization_id ON prompts(organization_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_enabled ON prompts(enabled);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_prompts_project_enabled 
ON prompts(project_id, enabled) WHERE enabled = true;

-- Unique constraint: only one enabled prompt per project
-- This is a partial unique index (only for enabled prompts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_project_enabled_unique
ON prompts(project_id) WHERE enabled = true AND project_id IS NOT NULL;

-- Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
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
