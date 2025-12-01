/**
 * n8n AI Module
 * 
 * This module contains the n8n workflow automation platform components
 * migrated using the strangler fig pattern.
 * 
 * Components:
 * - db: Database entities with support for PostgreSQL, MySQL, MariaDB, SQLite
 * - core: Execution engine for workflow processing
 * - workflow: Expression evaluation and data transformation
 */

export * from './db';
export * from './core';
export * from './workflow';
