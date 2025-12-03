-- ============================================================================
-- Goose-n8n Integration Schema
-- ============================================================================
-- This schema provides database-level integration between Goose AI Agent
-- and n8n workflow automation platform, enabling:
-- - Cross-system execution tracking
-- - Performance analytics
-- - Audit trails
-- - Correlation of related operations

CREATE SCHEMA IF NOT EXISTS integration;

-- ============================================================================
-- Agent-Workflow Execution Mapping
-- ============================================================================

CREATE TABLE integration.agent_workflow_executions (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent context
    conversation_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255),
    agent_session_id VARCHAR(255),
    agent_user_id VARCHAR(255),
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(500),
    execution_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Execution details
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status: 'pending', 'running', 'success', 'error', 'cancelled', 'timeout'
    
    -- Input/Output data
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    error_code VARCHAR(100),
    error_details JSONB,
    
    -- Performance metrics
    duration_ms INTEGER,
    tokens_used INTEGER,
    nodes_executed INTEGER,
    api_calls_made INTEGER,
    
    -- Metadata
    correlation_id VARCHAR(255),  -- For tracking related operations
    tags VARCHAR(100)[],          -- For categorization
    metadata JSONB,                -- Additional custom metadata
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_workflow_conversation 
    ON integration.agent_workflow_executions(conversation_id);

CREATE INDEX idx_agent_workflow_execution 
    ON integration.agent_workflow_executions(execution_id);

CREATE INDEX idx_agent_workflow_status 
    ON integration.agent_workflow_executions(status, triggered_at DESC);

CREATE INDEX idx_agent_workflow_correlation 
    ON integration.agent_workflow_executions(correlation_id) 
    WHERE correlation_id IS NOT NULL;

CREATE INDEX idx_agent_workflow_time 
    ON integration.agent_workflow_executions(triggered_at DESC);

CREATE INDEX idx_agent_workflow_user 
    ON integration.agent_workflow_executions(agent_user_id) 
    WHERE agent_user_id IS NOT NULL;

-- ============================================================================
-- Workflow-Agent Action Mapping
-- ============================================================================

