import type { Scope, GlobalRole, ProjectRole, CredentialRole, WorkflowRole } from './types';

/**
 * Default scopes for the global owner role
 */
export const OWNER_SCOPES: Scope[] = [
  'workflow:create',
  'workflow:read',
  'workflow:update',
  'workflow:delete',
  'workflow:move',
  'workflow:share',
  'workflow:execute',
  'credential:create',
  'credential:read',
  'credential:update',
  'credential:delete',
  'credential:share',
  'user:list',
  'user:create',
  'user:update',
  'user:delete',
  'user:resetPassword',
  'project:create',
  'project:read',
  'project:update',
  'project:delete',
  'project:list',
  'tag:create',
  'tag:read',
  'tag:update',
  'tag:delete',
  'tag:list',
  'folder:create',
  'folder:read',
  'folder:update',
  'folder:delete',
  'folder:list',
  'variable:create',
  'variable:read',
  'variable:update',
  'variable:delete',
  'variable:list',
  'execution:read',
  'execution:delete',
  'execution:list',
  'logStreaming:manage',
  'externalSecrets:manage',
  'sourceControl:pull',
  'sourceControl:push',
  'sourceControl:manage',
  'ldap:manage',
  'ldap:sync',
  'saml:manage',
  'license:manage',
  'auditLogs:read',
  'debug:manage',
  'communityPackage:manage',
  'mfa:enable',
  'mfa:disable',
  'apiKey:manage',
];

/**
 * Default scopes for the global admin role
 */
export const ADMIN_SCOPES: Scope[] = [
  'workflow:create',
  'workflow:read',
  'workflow:update',
  'workflow:delete',
  'workflow:move',
  'workflow:share',
  'workflow:execute',
  'credential:create',
  'credential:read',
  'credential:update',
  'credential:delete',
  'credential:share',
  'user:list',
  'user:create',
  'user:update',
  'user:resetPassword',
  'project:create',
  'project:read',
  'project:update',
  'project:list',
  'tag:create',
  'tag:read',
  'tag:update',
  'tag:delete',
  'tag:list',
  'folder:create',
  'folder:read',
  'folder:update',
  'folder:delete',
  'folder:list',
  'variable:create',
  'variable:read',
  'variable:update',
  'variable:delete',
  'variable:list',
  'execution:read',
  'execution:delete',
  'execution:list',
  'ldap:manage',
  'ldap:sync',
  'auditLogs:read',
  'mfa:enable',
  'mfa:disable',
  'apiKey:manage',
];

/**
 * Default scopes for the global member role
 */
export const MEMBER_SCOPES: Scope[] = [
  'workflow:create',
  'workflow:read',
  'credential:create',
  'credential:read',
  'user:list',
  'project:read',
  'project:list',
  'tag:read',
  'tag:list',
  'folder:read',
  'folder:list',
  'variable:read',
  'variable:list',
  'execution:read',
  'execution:list',
  'mfa:enable',
  'mfa:disable',
  'apiKey:manage',
];

/**
 * Role to scopes mapping
 */
export const GLOBAL_ROLE_SCOPES: Record<GlobalRole, Scope[]> = {
  'global:owner': OWNER_SCOPES,
  'global:admin': ADMIN_SCOPES,
  'global:member': MEMBER_SCOPES,
};

/**
 * Project role scopes
 */
export const PROJECT_ADMIN_SCOPES: Scope[] = [
  'workflow:create',
  'workflow:read',
  'workflow:update',
  'workflow:delete',
  'workflow:move',
  'workflow:share',
  'workflow:execute',
  'credential:create',
  'credential:read',
  'credential:update',
  'credential:delete',
  'credential:share',
  'folder:create',
  'folder:read',
  'folder:update',
  'folder:delete',
  'folder:list',
];

export const PROJECT_EDITOR_SCOPES: Scope[] = [
  'workflow:create',
  'workflow:read',
  'workflow:update',
  'workflow:execute',
  'credential:create',
  'credential:read',
  'credential:update',
  'folder:read',
  'folder:list',
];

export const PROJECT_VIEWER_SCOPES: Scope[] = [
  'workflow:read',
  'credential:read',
  'folder:read',
  'folder:list',
];

/**
 * Project role to scopes mapping
 */
export const PROJECT_ROLE_SCOPES: Record<ProjectRole, Scope[]> = {
  'project:admin': PROJECT_ADMIN_SCOPES,
  'project:editor': PROJECT_EDITOR_SCOPES,
  'project:viewer': PROJECT_VIEWER_SCOPES,
  'project:personalOwner': PROJECT_ADMIN_SCOPES,
};
