/**
 * HTTP request utilities for n8n nodes.
 * Provides common HTTP request patterns and helpers.
 */

/**
 * HTTP request options interface
 */
export interface IHttpRequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: unknown;
  qs?: Record<string, unknown>;
  json?: boolean;
  encoding?: string | null;
  timeout?: number;
  followRedirect?: boolean;
  maxRedirects?: number;
  resolveWithFullResponse?: boolean;
  agentOptions?: Record<string, unknown>;
}

/**
 * HTTP response interface
 */
export interface IHttpResponse<T = unknown> {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: T;
}

/**
 * OAuth2 configuration options
 */
export interface IOAuth2Options {
  /** Token type (e.g., 'Bearer') */
  tokenType?: string;
  /** Property to extract from token response */
  property?: string;
  /** Status code that indicates token has expired */
  tokenExpiredStatusCode?: number;
  /** Whether to include credentials on refresh body */
  includeCredentialsOnRefreshOnBody?: boolean;
  /** Whether to keep 'Bearer' prefix */
  keepBearer?: boolean;
  /** Custom header to include access token */
  keyToIncludeInAccessTokenHeader?: string;
}

/**
 * Body parameter for form submissions
 */
export interface IBodyParameter {
  name: string;
  value: string;
  parameterType?: 'formData' | 'formBinaryData';
}

/**
 * Authentication data sanitization keys
 */
export type AuthDataSanitizeKeys = {
  [key: string]: string[];
};

/**
 * Redacted placeholder for sensitive data
 */
export const REDACTED = '**hidden**';

/**
 * Common binary content types
 */
export const BINARY_CONTENT_TYPES = [
  'image/',
  'audio/',
  'video/',
  'application/octet-stream',
  'application/gzip',
  'application/zip',
  'application/vnd.rar',
  'application/epub+zip',
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-cdf',
  'application/vnd.amazon.ebook',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-fontobject',
  'application/vnd.oasis.opendocument.presentation',
  'application/pdf',
  'application/x-tar',
  'application/vnd.visio',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/x-7z-compressed',
];

/**
 * Headers that should be redacted in logs
 */
export const SENSITIVE_HEADERS = new Set([
  'authorization',
  'x-api-key',
  'x-auth-token',
  'cookie',
  'proxy-authorization',
  'sslclientcert',
]);

/**
 * Check if a content type is a binary type
 * @param contentType The content type to check
 */
export function isBinaryContentType(contentType: string): boolean {
  return BINARY_CONTENT_TYPES.some(type => contentType.toLowerCase().startsWith(type));
}

/**
 * Check if a header name is sensitive
 * @param headerName The header name to check
 */
export function isSensitiveHeader(headerName: string): boolean {
  return SENSITIVE_HEADERS.has(headerName.toLowerCase());
}

/**
 * Redact sensitive values from an object
 * @param obj The object to redact
 * @param secrets Array of secret values to redact
 */
export function redactSecrets<T = unknown>(obj: T, secrets: string[]): T {
  if (typeof obj === 'string') {
    return secrets.reduce((safe, secret) => safe.replace(secret, REDACTED), obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSecrets(item, secrets)) as T;
  }

  if (obj && typeof obj === 'object') {
    const result = { ...obj } as Record<string, unknown>;
    for (const [key, value] of Object.entries(result)) {
      result[key] = redactSecrets(value, secrets);
    }
    return result as T;
  }

  return obj;
}

/**
 * Sanitize request for UI display (remove sensitive data)
 * @param request The request options to sanitize
 * @param authDataKeys Keys that contain authentication data
 * @param secrets Optional array of secret values to redact
 */
export function sanitizeRequestForUi(
  request: IHttpRequestOptions,
  authDataKeys: AuthDataSanitizeKeys = {},
  secrets: string[] = [],
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...request };

  // Replace large binary data
  if (
    sanitized.body &&
    Buffer.isBuffer(sanitized.body) &&
    (sanitized.body as Buffer).length > 250000
  ) {
    sanitized.body = `Binary data replaced. Original size: ${(sanitized.body as Buffer).length} bytes.`;
  }

  // Redact authentication data
  for (const [property, keys] of Object.entries(authDataKeys)) {
    if (sanitized[property] && typeof sanitized[property] === 'object') {
      const propObj = sanitized[property] as Record<string, unknown>;
      const sanitizedProp: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(propObj)) {
        sanitizedProp[key] = keys.includes(key) ? REDACTED : value;
      }
      sanitized[property] = sanitizedProp;
    }
  }

  // Redact sensitive headers
  if (sanitized.headers && typeof sanitized.headers === 'object') {
    const headers = { ...sanitized.headers } as Record<string, string>;
    for (const headerName of Object.keys(headers)) {
      if (isSensitiveHeader(headerName)) {
        headers[headerName] = REDACTED;
      }
    }
    sanitized.headers = headers;
  }

  // Redact secrets from entire object
  if (secrets.length > 0) {
    return redactSecrets(sanitized, secrets);
  }

  return sanitized;
}

