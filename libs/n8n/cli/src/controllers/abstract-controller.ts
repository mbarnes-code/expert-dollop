/**
 * Abstract base classes for REST controllers.
 * Provides common patterns for building REST API controllers following DDD principles.
 */

import type { Request, Response, NextFunction, RequestHandler, Router } from 'express';

/**
 * HTTP methods supported for routing
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Route argument types
 */
export type RouteArg = 
  | { type: 'body' }
  | { type: 'query' }
  | { type: 'param'; key: string }
  | { type: 'header'; key: string };

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 5
   */
  limit?: number;
  /**
   * Time window in milliseconds
   * @default 300000 (5 minutes)
   */
  windowMs?: number;
}

/**
 * Access scope configuration
 */
export interface AccessScope {
  /** Permission scope required */
  scope: string;
  /** Whether this scope is global-only (not project-scoped) */
  globalOnly: boolean;
}

/**
 * Route metadata configuration
 */
export interface RouteMetadata {
  /** HTTP method */
  method: HttpMethod;
  /** Route path */
  path: string;
  /** Optional middleware handlers */
  middlewares: RequestHandler[];
  /** Whether this route uses template rendering */
  usesTemplates: boolean;
  /** Whether to skip authentication */
  skipAuth: boolean;
  /** Whether to allow skipping preview auth */
  allowSkipPreviewAuth: boolean;
  /** Whether to allow skipping MFA */
  allowSkipMFA: boolean;
  /** Whether this route requires API key auth */
  apiKeyAuth: boolean;
  /** Rate limiting configuration */
  rateLimit?: boolean | RateLimitConfig;
  /** License feature required for this route */
  licenseFeature?: string;
  /** Access scope required for this route */
  accessScope?: AccessScope;
  /** Route argument definitions */
  args: RouteArg[];
  /** Optional sub-router */
  router?: Router;
}

/**
 * Controller metadata
 */
export interface ControllerMetadata {
  /** Base path for all routes in this controller */
  basePath: string;
  /** Whether to register at root path without prefix */
  registerOnRootPath?: boolean;
  /** Middleware handler names */
  middlewares: string[];
  /** Route definitions */
  routes: Map<string, RouteMetadata>;
}

/**
 * Route options for route decorators
 */
export interface RouteOptions {
  /** Middleware handlers to apply */
  middlewares?: RequestHandler[];
  /** Whether this route renders templates */
  usesTemplates?: boolean;
  /** Skip authentication for this route */
  skipAuth?: boolean;
  /** Allow skipping preview authentication */
  allowSkipPreviewAuth?: boolean;
  /** Allow skipping MFA requirement */
  allowSkipMFA?: boolean;
  /** Rate limit configuration */
  rateLimit?: boolean | RateLimitConfig;
  /** Require API key authentication */
  apiKeyAuth?: boolean;
}

/**
 * Abstract base class for REST controllers.
 * Provides common functionality for handling HTTP requests.
 */
export abstract class AbstractController {
  /**
   * Get the base path for this controller
   */
  abstract getBasePath(): string;

  /**
   * Initialize the controller
   * Override to add initialization logic
   */
  async initialize(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Handle a successful response
   * @param res Express response object
   * @param data Response data
   * @param statusCode HTTP status code
   */
  protected sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json(data);
  }

  /**
   * Handle an error response
   * @param res Express response object
   * @param error Error object
   * @param statusCode HTTP status code
   */
  protected sendError(res: Response, error: Error, statusCode = 500): void {
    res.status(statusCode).json({
      error: {
        message: error.message,
        name: error.name,
      },
    });
  }

  /**
   * Handle a created response
   * @param res Express response object
   * @param data Created resource data
   * @param location Optional Location header value
   */
  protected sendCreated<T>(res: Response, data: T, location?: string): void {
    if (location) {
      res.setHeader('Location', location);
    }
    res.status(201).json(data);
  }

  /**
   * Handle a no content response
   * @param res Express response object
   */
  protected sendNoContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Handle a redirect response
   * @param res Express response object
   * @param url Redirect URL
   * @param permanent Whether this is a permanent redirect
   */
  protected sendRedirect(res: Response, url: string, permanent = false): void {
    res.redirect(permanent ? 301 : 302, url);
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param meta Optional metadata
   */
  protected log(message: string, meta?: Record<string, unknown>): void {
    console.log(`[${this.constructor.name}] ${message}`, meta ?? '');
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param error Optional error object
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[${this.constructor.name}] ERROR: ${message}`, error ?? '');
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param meta Optional metadata
   */
  protected logWarn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${this.constructor.name}] WARN: ${message}`, meta ?? '');
  }
}

/**
 * Abstract base class for CRUD controllers.
 * Provides standard CRUD operation methods.
 */
export abstract class AbstractCrudController<
  TEntity,
  TCreateDto,
  TUpdateDto