CREATE TABLE integration.workflow_agent_actions (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(500),
    execution_id VARCHAR(255) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    node_name VARCHAR(500),
    
    -- Agent action
    action_type VARCHAR(50) NOT NULL,
    -- Action types: 'message', 'tool-execution', 'recipe-creation', 'query'
    conversation_id VARCHAR(255),
    tool_name VARCHAR(255),
    recipe_name VARCHAR(255),
    
    -- Action details
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Status: 'pending', 'processing', 'success', 'error', 'timeout'
    
    -- Request/Response
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    error_code VARCHAR(100),
    
    -- Performance
    duration_ms INTEGER,
    tokens_used INTEGER,
    
    -- Metadata
    correlation_id VARCHAR(255),
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_agent_workflow 
    ON integration.workflow_agent_actions(workflow_id, execution_id);

CREATE INDEX idx_workflow_agent_conversation 
    ON integration.workflow_agent_actions(conversation_id) 
    WHERE conversation_id IS NOT NULL;

CREATE INDEX idx_workflow_agent_action_type 
    ON integration.workflow_agent_actions(action_type, triggered_at DESC);

CREATE INDEX idx_workflow_agent_status 
    ON integration.workflow_agent_actions(status, triggered_at DESC);

-- ============================================================================
-- Recipe-Workflow Step Mapping
-- ============================================================================

CREATE TABLE integration.recipe_workflow_steps (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipe context
    recipe_id VARCHAR(255) NOT NULL,
    recipe_name VARCHAR(500),
    recipe_execution_id UUID,
    step_index INTEGER NOT NULL,
    step_name VARCHAR(500),
    
    -- Workflow context
    workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(500),
    execution_id VARCHAR(255),
    
    -- Execution
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    -- Status: 'pending', 'running', 'success', 'error', 'skipped'
    
    -- Data flow
    input_data JSONB,
    output_data JSONB,
    input_mapping JSONB,   -- Maps recipe context to workflow input
    output_mapping JSONB,  -- Maps workflow output to recipe context
    
    -- Condition evaluation
    condition_expression TEXT,
    condition_result BOOLEAN,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 0,
    
    -- Performance
    duration_ms INTEGER,
    
    -- Metadata
    correlation_id VARCHAR(255),
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_recipe_step UNIQUE (recipe_execution_id, step_index)
);

-- Indexes
CREATE INDEX idx_recipe_workflow_recipe 
    ON integration.recipe_workflow_steps(recipe_id, recipe_execution_id);

CREATE INDEX idx_recipe_workflow_execution 
    ON integration.recipe_workflow_steps(execution_id) 
    WHERE execution_id IS NOT NULL;

CREATE INDEX idx_recipe_workflow_status 
    ON integration.recipe_workflow_steps(status, started_at DESC);

-- ============================================================================
-- Integration Events Log
-- ============================================================================

CREATE TABLE integration.event_log (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(50) NOT NULL,  -- 'goose' or 'n8n'
    
    -- Event details
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    correlation_id VARCHAR(255),
    
    -- Event payload
    payload JSONB NOT NULL,
    
    -- Related entities
    conversation_id VARCHAR(255),
    workflow_id VARCHAR(255),
    execution_id VARCHAR(255),
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    processing_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_log_type 
    ON integration.event_log(event_type, timestamp DESC);

CREATE INDEX idx_event_log_source 
    ON integration.event_log(event_source, timestamp DESC);

CREATE INDEX idx_event_log_correlation 
    ON integration.event_log(correlation_id) 
    WHERE correlation_id IS NOT NULL;

CREATE INDEX idx_event_log_processed 
    ON integration.event_log(processed, timestamp DESC);

CREATE INDEX idx_event_log_conversation 
    ON integration.event_log(conversation_id) 
    WHERE conversation_id IS NOT NULL;

-- ============================================================================
-- Integration Metrics (Materialized View)
-- ============================================================================

CREATE MATERIALIZED VIEW integration.execution_metrics AS
SELECT 
    -- Time buckets
    DATE_TRUNC('hour', triggered_at) as hour,
    DATE_TRUNC('day', triggered_at) as day,
    
    -- Grouping
    workflow_id,
    workflow_name,
    status,
    
    -- Metrics
    COUNT(*) as execution_count,
    AVG(duration_ms) as avg_duration_ms,
    MIN(duration_ms) as min_duration_ms,
    MAX(duration_ms) as max_duration_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median_duration_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
    
    AVG(nodes_executed) as avg_nodes_executed,
    AVG(tokens_used) as avg_tokens_used,
    SUM(tokens_used) as total_tokens_used,
    
    -- Success rate
    COUNT(*) FILTER (WHERE status = 'success') as successful_count,
    COUNT(*) FILTER (WHERE status = 'error') as failed_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate_pct
FROM 
    integration.agent_workflow_executions
WHERE
    triggered_at >= NOW() - INTERVAL '30 days'  -- Last 30 days
GROUP BY 
    DATE_TRUNC('hour', triggered_at),
    DATE_TRUNC('day', triggered_at),
    workflow_id,
    workflow_name,
    status;

-- Index on materialized view
CREATE INDEX idx_execution_metrics_day 
    ON integration.execution_metrics(day DESC);

CREATE INDEX idx_execution_metrics_workflow 
    ON integration.execution_metrics(workflow_id, day DESC);

-- ============================================================================
-- Update Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION integration.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_agent_workflow_executions_updated_at 
    BEFORE UPDATE ON integration.agent_workflow_executions
    FOR EACH ROW 
    EXECUTE FUNCTION integration.update_updated_at_column();

CREATE TRIGGER update_workflow_agent_actions_updated_at 
    BEFORE UPDATE ON integration.workflow_agent_actions
    FOR EACH ROW 
    EXECUTE FUNCTION integration.update_updated_at_column();

CREATE TRIGGER update_recipe_workflow_steps_updated_at 
    BEFORE UPDATE ON integration.recipe_workflow_steps
    FOR EACH ROW 
    EXECUTE FUNCTION integration.update_updated_at_column();

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function to get execution statistics for a conversation
CREATE OR REPLACE FUNCTION integration.get_conversation_stats(p_conversation_id VARCHAR)
RETURNS TABLE (
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    avg_duration_ms NUMERIC,
    total_tokens_used BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'success') as successful_executions,
        COUNT(*) FILTER (WHERE status = 'error') as failed_executions,
        ROUND(AVG(duration_ms)::NUMERIC, 2) as avg_duration_ms,
        SUM(tokens_used) as total_tokens_used
    FROM integration.agent_workflow_executions
    WHERE conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get workflow performance metrics
CREATE OR REPLACE FUNCTION integration.get_workflow_performance(
    p_workflow_id VARCHAR,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    workflow_id VARCHAR,
    workflow_name VARCHAR,
    total_executions BIGINT,
    success_rate NUMERIC,
    avg_duration_ms NUMERIC,
    p95_duration_ms NUMERIC,
    total_tokens_used BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        awe.workflow_id,
        MAX(awe.workflow_name) as workflow_name,
        COUNT(*) as total_executions,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate,
        ROUND(AVG(duration_ms)::NUMERIC, 2) as avg_duration_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::NUMERIC, 2) as p95_duration_ms,
        SUM(tokens_used) as total_tokens_used
    FROM integration.agent_workflow_executions awe
    WHERE 
        awe.workflow_id = p_workflow_id
        AND triggered_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY awe.workflow_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Refresh materialized view (call periodically, e.g., via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION integration.refresh_execution_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY integration.execution_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions (adjust as needed)
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA integration TO postgres;

-- Grant select, insert, update on tables
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA integration TO postgres;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA integration TO postgres;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON SCHEMA integration IS 'Cross-system integration schema for Goose AI Agent and n8n workflows';

COMMENT ON TABLE integration.agent_workflow_executions IS 
'Tracks workflows executed by Goose AI agent, linking conversations to workflow executions';

COMMENT ON TABLE integration.workflow_agent_actions IS 
'Tracks agent actions triggered by n8n workflows, enabling workflows to interact with AI';

COMMENT ON TABLE integration.recipe_workflow_steps IS 
'Maps Goose recipe steps to n8n workflows, enabling complex multi-workflow orchestration';

COMMENT ON TABLE integration.event_log IS 
'Centralized event log for all integration events across both systems';

COMMENT ON MATERIALIZED VIEW integration.execution_metrics IS 
'Pre-aggregated execution metrics for dashboard and analytics';
