/**
 * @expert-dollop/n8n-permissions
 * 
 * Permission and scope management for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Types
export type {
  Scope,
  GlobalRole,
  ProjectRole,
  CredentialRole,
  WorkflowRole,
  RoleType,
  ScopesContainer,
  AuthPrincipal,
  ResourceScopes,
} from './types';

// Scope constants
export {
  OWNER_SCOPES,
  ADMIN_SCOPES,
  MEMBER_SCOPES,
  GLOBAL_ROLE_SCOPES,
  PROJECT_ADMIN_SCOPES,
  PROJECT_EDITOR_SCOPES,
  PROJECT_VIEWER_SCOPES,
  PROJECT_ROLE_SCOPES,
} from './scopes';

// Utilities
export {
  hasScope,
  hasAllScopes,
  hasAnyScope,
  getGlobalRoleScopes,
  getProjectRoleScopes,
  combineScopes,
  createAuthPrincipal,
  calculateEffectiveScopes,
  canAccessResource,
} from './utilities';
