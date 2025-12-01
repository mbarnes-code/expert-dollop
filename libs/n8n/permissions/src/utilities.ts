import type { Scope, GlobalRole, ProjectRole, AuthPrincipal, ResourceScopes } from './types';
import { GLOBAL_ROLE_SCOPES, PROJECT_ROLE_SCOPES } from './scopes';

/**
 * Check if an auth principal has a specific scope
 */
export function hasScope(principal: AuthPrincipal, scope: Scope): boolean {
  return principal.scopes.includes(scope);
}

/**
 * Check if an auth principal has all specified scopes
 */
export function hasAllScopes(principal: AuthPrincipal, scopes: Scope[]): boolean {
  return scopes.every((scope) => hasScope(principal, scope));
}

/**
 * Check if an auth principal has any of the specified scopes
 */
export function hasAnyScope(principal: AuthPrincipal, scopes: Scope[]): boolean {
  return scopes.some((scope) => hasScope(principal, scope));
}

/**
 * Get scopes for a global role
 */
export function getGlobalRoleScopes(role: GlobalRole): Scope[] {
  return GLOBAL_ROLE_SCOPES[role] ?? [];
}

/**
 * Get scopes for a project role
 */
export function getProjectRoleScopes(role: ProjectRole): Scope[] {
  return PROJECT_ROLE_SCOPES[role] ?? [];
}

/**
 * Combine scopes from multiple sources
 */
export function combineScopes(...scopeArrays: Scope[][]): Scope[] {
  const uniqueScopes = new Set<Scope>();
  for (const scopes of scopeArrays) {
    for (const scope of scopes) {
      uniqueScopes.add(scope);
    }
  }
  return Array.from(uniqueScopes);
}

/**
 * Create an auth principal with default scopes based on role
 */
export function createAuthPrincipal(
  id: string,
  role: GlobalRole,
  additionalScopes: Scope[] = [],
): AuthPrincipal {
  const roleScopes = getGlobalRoleScopes(role);
  return {
    id,
    role,
    scopes: combineScopes(roleScopes, additionalScopes),
  };
}

/**
 * Calculate effective scopes for a user across all resources
 */
export function calculateEffectiveScopes(
  globalRole: GlobalRole,
  projectRoles: Map<string, ProjectRole>,
): ResourceScopes {
  const globalScopes = getGlobalRoleScopes(globalRole);
  const projectScopes = new Map<string, Scope[]>();

  for (const [projectId, role] of projectRoles) {
    projectScopes.set(projectId, combineScopes(globalScopes, getProjectRoleScopes(role)));
  }

  return {
    global: globalScopes,
    project: projectScopes,
    credential: new Map(),
    workflow: new Map(),
  };
}

/**
 * Check if a user can access a resource based on scopes
 */
export function canAccessResource(
  resourceScopes: ResourceScopes,
  resourceType: 'global' | 'project' | 'credential' | 'workflow',
  resourceId: string | undefined,
  requiredScope: Scope,
): boolean {
  // Global scopes always apply
  if (resourceScopes.global.includes(requiredScope)) {
    return true;
  }

  // Check resource-specific scopes if resourceId is provided
  if (resourceId && resourceType !== 'global') {
    // Type-safe access to resource scope maps
    const scopeMap = resourceType === 'project' 
      ? resourceScopes.project 
      : resourceType === 'credential'
        ? resourceScopes.credential
        : resourceScopes.workflow;
    
    const scopes = scopeMap.get(resourceId);
    if (scopes?.includes(requiredScope)) {
      return true;
    }
  }

  return false;
}
