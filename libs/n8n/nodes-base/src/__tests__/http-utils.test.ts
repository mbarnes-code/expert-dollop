/**
 * Tests for HTTP utilities
 */

import {
  REDACTED,
  isBinaryContentType,
  isSensitiveHeader,
  redactSecrets,
  sanitizeRequestForUi,
  buildUrl,
  parseUrl,
  mergeHeaders,
  createAuthHeader,
  parsePaginationHeaders,
  parseLinkHeader,
  calculateRetryDelay,
  shouldRetry,
  parseRateLimitHeaders,
  DEFAULT_RETRY_CONFIG,
} from '../http/http-utils';

describe('isBinaryContentType', () => {
  it('should return true for image types', () => {
    expect(isBinaryContentType('image/png')).toBe(true);
    expect(isBinaryContentType('image/jpeg')).toBe(true);
  });

  it('should return true for audio types', () => {
    expect(isBinaryContentType('audio/mpeg')).toBe(true);
  });

  it('should return true for video types', () => {
    expect(isBinaryContentType('video/mp4')).toBe(true);
  });

  it('should return true for binary application types', () => {
    expect(isBinaryContentType('application/pdf')).toBe(true);
    expect(isBinaryContentType('application/zip')).toBe(true);
  });

  it('should return false for text types', () => {
    expect(isBinaryContentType('text/plain')).toBe(false);
    expect(isBinaryContentType('text/html')).toBe(false);
  });

  it('should return false for JSON', () => {
    expect(isBinaryContentType('application/json')).toBe(false);
  });
});

describe('isSensitiveHeader', () => {
  it('should identify authorization header', () => {
    expect(isSensitiveHeader('authorization')).toBe(true);
    expect(isSensitiveHeader('Authorization')).toBe(true);
  });

  it('should identify api key header', () => {
    expect(isSensitiveHeader('x-api-key')).toBe(true);
    expect(isSensitiveHeader('X-API-Key')).toBe(true);
  });

  it('should identify cookie header', () => {
    expect(isSensitiveHeader('cookie')).toBe(true);
  });

  it('should return false for non-sensitive headers', () => {
    expect(isSensitiveHeader('content-type')).toBe(false);
    expect(isSensitiveHeader('accept')).toBe(false);
  });
});

describe('redactSecrets', () => {
  it('should redact secrets from strings', () => {
    const result = redactSecrets('api key is abc123', ['abc123']);
    expect(result).toBe(`api key is ${REDACTED}`);
  });

  it('should redact secrets from arrays', () => {
    const result = redactSecrets(['abc123', 'other'], ['abc123']);
    expect(result).toEqual([REDACTED, 'other']);
  });

  it('should redact secrets from objects', () => {
    const result = redactSecrets({ key: 'abc123', other: 'value' }, ['abc123']);
    expect(result).toEqual({ key: REDACTED, other: 'value' });
  });

  it('should redact secrets from nested objects', () => {
    const result = redactSecrets(
      { outer: { inner: 'abc123' } },
      ['abc123'],
    );
    expect(result).toEqual({ outer: { inner: REDACTED } });
  });
});

describe('sanitizeRequestForUi', () => {
  it('should redact sensitive headers', () => {
    const request = {
      url: 'https://api.example.com',
      method: 'GET' as const,
      headers: {
        Authorization: 'Bearer secret',
        'Content-Type': 'application/json',
      },
    };

    const result = sanitizeRequestForUi(request);
    expect(result.headers).toEqual({
      Authorization: REDACTED,
      'Content-Type': 'application/json',
    });
  });

  it('should redact specified auth data keys', () => {
    const request = {
      url: 'https://api.example.com',
      method: 'POST' as const,
      body: { password: 'secret', username: 'user' },
    };

    const result = sanitizeRequestForUi(request, {
      body: ['password'],
    });
    expect(result.body).toEqual({
      password: REDACTED,
      username: 'user',
    });
  });
});

describe('buildUrl', () => {
  it('should return base URL when no params', () => {
    expect(buildUrl('https://api.example.com')).toBe('https://api.example.com');
  });

  it('should add query parameters', () => {
    const result = buildUrl('https://api.example.com', { page: 1, limit: 10 });
    expect(result).toBe('https://api.example.com/?page=1&limit=10');
  });

  it('should handle array parameters', () => {
    const result = buildUrl('https://api.example.com', { ids: ['1', '2', '3'] });
    expect(result).toBe('https://api.example.com/?ids=1&ids=2&ids=3');
  });

  it('should ignore null and undefined values', () => {
    const result = buildUrl('https://api.example.com', { a: 1, b: null, c: undefined });
    expect(result).toBe('https://api.example.com/?a=1');
  });
});

