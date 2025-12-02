/**
 * n8n Server implementation.
 * Main Express server with REST API, webhooks, and real-time features.
 */

import type { Application, Request, Response, NextFunction } from 'express';

/**
 * Server configuration options.
 */
export interface N8nServerConfig {
  /** Port to listen on */
  port: number;
  /** Host to bind to */
  host: string;
  /** REST API endpoint prefix */
  restEndpoint: string;
  /** Whether to enable webhooks */
  webhooksEnabled: boolean;
  /** Whether to enable test webhooks */
  testWebhooksEnabled: boolean;
  /** Whether to disable UI */
  disableUi: boolean;
  /** SSL key path */
  sslKey?: string;
  /** SSL cert path */
  sslCert?: string;
  /** Protocol (http or https) */
  protocol: 'http' | 'https';
}

/**
 * Server state interface.
 */
export interface ServerState {
  isReady: boolean;
  isShuttingDown: boolean;
  startedAt?: Date;
  version: string;
}

/**
 * Health check response.
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  components?: {
    database?: { status: 'ok' | 'error'; latency?: number };
    redis?: { status: 'ok' | 'error'; latency?: number };
    queue?: { status: 'ok' | 'error'; pending?: number };
  };
}

/**
 * Abstract n8n server class.
 * Extend this to create the full server implementation.
 */
export abstract class AbstractN8nServer {
  protected app!: Application;
  protected config: N8nServerConfig;
  protected state: ServerState = {
    isReady: false,
    isShuttingDown: false,
    version: '0.1.0',
  };

  constructor(config: Partial<N8nServerConfig> = {}) {
    this.config = {
      port: 5678,
      host: '0.0.0.0',
      restEndpoint: 'rest',
      webhooksEnabled: true,
      testWebhooksEnabled: true,
      disableUi: false,
      protocol: 'http',
      ...config,
    };
  }

  /**
   * Initialize the Express application.
   */
  protected abstract initializeApp(): Promise<void>;

  /**
   * Configure middleware.
   */
  protected abstract configureMiddleware(): Promise<void>;

  /**
   * Register routes.
   */
  protected abstract registerRoutes(): Promise<void>;

  /**
   * Setup webhooks.
   */
  protected abstract setupWebhooks(): Promise<void>;

  /**
   * Setup push notifications.
   */
  protected abstract setupPush(): Promise<void>;

  /**
   * Start the server.
   */
  async start(): Promise<void> {
    await this.initializeApp();
    await this.configureMiddleware();
    await this.registerRoutes();

    if (this.config.webhooksEnabled) {
      await this.setupWebhooks();
    }

    await this.setupPush();

    this.state.isReady = true;
    this.state.startedAt = new Date();
  }

  /**
   * Shutdown the server gracefully.
   */
  async shutdown(): Promise<void> {
    this.state.isShuttingDown = true;
    this.state.isReady = false;
  }

  /**
   * Get health check status.
   */
  async getHealthCheck(): Promise<HealthCheckResponse> {
    const now = new Date();
    const uptime = this.state.startedAt
      ? (now.getTime() - this.state.startedAt.getTime()) / 1000
      : 0;

    return {
      status: this.state.isReady ? 'ok' : 'error',
      timestamp: now.toISOString(),
      uptime,
      version: this.state.version,
    };
  }

  /**
   * Get the Express application.
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Get server configuration.
   */
  getConfig(): N8nServerConfig {
    return this.config;
  }

  /**
   * Get server state.
   */
  getState(): ServerState {
    return { ...this.state };
  }
}

/**
 * Request with authentication context.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    globalScopes: string[];
  };
  browserId?: string;
}

/**
 * API request with common extensions.
 */
export interface APIRequest extends AuthenticatedRequest {
  /** Parsed pagination parameters */
  pagination?: {
    offset: number;
    limit: number;
  };
  /** Parsed filter parameters */
  filters?: Record<string, unknown>;
  /** Parsed sort parameters */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Response helper type.
 */
export type ResponseHandler<T> = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<T>;

/**
 * Create a response wrapper for controllers.
 *
 * @param handler The response handler function
 */
export function send<T>(
  handler: (req: AuthenticatedRequest) => Promise<T>,
): ResponseHandler<void> {
  return async (req, res, next) => {
    try {
      const data = await handler(req);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create a response wrapper that doesn't return data.
 *
 * @param handler The handler function
 * @param statusCode The HTTP status code
 */
export function sendNoContent(
  handler: (req: AuthenticatedRequest) => Promise<void>,
  statusCode = 204,
): ResponseHandler<void> {
  return async (req, res, next) => {
    try {
      await handler(req);
      res.status(statusCode).end();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Send an error response.
 *
 * @param res The Express response
 * @param error The error to send
 */
export function sendErrorResponse(res: Response, error: Error & { statusCode?: number }): void {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: error.message,
    hint: '',
  });
}

/**
 * Send a success response.
 *
 * @param res The Express response
 * @param data The data to send
 * @param raw Whether to send raw response
 * @param statusCode The HTTP status code
 */
export function sendSuccessResponse(
  res: Response,
  data: unknown,
  raw = false,
  statusCode = 200,
): void {
  if (raw) {
    if (typeof data === 'string') {
      res.status(statusCode).send(data);
    } else {
      res.status(statusCode).json(data);
    }
  } else {
    res.status(statusCode).json({ data });
  }
}
