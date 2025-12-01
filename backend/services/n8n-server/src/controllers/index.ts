/**
 * Controller base classes and utilities.
 * Common patterns for REST API controllers.
 */

import type { Request, Response, NextFunction, Router } from 'express';

/**
 * Controller metadata interface.
 */
export interface ControllerMetadata {
  path: string;
  methods: MethodMetadata[];
  middlewares: MiddlewareMetadata[];
}

/**
 * Method metadata interface.
 */
export interface MethodMetadata {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handlerName: string;
  middlewares: MiddlewareMetadata[];
}

/**
 * Middleware metadata interface.
 */
export interface MiddlewareMetadata {
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
  position: 'before' | 'after';
}

/**
 * Abstract base controller class.
 * Extend this to create REST API controllers.
 */
export abstract class AbstractController {
  /**
   * The base path for this controller.
   */
  abstract readonly basePath: string;

  /**
   * Register routes on a router.
   */
  abstract registerRoutes(router: Router): void;

  /**
   * Handle async route handlers with error catching.
   */
  protected asyncHandler(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }

  /**
   * Send a JSON response.
   */
  protected sendJson(res: Response, data: unknown, statusCode = 200): void {
    res.status(statusCode).json(data);
  }

  /**
   * Send a no content response.
   */
  protected sendNoContent(res: Response): void {
    res.status(204).end();
  }

  /**
   * Send a created response.
   */
  protected sendCreated(res: Response, data: unknown): void {
    res.status(201).json(data);
  }
}

/**
 * Abstract CRUD controller.
 * Provides standard CRUD operations for a resource.
 */
export abstract class AbstractCrudController<T, CreateDto, UpdateDto> extends AbstractController {
  /**
   * Create a new resource.
   */
  abstract create(data: CreateDto): Promise<T>;

  /**
   * Get a resource by ID.
   */
  abstract getById(id: string): Promise<T | null>;

  /**
   * Get all resources with pagination.
   */
  abstract getAll(options: PaginationOptions): Promise<PaginatedResponse<T>>;

  /**
   * Update a resource.
   */
  abstract update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete a resource.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Register standard CRUD routes.
   */
  registerRoutes(router: Router): void {
    router.post(this.basePath, this.asyncHandler(async (req, res) => {
      const data = await this.create(req.body);
      this.sendCreated(res, data);
    }));

    router.get(`${this.basePath}/:id`, this.asyncHandler(async (req, res) => {
      const data = await this.getById(req.params.id);
      if (!data) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }
      this.sendJson(res, data);
    }));

    router.get(this.basePath, this.asyncHandler(async (req, res) => {
      const options = this.parsePaginationOptions(req);
      const data = await this.getAll(options);
      this.sendJson(res, data);
    }));

    router.put(`${this.basePath}/:id`, this.asyncHandler(async (req, res) => {
      const data = await this.update(req.params.id, req.body);
      this.sendJson(res, data);
    }));

    router.delete(`${this.basePath}/:id`, this.asyncHandler(async (req, res) => {
      await this.delete(req.params.id);
      this.sendNoContent(res);
    }));
  }

  /**
   * Parse pagination options from request.
   */
  protected parsePaginationOptions(req: Request): PaginationOptions {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const sortField = req.query.sortField as string;
    const sortDirection = (req.query.sortDirection as string) === 'desc' ? 'desc' : 'asc';

    return {
      limit: Math.min(limit, 100),
      offset: Math.max(offset, 0),
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
    };
  }
}

/**
 * Pagination options interface.
 */
export interface PaginationOptions {
  limit: number;
  offset: number;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filter?: Record<string, unknown>;
}

/**
 * Paginated response interface.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Controller registry for managing all controllers.
 */
export class ControllerRegistry {
  private readonly controllers: Map<string, AbstractController> = new Map();

  /**
   * Register a controller.
   */
  register(controller: AbstractController): void {
    this.controllers.set(controller.basePath, controller);
  }

  /**
   * Get a controller by path.
   */
  get(path: string): AbstractController | undefined {
    return this.controllers.get(path);
  }

  /**
   * Get all registered controllers.
   */
  getAll(): AbstractController[] {
    return Array.from(this.controllers.values());
  }

  /**
   * Activate all controllers on a router.
   */
  activate(router: Router): void {
    for (const controller of this.controllers.values()) {
      controller.registerRoutes(router);
    }
  }
}