/**
 * Build URL with query parameters
 * @param baseUrl The base URL
 * @param params Query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Parse URL and extract components
 * @param urlString The URL to parse
 */
export function parseUrl(urlString: string): {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  params: Record<string, string>;
} {
  const url = new URL(urlString);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    search: url.search,
    params,
  };
}

/**
 * Merge headers with defaults
 * @param headers Custom headers
 * @param defaults Default headers
 */
export function mergeHeaders(
  headers: Record<string, string> = {},
  defaults: Record<string, string> = {},
): Record<string, string> {
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(headers)) {
    // Headers are case-insensitive, so we normalize
    const lowerKey = key.toLowerCase();
    const existingKey = Object.keys(merged).find(k => k.toLowerCase() === lowerKey);
    if (existingKey) {
      delete merged[existingKey];
    }
    merged[key] = value;
  }
  return merged;
}

/**
 * Create authorization header value
 * @param type Authorization type (e.g., 'Bearer', 'Basic')
 * @param credentials Credentials or token
 */
export function createAuthHeader(type: 'Bearer' | 'Basic' | 'Token', credentials: string): string {
  if (type === 'Basic') {
    // Credentials should be in format "username:password"
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }
  return `${type} ${credentials}`;
}

/**
 * Parse pagination parameters from headers
 * @param headers Response headers
 */
export function parsePaginationHeaders(headers: Record<string, string | string[]>): {
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
  nextUrl?: string;
  prevUrl?: string;
} {
  const result: {
    total?: number;
    perPage?: number;
    currentPage?: number;
    lastPage?: number;
    nextUrl?: string;
    prevUrl?: string;
  } = {};

  // Common header names for pagination
  const headerValue = (name: string) => {
    const value = headers[name] || headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const total = headerValue('X-Total-Count') || headerValue('X-Total');
  if (total) result.total = parseInt(total, 10);

  const perPage = headerValue('X-Per-Page') || headerValue('X-Page-Size');
  if (perPage) result.perPage = parseInt(perPage, 10);

  const currentPage = headerValue('X-Page') || headerValue('X-Current-Page');
  if (currentPage) result.currentPage = parseInt(currentPage, 10);

  // Parse Link header for next/prev URLs
  const linkHeader = headerValue('Link');
  if (linkHeader) {
    const links = parseLinkHeader(linkHeader);
    result.nextUrl = links.next;
    result.prevUrl = links.prev;
  }

  return result;
}

/**
 * Parse HTTP Link header
 * @param header Link header value
 */
export function parseLinkHeader(header: string): Record<string, string> {
  const links: Record<string, string> = {};

  header.split(',').forEach(part => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      links[match[2]] = match[1];
    }
  });

  return links;
}

/**
 * Retry configuration
 */
export interface IRetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
  /** Status codes that should trigger a retry */
  retryStatusCodes: number[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: IRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate retry delay
 * @param attempt Current attempt number (0-based)
 * @param config Retry configuration
 */
export function calculateRetryDelay(attempt: number, config: IRetryConfig = DEFAULT_RETRY_CONFIG): number {
  if (config.exponentialBackoff) {
    const delay = config.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelay);
  }
  return config.baseDelay;
}

/**
 * Check if a status code should trigger a retry
 * @param statusCode HTTP status code
 * @param config Retry configuration
 */
export function shouldRetry(statusCode: number, config: IRetryConfig = DEFAULT_RETRY_CONFIG): boolean {
  return config.retryStatusCodes.includes(statusCode);
}

/**
 * Rate limit information from headers
 */
export interface IRateLimitInfo {
  limit?: number;
  remaining?: number;
  reset?: Date;
  retryAfter?: number;
}

/**
 * Parse rate limit headers
 * @param headers Response headers
 */
export function parseRateLimitHeaders(headers: Record<string, string | string[]>): IRateLimitInfo {
  const headerValue = (name: string) => {
    const value = headers[name] || headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const info: IRateLimitInfo = {};

  const limit = headerValue('X-RateLimit-Limit') || headerValue('X-Rate-Limit-Limit');
  if (limit) info.limit = parseInt(limit, 10);

  const remaining = headerValue('X-RateLimit-Remaining') || headerValue('X-Rate-Limit-Remaining');
  if (remaining) info.remaining = parseInt(remaining, 10);

  const reset = headerValue('X-RateLimit-Reset') || headerValue('X-Rate-Limit-Reset');
  if (reset) {
    // Reset can be Unix timestamp or date string
    const resetValue = parseInt(reset, 10);
    if (!isNaN(resetValue)) {
      info.reset = new Date(resetValue * 1000);
    }
  }

  const retryAfter = headerValue('Retry-After');
  if (retryAfter) {
    const retryValue = parseInt(retryAfter, 10);
    if (!isNaN(retryValue)) {
      info.retryAfter = retryValue;
    }
  }

  return info;
}
