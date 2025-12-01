/**
 * Password validation constants
 */
export const MIN_PASSWORD_CHAR_LENGTH = 8;
export const MAX_PASSWORD_CHAR_LENGTH = 64;

/**
 * Authentication cookie name
 */
export const AUTH_COOKIE_NAME = 'n8n-auth';

/**
 * Response error messages
 */
export const RESPONSE_ERROR_MESSAGES = {
  USERS_QUOTA_REACHED: 'Maximum number of users reached',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  BAD_REQUEST: 'Bad request',
  INTERNAL_ERROR: 'Internal server error',
  MFA_REQUIRED: 'MFA verification required',
  INVALID_CREDENTIALS: 'Invalid credentials',
} as const;

export type ResponseErrorMessage = (typeof RESPONSE_ERROR_MESSAGES)[keyof typeof RESPONSE_ERROR_MESSAGES];

/**
 * User roles
 */
export const GLOBAL_OWNER_ROLE = {
  name: 'Owner',
  slug: 'global:owner',
  scope: 'global',
} as const;

export const GLOBAL_ADMIN_ROLE = {
  name: 'Admin',
  slug: 'global:admin',
  scope: 'global',
} as const;

export const GLOBAL_MEMBER_ROLE = {
  name: 'Member',
  slug: 'global:member',
  scope: 'global',
} as const;
