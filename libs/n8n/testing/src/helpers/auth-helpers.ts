/**
 * Authentication test helpers for creating auth tokens and sessions
 */

/**
 * Create a mock JWT token for testing
 */
export function createMockJWT(payload: Record<string, any> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({
    sub: payload.userId || 'test-user-id',
    email: payload.email || 'test@example.com',
    role: payload.role || 'global:member',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  })).toString('base64');
  const signature = Buffer.from('mock-signature').toString('base64');
  
  return `${header}.${body}.${signature}`;
}

/**
 * Create a mock API key for testing
 */
export function createMockAPIKey(prefix: string = 'n8n_api'): string {
  const randomPart = Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
  
  return `${prefix}_${randomPart}`;
}

/**
 * Create mock auth headers for testing
 */
export interface AuthHeaders {
  'Authorization'?: string;
  'X-N8N-API-KEY'?: string;
  'Cookie'?: string;
}

export function createMockAuthHeaders(type: 'jwt' | 'apikey' | 'cookie' = 'jwt'): AuthHeaders {
  switch (type) {
    case 'jwt':
      return {
        'Authorization': `Bearer ${createMockJWT()}`
      };
    case 'apikey':
      return {
        'X-N8N-API-KEY': createMockAPIKey()
      };
    case 'cookie':
      return {
        'Cookie': `n8n-auth=${createMockJWT()}`
      };
  }
}

/**
 * Parse a mock JWT token (for testing only - not secure)
 */
export function parseMockJWT(token: string): Record<string, any> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
  return JSON.parse(payload);
}
