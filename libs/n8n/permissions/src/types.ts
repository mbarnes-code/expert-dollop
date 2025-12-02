/**
 * Scope types for permission management
 */

/**
 * All available scopes in the system
 */
export type Scope =
  // Workflow scopes
  | 'workflow:create'
  | 'workflow:read'
  | 'workflow:update'
  | 'workflow:delete'
  | 'workflow:move'
  | 'workflow:share'
  | 'workflow:execute'
  // Credential scopes
  | 'credential:create'
  | 'credential:read'
  | 'credential:update'
  | 'credential:delete'
  | 'credential:share'
  // User scopes
  | 'user:list'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:resetPassword'
  // Project scopes
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:list'
  // Tag scopes
  | 'tag:create'
  | 'tag:read'
  | 'tag:update'
  | 'tag:delete'
  | 'tag:list'
  // Folder scopes
  | 'folder:create'
  | 'folder:read'
  | 'folder:update'
  | 'folder:delete'
  | 'folder:list'
  // Variable scopes
  | 'variable:create'
  | 'variable:read'
  | 'variable:update'
  | 'variable:delete'
  | 'variable:list'
  // Execution scopes
  | 'execution:read'
  | 'execution:delete'
  | 'execution:list'
  // Log streaming scopes
  | 'logStreaming:manage'
  // External secrets scopes
  | 'externalSecrets:manage'
  // Source control scopes
  | 'sourceControl:pull'
  | 'sourceControl:push'
  | 'sourceControl:manage'
  // LDAP scopes
  | 'ldap:manage'
  | 'ldap:sync'
  // SAML scopes
  | 'saml:manage'
  // License scopes
  | 'license:manage'
  // Audit log scopes
  | 'auditLogs:read'
  // Debug scopes
  | 'debug:manage'
  // Community package scopes
  | 'communityPackage:manage'
  // MFA scopes
  | 'mfa:enable'
  | 'mfa:disable'
  // API key scopes
  | 'apiKey:manage';

/**
 * Global role types
 */
export type GlobalRole = 'global:owner' | 'global:admin' | 'global:member';

/**
 * Project role types
 */
export type ProjectRole =
  | 'project:admin'
  | 'project:editor'
  | 'project:viewer'
  | 'project:personalOwner';

/**
 * Credential role types
 */
export type CredentialRole = 'credential:owner' | 'credential:user';

/**
 * Workflow role types
 */
export type WorkflowRole = 'workflow:owner' | 'workflow:editor';

/**
 * All role types
 */
export type RoleType = GlobalRole | ProjectRole | CredentialRole | WorkflowRole;

/**
 * Scopes container for an entity
 */
export interface ScopesContainer {
  scopes: Set<Scope>;
}

/**
 * Auth principal with scopes
 */
export interface AuthPrincipal {
  id: string;
  role: GlobalRole;
  scopes: Scope[];
}

/**
 * Resource scopes by type
 */
export interface ResourceScopes {
  global: Scope[];
  project: Map<string, Scope[]>;
  credential: Map<string, Scope[]>;
  workflow: Map<string, Scope[]>;
}