describe('parseUrl', () => {
  it('should parse URL components', () => {
    const result = parseUrl('https://api.example.com/path?key=value');
    expect(result.protocol).toBe('https:');
    expect(result.host).toBe('api.example.com');
    expect(result.pathname).toBe('/path');
    expect(result.params).toEqual({ key: 'value' });
  });
});

describe('mergeHeaders', () => {
  it('should merge headers', () => {
    const result = mergeHeaders(
      { 'X-Custom': 'value' },
      { 'Content-Type': 'application/json' },
    );
    expect(result).toEqual({
      'Content-Type': 'application/json',
      'X-Custom': 'value',
    });
  });

  it('should override default headers (case-insensitive)', () => {
    const result = mergeHeaders(
      { 'content-type': 'text/plain' },
      { 'Content-Type': 'application/json' },
    );
    expect(result).toEqual({ 'content-type': 'text/plain' });
  });
});

describe('createAuthHeader', () => {
  it('should create Bearer token header', () => {
    expect(createAuthHeader('Bearer', 'token123')).toBe('Bearer token123');
  });

  it('should create Basic auth header', () => {
    const result = createAuthHeader('Basic', 'user:pass');
    const expected = `Basic ${Buffer.from('user:pass').toString('base64')}`;
    expect(result).toBe(expected);
  });

  it('should create Token header', () => {
    expect(createAuthHeader('Token', 'abc123')).toBe('Token abc123');
  });
});

describe('parsePaginationHeaders', () => {
  it('should parse total count', () => {
    const result = parsePaginationHeaders({ 'X-Total-Count': '100' });
    expect(result.total).toBe(100);
  });

  it('should parse per page', () => {
    const result = parsePaginationHeaders({ 'X-Per-Page': '20' });
    expect(result.perPage).toBe(20);
  });

  it('should parse Link header', () => {
    const linkHeader = '<https://api.example.com?page=2>; rel="next", <https://api.example.com?page=1>; rel="prev"';
    const result = parsePaginationHeaders({ Link: linkHeader });
    expect(result.nextUrl).toBe('https://api.example.com?page=2');
    expect(result.prevUrl).toBe('https://api.example.com?page=1');
  });
});

describe('parseLinkHeader', () => {
  it('should parse Link header correctly', () => {
    const header = '<https://api.example.com?page=2>; rel="next", <https://api.example.com?page=5>; rel="last"';
    const result = parseLinkHeader(header);
    expect(result).toEqual({
      next: 'https://api.example.com?page=2',
      last: 'https://api.example.com?page=5',
    });
  });
});

describe('calculateRetryDelay', () => {
  it('should calculate exponential backoff delay', () => {
    const config = { ...DEFAULT_RETRY_CONFIG, baseDelay: 1000, exponentialBackoff: true };
    
    expect(calculateRetryDelay(0, config)).toBe(1000);
    expect(calculateRetryDelay(1, config)).toBe(2000);
    expect(calculateRetryDelay(2, config)).toBe(4000);
  });

  it('should respect max delay', () => {
    const config = { ...DEFAULT_RETRY_CONFIG, baseDelay: 1000, maxDelay: 5000 };
    
    expect(calculateRetryDelay(10, config)).toBe(5000);
  });

  it('should use constant delay when not exponential', () => {
    const config = { ...DEFAULT_RETRY_CONFIG, baseDelay: 1000, exponentialBackoff: false };
    
    expect(calculateRetryDelay(0, config)).toBe(1000);
    expect(calculateRetryDelay(5, config)).toBe(1000);
  });
});

describe('shouldRetry', () => {
  it('should retry on 429', () => {
    expect(shouldRetry(429)).toBe(true);
  });

  it('should retry on 5xx errors', () => {
    expect(shouldRetry(500)).toBe(true);
    expect(shouldRetry(502)).toBe(true);
    expect(shouldRetry(503)).toBe(true);
    expect(shouldRetry(504)).toBe(true);
  });

  it('should not retry on 4xx errors (except 429)', () => {
    expect(shouldRetry(400)).toBe(false);
    expect(shouldRetry(401)).toBe(false);
    expect(shouldRetry(404)).toBe(false);
  });
});

describe('parseRateLimitHeaders', () => {
  it('should parse rate limit headers', () => {
    const headers = {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '50',
      'X-RateLimit-Reset': '1600000000',
    };
    
    const result = parseRateLimitHeaders(headers);
    
    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(50);
    expect(result.reset).toEqual(new Date(1600000000 * 1000));
  });

  it('should parse Retry-After header', () => {
    const result = parseRateLimitHeaders({ 'Retry-After': '60' });
    expect(result.retryAfter).toBe(60);
  });
});
