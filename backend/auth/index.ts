/**
 * Shared Authentication Module
 * 
 * This module provides a unified authentication abstraction layer
 * supporting multiple authentication methods:
 * - LDAP (Enterprise)
 * - SAML (Enterprise)
 * - OAuth2/OIDC (Enterprise)
 * 
 * Architecture:
 * - Uses abstract base classes for extensibility
 * - Follows DDD modular monolith best practices
 * - Supports multiple database backends (PostgreSQL, MySQL, MariaDB, SQLite)
 * 
 * @module auth
 */

export * from './core';
export * from './providers';
