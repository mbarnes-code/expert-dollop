-- Migration Rollback: Drop prompts table
-- Version: 001
-- Description: Rollback initial schema for prompt management
-- Author: GitHub Copilot
-- Date: 2025-12-03

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop table (cascade will drop all indexes and constraints)
DROP TABLE IF EXISTS prompts CASCADE;

COMMIT;
