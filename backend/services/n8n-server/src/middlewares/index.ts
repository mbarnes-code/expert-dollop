/**
 * Middleware utilities for n8n server.
 * Common middleware patterns for the REST API.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware interface.
 */
export interface AuthMiddlewareOptions {
  /** Whether to allow unauthenticated requests */
  allowUnauthenticated?: boolean;
  /** Whether to skip MFA check */
  allowSkipMFA?: boolean;
  /** Whether to allow preview auth */
  allowSkipPreviewAuth?: boolean;
}

/**
 * Rate limit configuration.
 */
export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Message to return when rate limited */
  message?: string;
  /** Key generator function */
  keyGenerator?: (req: Request) => string;
}

/**
 * Create rate limiting middleware.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = config.keyGenerator?.(req) ?? req.ip ?? 'unknown';
    const now = Date.now();

    let record = requests.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + config.windowMs };
      requests.set(key, record);
    }

    record.count++;

    if (record.count > config.maxRequests) {
      res.status(429).json({
        code: 429,
        message: config.message || 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (config.maxRequests - record.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());

    next();
  };
}

/**
 * Create CORS middleware.
 */
export function createCorsMiddleware(options: {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}) {
  const allowedOrigins = options.origins ?? ['*'];
  const allowedMethods = options.methods ?? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  const allowedHeaders = options.headers ?? ['Content-Type', 'Authorization'];
  const credentials = options.credentials ?? true;
  const maxAge = options.maxAge ?? 86400;

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', maxAge.toString());

    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * Create request logging middleware.
 */
export function createLoggingMiddleware(options: {
  logger?: {
    info: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
  };
  skipPaths?: string[];
}) {
  const logger = options.logger ?? console;
  const skipPaths = options.skipPaths ?? ['/healthz', '/metrics'];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      next();
      return;
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';

      logger[logLevel](`${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    });

    next();
  };
}

/**
 * Create body parser middleware with size limit.
 */
export function createBodyParserMiddleware(options: {
  limit?: string;
  type?: string | string[];
}) {
  const limit = options.limit ?? '16mb';
  const type = options.type ?? ['application/json'];

  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'] ?? '';
    const types = Array.isArray(type) ? type : [type];

    if (!types.some((t) => contentType.includes(t))) {
      next();
      return;
    }

    // This is a placeholder - actual implementation would use a body parser
    next();
  };
}

/**
 * Create error handling middleware.
 */
export function createErrorMiddleware(options?: {
  logger?: {
    error: (message: string, meta?: Record<string, unknown>) => void;
  };
  includeStack?: boolean;
}) {
  const logger = options?.logger ?? console;
  const includeStack = options?.includeStack ?? process.env.NODE_ENV !== 'production';

  return (
    error: Error & { statusCode?: number; code?: string },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    const statusCode = error.statusCode ?? 500;

    logger.error(error.message, {
      statusCode,
      code: error.code,
      stack: error.stack,
    });

    res.status(statusCode).json({
      code: statusCode,
      message: error.message,
      ...(error.code && { errorCode: error.code }),
      ...(includeStack && error.stack && { stack: error.stack }),
    });
  };
}

/**
 * Create security headers middleware.
 */
export function createSecurityMiddleware() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
  };
}

/**
 * Create request ID middleware.
 */
export function createRequestIdMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId =
      (req.headers['x-request-id'] as string) ??
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}

/**
 * Create timeout middleware.
 */
export function createTimeoutMiddleware(timeoutMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          code: 408,
          message: 'Request timeout',
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}
