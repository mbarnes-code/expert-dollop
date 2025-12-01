import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Error middleware function type
 */
export type ErrorMiddlewareFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Abstract base class for middleware
 */
export abstract class AbstractMiddleware {
  /**
   * Gets the middleware name
   */
  abstract getName(): string;

  /**
   * Gets the Express middleware handler
   */
  abstract getHandler(): MiddlewareFunction;
}

/**
 * Abstract base class for error middleware
 */
export abstract class AbstractErrorMiddleware {
  /**
   * Gets the middleware name
   */
  abstract getName(): string;

  /**
   * Gets the Express error handler
   */
  abstract getHandler(): ErrorMiddlewareFunction;
}

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin: string | string[] | boolean | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Creates a CORS middleware
 * @param options - CORS options
 * @returns CORS middleware
 */
export function createCorsMiddleware(options: CorsOptions): MiddlewareFunction {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    // Determine if origin is allowed
    let allowedOrigin: string | undefined;

    if (options.origin === true) {
      allowedOrigin = origin;
    } else if (typeof options.origin === 'string') {
      allowedOrigin = options.origin;
    } else if (Array.isArray(options.origin) && origin) {
      allowedOrigin = options.origin.includes(origin) ? origin : undefined;
    } else if (typeof options.origin === 'function' && origin) {
      allowedOrigin = options.origin(origin) ? origin : undefined;
    }

    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    }

    if (options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (options.methods) {
      res.setHeader('Access-Control-Allow-Methods', options.methods.join(', '));
    }

    if (options.allowedHeaders) {
      res.setHeader('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
    }

    if (options.exposedHeaders) {
      res.setHeader('Access-Control-Expose-Headers', options.exposedHeaders.join(', '));
    }

    if (options.maxAge !== undefined) {
      res.setHeader('Access-Control-Max-Age', options.maxAge.toString());
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * Raw body reader options
 */
export interface RawBodyReaderOptions {
  limit?: string | number;
  type?: string | string[];
}

/**
 * Creates a raw body reader middleware that stores raw body in req.rawBody
 * @param options - Raw body reader options
 * @returns Raw body reader middleware
 */
export function createRawBodyReader(options: RawBodyReaderOptions = {}): MiddlewareFunction {
  const limit = options.limit ?? '16mb';

  return (req: Request, _res: Response, next: NextFunction): void => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      (req as Request & { rawBody: Buffer }).rawBody = Buffer.concat(chunks);
      next();
    });

    req.on('error', next);
  };
}

/**
 * Request logging options
 */
export interface RequestLoggingOptions {
  includeBody?: boolean;
  includeHeaders?: boolean;
  excludePaths?: string[];
}

/**
 * Creates a request logging middleware
 * @param logger - Logger function
 * @param options - Logging options
 * @returns Request logging middleware
 */
export function createRequestLoggingMiddleware(
  logger: (message: string, meta?: Record<string, unknown>) => void,
  options: RequestLoggingOptions = {}
): MiddlewareFunction {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { excludePaths = [] } = options;

    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      next();
      return;
    }

    const startTime = Date.now();

    // Log request
    const requestMeta: Record<string, unknown> = {
      method: req.method,
      path: req.path,
      ip: req.ip,
    };

    if (options.includeHeaders) {
      requestMeta.headers = req.headers;
    }

    logger(`Incoming ${req.method} ${req.path}`, requestMeta);

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger(`Completed ${req.method} ${req.path}`, {
        ...requestMeta,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}

/**
 * Creates a rate limiting middleware
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limiting middleware
 */
export function createRateLimitMiddleware(
  maxRequests: number,
  windowMs: number
): MiddlewareFunction {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    record.count++;
    next();
  };
}

/**
 * Creates an authentication middleware
 * @param authenticate - Authentication function
 * @returns Authentication middleware
 */
export function createAuthMiddleware(
  authenticate: (req: Request) => Promise<boolean>
): MiddlewareFunction {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAuthenticated = await authenticate(req);
      if (isAuthenticated) {
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      next(error);
    }
  };
}
