-- PostgreSQL Schema: goose
-- Description: Goose AI Agent bounded context
-- Purpose: Conversations, recipes, extensions, agent state

CREATE SCHEMA IF NOT EXISTS goose;

SET search_path TO goose;

-- DAPR state table (managed by DAPR)
CREATE TABLE IF NOT EXISTS goose.dapr_state (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    etag VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS goose.conversations (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500),
    user_id VARCHAR(255),
    messages JSONB NOT NULL DEFAULT '[]',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS goose.recipes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    parameters JSONB,
    steps JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe executions table
CREATE TABLE IF NOT EXISTS goose.recipe_executions (
    id VARCHAR(255) PRIMARY KEY,
    recipe_id VARCHAR(255) REFERENCES goose.recipes(id),
    recipe_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    step_results JSONB NOT NULL DEFAULT '[]',
    context JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extensions table (MCP)
CREATE TABLE IF NOT EXISTS goose.extensions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    capabilities JSONB NOT NULL,
    config JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    loaded_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent sessions table
CREATE TABLE IF NOT EXISTS goose.agent_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    conversation_id VARCHAR(255) REFERENCES goose.conversations(id),
    provider VARCHAR(100),
    model VARCHAR(100),
    tools JSONB,
    metadata JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_tokens INTEGER DEFAULT 0,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0
);

-- Event log table (for pub/sub and audit)
CREATE TABLE IF NOT EXISTS goose.events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    data JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON goose.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON goose.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON goose.recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_recipe ON goose.recipe_executions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_status ON goose.recipe_executions(status);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_started ON goose.recipe_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_extensions_status ON goose.extensions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON goose.agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_conversation ON goose.agent_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON goose.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON goose.events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON goose.events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dapr_state_updated ON goose.dapr_state(updated_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION goose.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_update_timestamp
    BEFORE UPDATE ON goose.conversations
    FOR EACH ROW
    EXECUTE FUNCTION goose.update_timestamp();

CREATE TRIGGER recipes_update_timestamp
    BEFORE UPDATE ON goose.recipes
    FOR EACH ROW
    EXECUTE FUNCTION goose.update_timestamp();

CREATE TRIGGER extensions_update_timestamp
    BEFORE UPDATE ON goose.extensions
    FOR EACH ROW
    EXECUTE FUNCTION goose.update_timestamp();

CREATE TRIGGER dapr_state_update_timestamp
    BEFORE UPDATE ON goose.dapr_state
    FOR EACH ROW
    EXECUTE FUNCTION goose.update_timestamp();

-- Comments
COMMENT ON SCHEMA goose IS 'Goose AI Agent bounded context - conversations, recipes, extensions, agent state';
COMMENT ON TABLE goose.conversations IS 'Agent conversations with message history';
COMMENT ON TABLE goose.recipes IS 'Workflow automation recipes';
COMMENT ON TABLE goose.recipe_executions IS 'Recipe execution history and results';
COMMENT ON TABLE goose.extensions IS 'MCP extensions registry';
COMMENT ON TABLE goose.agent_sessions IS 'Agent execution sessions with token usage';
COMMENT ON TABLE goose.events IS 'Event log for pub/sub and audit trail';
COMMENT ON TABLE goose.dapr_state IS 'DAPR state store table (managed by DAPR runtime)';