> extends AbstractController {
  /**
   * List all entities
   */
  abstract list(req: Request, res: Response): Promise<void>;

  /**
   * Get a single entity by ID
   */
  abstract getById(req: Request, res: Response): Promise<void>;

  /**
   * Create a new entity
   */
  abstract create(req: Request, res: Response, dto: TCreateDto): Promise<void>;

  /**
   * Update an existing entity
   */
  abstract update(req: Request, res: Response, dto: TUpdateDto): Promise<void>;

  /**
   * Delete an entity
   */
  abstract delete(req: Request, res: Response): Promise<void>;

  /**
   * Get entity ID from request params
   * @param req Express request object
   * @param paramName Parameter name (default: 'id')
   */
  protected getEntityId(req: Request, paramName = 'id'): string {
    return req.params[paramName];
  }

  /**
   * Get pagination parameters from query
   * @param req Express request object
   */
  protected getPagination(req: Request): { page: number; limit: number; offset: number } {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }

  /**
   * Build pagination response metadata
   * @param total Total count of items
   * @param page Current page
   * @param limit Items per page
   */
  protected buildPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): { page: number; limit: number; total: number; totalPages: number } {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Abstract base class for OAuth controllers.
 * Provides common OAuth flow handling.
 */
export abstract class AbstractOAuthController extends AbstractController {
  /**
   * OAuth version (1 or 2)
   */
  abstract readonly oauthVersion: 1 | 2;

  /**
   * Generate authorization URL
   */
  abstract getAuthorizationUrl(req: Request): Promise<string>;

  /**
   * Handle OAuth callback
   */
  abstract handleCallback(req: Request, res: Response): Promise<void>;

  /**
   * Create CSRF state for OAuth flow
   * @param credentialsId Credential ID
   * @param userId Optional user ID
   */
  protected createCsrfState(credentialsId: string, userId?: string): [string, string] {
    const secret = this.generateSecret();
    const token = this.generateToken(secret);
    const state = {
      cid: credentialsId,
      token,
      createdAt: Date.now(),
      userId,
    };
    return [secret, Buffer.from(JSON.stringify(state)).toString('base64')];
  }

  /**
   * Decode CSRF state from callback
   * @param encodedState Base64 encoded state
   */
  protected decodeCsrfState(encodedState: string): {
    cid: string;
    token: string;
    createdAt: number;
    userId?: string;
  } {
    const decoded = JSON.parse(Buffer.from(encodedState, 'base64').toString());
    return decoded;
  }

  /**
   * Verify CSRF state is valid
   * @param state Decoded state
   * @param secret CSRF secret
   * @param maxAge Maximum age in milliseconds
   */
  protected verifyCsrfState(
    state: { createdAt: number; token: string },
    secret: string,
    maxAge = 5 * 60 * 1000,
  ): boolean {
    const now = Date.now();
    return now - state.createdAt <= maxAge && this.verifyToken(secret, state.token);
  }

  /**
   * Generate a random secret
   */
  protected generateSecret(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Generate a token from a secret
   */
  protected generateToken(secret: string): string {
    // Simple token generation - in production use a proper CSRF library
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Verify a token against a secret
   */
  protected verifyToken(secret: string, token: string): boolean {
    return this.generateToken(secret) === token;
  }

  /**
   * Render an OAuth error callback page
   * @param res Express response object
   * @param message Error message
   * @param reason Error reason
   */
  protected renderCallbackError(res: Response, message: string, reason?: string): void {
    res.render('oauth-error-callback', { error: { message, reason } });
  }
}

/**
 * Abstract base class for webhook controllers.
 * Provides common webhook handling patterns.
 */
export abstract class AbstractWebhookController extends AbstractController {
  /**
   * Validate webhook signature
   */
  abstract validateSignature(req: Request): boolean;

  /**
   * Process incoming webhook
   */
  abstract processWebhook(req: Request, res: Response): Promise<void>;

  /**
   * Get the expected content types for this webhook
   */
  protected getExpectedContentTypes(): string[] {
    return ['application/json', 'application/x-www-form-urlencoded'];
  }

  /**
   * Check if the request content type is valid
   * @param req Express request object
   */
  protected isValidContentType(req: Request): boolean {
    const contentType = req.headers['content-type'] ?? '';
    return this.getExpectedContentTypes().some(type => contentType.includes(type));
  }

  /**
   * Send a webhook acknowledgment response
   * @param res Express response object
   */
  protected sendAck(res: Response): void {
    res.status(200).json({ received: true });
  }
}

/**
 * Controller factory function type
 */
export type ControllerFactory<T extends AbstractController> = () => T;

/**
 * Controller registry for managing controllers
 */
export class ControllerRegistry {
  private controllers = new Map<string, AbstractController>();
  private metadata = new Map<Function, ControllerMetadata>();

  /**
   * Register a controller
   * @param basePath Base path for the controller
   * @param controller Controller instance
   */
  register(basePath: string, controller: AbstractController): void {
    this.controllers.set(basePath, controller);
  }

  /**
   * Get a controller by base path
   * @param basePath Base path
   */
  get(basePath: string): AbstractController | undefined {
    return this.controllers.get(basePath);
  }

  /**
   * Check if a controller exists
   * @param basePath Base path
   */
  has(basePath: string): boolean {
    return this.controllers.has(basePath);
  }

  /**
   * Get all registered controllers
   */
  getAll(): Map<string, AbstractController> {
    return new Map(this.controllers);
  }

  /**
   * Get controller metadata
   * @param controllerClass Controller class
   */
  getMetadata(controllerClass: Function): ControllerMetadata | undefined {
    return this.metadata.get(controllerClass);
  }

  /**
   * Set controller metadata
   * @param controllerClass Controller class
   * @param metadata Controller metadata
   */
  setMetadata(controllerClass: Function, metadata: ControllerMetadata): void {
    this.metadata.set(controllerClass, metadata);
  }

  /**
   * Initialize all registered controllers
   */
  async initializeAll(): Promise<void> {
    for (const controller of this.controllers.values()) {
      await controller.initialize();
    }
  }
}
