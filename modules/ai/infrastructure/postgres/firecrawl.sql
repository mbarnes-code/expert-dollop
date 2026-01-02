-- PostgreSQL Schema: firecrawl
-- Description: Firecrawl web scraping and crawling bounded context
-- Purpose: Scrape jobs, crawl jobs, documents, queue management, API usage

CREATE SCHEMA IF NOT EXISTS firecrawl;

SET search_path TO firecrawl;

-- DAPR state table (managed by DAPR)
CREATE TABLE IF NOT EXISTS firecrawl.dapr_state (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    etag VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API keys and authentication
CREATE TABLE IF NOT EXISTS firecrawl.api_keys (
    id VARCHAR(255) PRIMARY KEY,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    team_id VARCHAR(255),
    name VARCHAR(255),
    rate_limit INTEGER DEFAULT 100,
    credits INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scrape jobs (single URL scraping)
CREATE TABLE IF NOT EXISTS firecrawl.scrape_jobs (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    formats JSONB NOT NULL DEFAULT '["markdown"]',
    options JSONB,
    actions JSONB,
    result JSONB,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crawl jobs (multi-page crawling)
CREATE TABLE IF NOT EXISTS firecrawl.crawl_jobs (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    limit_pages INTEGER DEFAULT 100,
    max_depth INTEGER DEFAULT 3,
    scrape_options JSONB,
    crawl_options JSONB,
    discovered_urls INTEGER DEFAULT 0,
    completed_urls INTEGER DEFAULT 0,
    failed_urls INTEGER DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crawl pages (pages discovered during crawl)
CREATE TABLE IF NOT EXISTS firecrawl.crawl_pages (
    id VARCHAR(255) PRIMARY KEY,
    crawl_job_id VARCHAR(255) REFERENCES firecrawl.crawl_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    depth INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    result JSONB,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Map jobs (URL discovery)
CREATE TABLE IF NOT EXISTS firecrawl.map_jobs (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    search_query TEXT,
    discovered_links JSONB,
    total_links INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extract jobs (structured data extraction)
CREATE TABLE IF NOT EXISTS firecrawl.extract_jobs (
    id VARCHAR(255) PRIMARY KEY,
    urls JSONB NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    prompt TEXT,
    schema JSONB,
    result JSONB,
    error TEXT,
    total_urls INTEGER DEFAULT 0,
    completed_urls INTEGER DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search jobs (web search with scraping)
CREATE TABLE IF NOT EXISTS firecrawl.search_jobs (
    id VARCHAR(255) PRIMARY KEY,
    query TEXT NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    limit_results INTEGER DEFAULT 5,
    scrape_options JSONB,
    results JSONB,
    error TEXT,
    total_credits_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Batch scrape jobs
CREATE TABLE IF NOT EXISTS firecrawl.batch_scrape_jobs (
    id VARCHAR(255) PRIMARY KEY,
    urls JSONB NOT NULL,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    formats JSONB NOT NULL DEFAULT '["markdown"]',
    total_urls INTEGER DEFAULT 0,
    completed_urls INTEGER DEFAULT 0,
    failed_urls INTEGER DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents/cache (scraped content cache)
CREATE TABLE IF NOT EXISTS firecrawl.documents (
    id VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    url_hash VARCHAR(64) NOT NULL,
    markdown TEXT,
    html TEXT,
    metadata JSONB,
    links JSONB,
    screenshot_url TEXT,
    cache_ttl INTEGER DEFAULT 3600,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage metrics
CREATE TABLE IF NOT EXISTS firecrawl.usage_metrics (
    id SERIAL PRIMARY KEY,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    job_type VARCHAR(50) NOT NULL,
    job_id VARCHAR(255),
    credits_used INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Webhook endpoints
CREATE TABLE IF NOT EXISTS firecrawl.webhooks (
    id VARCHAR(255) PRIMARY KEY,
    api_key_id VARCHAR(255) REFERENCES firecrawl.api_keys(id),
    team_id VARCHAR(255),
    url TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '["crawl.completed", "scrape.completed"]',
    secret VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook deliveries
CREATE TABLE IF NOT EXISTS firecrawl.webhook_deliveries (
    id VARCHAR(255) PRIMARY KEY,
    webhook_id VARCHAR(255) REFERENCES firecrawl.webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempts INTEGER DEFAULT 1,
    delivered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Event log (for pub/sub and audit)
CREATE TABLE IF NOT EXISTS firecrawl.events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    data JSONB,
    api_key_id VARCHAR(255),
    team_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON firecrawl.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_team ON firecrawl.api_keys(team_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON firecrawl.api_keys(active);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON firecrawl.scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_api_key ON firecrawl.scrape_jobs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_team ON firecrawl.scrape_jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created ON firecrawl.scrape_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON firecrawl.crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_api_key ON firecrawl.crawl_jobs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_team ON firecrawl.crawl_jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created ON firecrawl.crawl_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_job ON firecrawl.crawl_pages(crawl_job_id);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_status ON firecrawl.crawl_pages(status);
CREATE INDEX IF NOT EXISTS idx_map_jobs_status ON firecrawl.map_jobs(status);
CREATE INDEX IF NOT EXISTS idx_map_jobs_created ON firecrawl.map_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extract_jobs_status ON firecrawl.extract_jobs(status);
CREATE INDEX IF NOT EXISTS idx_extract_jobs_created ON firecrawl.extract_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_jobs_status ON firecrawl.search_jobs(status);
CREATE INDEX IF NOT EXISTS idx_search_jobs_created ON firecrawl.search_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_scrape_jobs_status ON firecrawl.batch_scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_scrape_jobs_created ON firecrawl.batch_scrape_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_url_hash ON firecrawl.documents(url_hash);
CREATE INDEX IF NOT EXISTS idx_documents_expires ON firecrawl.documents(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_api_key ON firecrawl.usage_metrics(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_team ON firecrawl.usage_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_timestamp ON firecrawl.usage_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_api_key ON firecrawl.webhooks(api_key_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON firecrawl.webhooks(active);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON firecrawl.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_delivered ON firecrawl.webhook_deliveries(delivered);
CREATE INDEX IF NOT EXISTS idx_events_type ON firecrawl.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON firecrawl.events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON firecrawl.events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dapr_state_updated ON firecrawl.dapr_state(updated_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION firecrawl.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_keys_update_timestamp
    BEFORE UPDATE ON firecrawl.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

CREATE TRIGGER crawl_jobs_update_timestamp
    BEFORE UPDATE ON firecrawl.crawl_jobs
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

CREATE TRIGGER extract_jobs_update_timestamp
    BEFORE UPDATE ON firecrawl.extract_jobs
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

CREATE TRIGGER batch_scrape_jobs_update_timestamp
    BEFORE UPDATE ON firecrawl.batch_scrape_jobs
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

CREATE TRIGGER webhooks_update_timestamp
    BEFORE UPDATE ON firecrawl.webhooks
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

CREATE TRIGGER dapr_state_update_timestamp
    BEFORE UPDATE ON firecrawl.dapr_state
    FOR EACH ROW
    EXECUTE FUNCTION firecrawl.update_timestamp();

-- Comments
COMMENT ON SCHEMA firecrawl IS 'Firecrawl web scraping and crawling bounded context';
COMMENT ON TABLE firecrawl.api_keys IS 'API authentication and authorization keys';
COMMENT ON TABLE firecrawl.scrape_jobs IS 'Single URL scraping jobs';
COMMENT ON TABLE firecrawl.crawl_jobs IS 'Multi-page crawling jobs';
COMMENT ON TABLE firecrawl.crawl_pages IS 'Individual pages discovered during crawls';
COMMENT ON TABLE firecrawl.map_jobs IS 'URL discovery/mapping jobs';
COMMENT ON TABLE firecrawl.extract_jobs IS 'Structured data extraction jobs';
COMMENT ON TABLE firecrawl.search_jobs IS 'Web search with content scraping';
COMMENT ON TABLE firecrawl.batch_scrape_jobs IS 'Batch scraping of multiple URLs';
COMMENT ON TABLE firecrawl.documents IS 'Cached scraped content and metadata';
COMMENT ON TABLE firecrawl.usage_metrics IS 'API usage and billing metrics';
COMMENT ON TABLE firecrawl.webhooks IS 'Webhook endpoint configurations';
COMMENT ON TABLE firecrawl.webhook_deliveries IS 'Webhook delivery attempts and results';
COMMENT ON TABLE firecrawl.events IS 'Event log for pub/sub and audit trail';
COMMENT ON TABLE firecrawl.dapr_state IS 'DAPR state store table (managed by DAPR runtime)';
