import {
  PROJECT_ADMIN_ROLE_SLUG,
  PROJECT_EDITOR_ROLE_SLUG,
  PROJECT_OWNER_ROLE_SLUG,
  PROJECT_VIEWER_ROLE_SLUG,
  type ProjectRole,
  type GlobalRole,
  type Role as RoleDTO,
} from '@expert-dollop/n8n-permissions';

/**
 * Role entity interface
 */
export interface Role {
  slug: string;
  displayName: string;
  scopes: Array<{ slug: string; displayName: string; description: string | null }>;
  systemRole: boolean;
  roleType: 'global' | 'project' | 'workflow' | 'credential';
  description: string | null;
}

/**
 * Convert a built-in role DTO to a Role entity
 */
export function builtInRoleToRoleObject(
  role: RoleDTO,
  roleType: 'global' | 'project' | 'workflow' | 'credential',
): Role {
  return {
    slug: role.slug,
    displayName: role.displayName,
    scopes: role.scopes.map((scope) => ({
      slug: scope,
      displayName: scope,
      description: null,
    })),
    systemRole: true,
    roleType,
    description: role.description ?? null,
  };
}

// Role slug constants for convenience
export const GLOBAL_OWNER_ROLE_SLUG = 'global:owner';
export const GLOBAL_ADMIN_ROLE_SLUG = 'global:admin';
export const GLOBAL_MEMBER_ROLE_SLUG = 'global:member';

export {
  PROJECT_ADMIN_ROLE_SLUG,
  PROJECT_EDITOR_ROLE_SLUG,
  PROJECT_OWNER_ROLE_SLUG,
  PROJECT_VIEWER_ROLE_SLUG,
};

export type { GlobalRole, ProjectRole };
