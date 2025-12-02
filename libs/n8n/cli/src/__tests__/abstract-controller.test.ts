/**
 * Tests for abstract controller classes
 */

import type { Request, Response } from 'express';
import {
  AbstractController,
  AbstractCrudController,
  AbstractOAuthController,
  AbstractWebhookController,
  ControllerRegistry,
} from '../controllers/abstract-controller';

// Mock Express types
const createMockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

const createMockRequest = (overrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides,
  };
  return req as Request;
};

// Test implementation of AbstractController
class TestController extends AbstractController {
  getBasePath(): string {
    return '/test';
  }

  // Expose protected methods for testing
  public testSendSuccess<T>(res: Response, data: T, statusCode?: number): void {
    this.sendSuccess(res, data, statusCode);
  }

  public testSendError(res: Response, error: Error, statusCode?: number): void {
    this.sendError(res, error, statusCode);
  }

  public testSendCreated<T>(res: Response, data: T, location?: string): void {
    this.sendCreated(res, data, location);
  }

  public testSendNoContent(res: Response): void {
    this.sendNoContent(res);
  }

  public testSendRedirect(res: Response, url: string, permanent?: boolean): void {
    this.sendRedirect(res, url, permanent);
  }
}

// Test implementation of AbstractCrudController
class TestCrudController extends AbstractCrudController<
  { id: string; name: string },
  { name: string },
  { name: string }
> {
  getBasePath(): string {
    return '/items';
  }

  async list(_req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, [{ id: '1', name: 'Item 1' }]);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = this.getEntityId(req);
    this.sendSuccess(res, { id, name: 'Item' });
  }

  async create(req: Request, res: Response, dto: { name: string }): Promise<void> {
    this.sendCreated(res, { id: '1', name: dto.name });
  }

  async update(req: Request, res: Response, dto: { name: string }): Promise<void> {
    const id = this.getEntityId(req);
    this.sendSuccess(res, { id, name: dto.name });
  }

  async delete(_req: Request, res: Response): Promise<void> {
    this.sendNoContent(res);
  }

  // Expose protected methods for testing
  public testGetPagination(req: Request) {
    return this.getPagination(req);
  }

  public testBuildPaginationMeta(total: number, page: number, limit: number) {
    return this.buildPaginationMeta(total, page, limit);
  }
}

// Test implementation of AbstractOAuthController
class TestOAuthController extends AbstractOAuthController {
  readonly oauthVersion = 2 as const;

  getBasePath(): string {
    return '/oauth';
  }

  async getAuthorizationUrl(_req: Request): Promise<string> {
    return 'https://example.com/oauth/authorize';
  }

  async handleCallback(_req: Request, res: Response): Promise<void> {
    this.sendSuccess(res, { success: true });
  }

  // Expose protected methods for testing
  public testCreateCsrfState(credentialsId: string, userId?: string) {
    return this.createCsrfState(credentialsId, userId);
  }

  public testDecodeCsrfState(encodedState: string) {
    return this.decodeCsrfState(encodedState);
  }
}

// Test implementation of AbstractWebhookController
class TestWebhookController extends AbstractWebhookController {
  getBasePath(): string {
    return '/webhook';
  }

  validateSignature(req: Request): boolean {
    return req.headers['x-signature'] === 'valid';
  }

  async processWebhook(_req: Request, res: Response): Promise<void> {
    this.sendAck(res);
  }

  // Expose protected methods for testing
  public testIsValidContentType(req: Request): boolean {
    return this.isValidContentType(req);
  }
}

describe('AbstractController', () => {
  let controller: TestController;
  let res: Response;

  beforeEach(() => {
    controller = new TestController();
    res = createMockResponse();
  });

  describe('getBasePath', () => {
    it('should return the base path', () => {
      expect(controller.getBasePath()).toBe('/test');
    });
  });

  describe('sendSuccess', () => {
    it('should send a success response with default status code', () => {
      const data = { message: 'success' };
      controller.testSendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should send a success response with custom status code', () => {
      const data = { message: 'success' };
      controller.testSendSuccess(res, data, 202);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith(data);
    });
  });

  describe('sendError', () => {
    it('should send an error response with default status code', () => {
      const error = new Error('Something went wrong');
      controller.testSendError(res, error);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Something went wrong',
          name: 'Error',
        },
      });
    });

    it('should send an error response with custom status code', () => {
      const error = new Error('Not found');
      controller.testSendError(res, error, 404);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('sendCreated', () => {
    it('should send a created response', () => {
      const data = { id: '1' };
      controller.testSendCreated(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should set Location header when provided', () => {
      const data = { id: '1' };
      controller.testSendCreated(res, data, '/items/1');

      expect(res.setHeader).toHaveBeenCalledWith('Location', '/items/1');
    });
  });

  describe('sendNoContent', () => {
    it('should send a no content response', () => {
      controller.testSendNoContent(res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('sendRedirect', () => {
    it('should send a temporary redirect', () => {
      controller.testSendRedirect(res, '/new-location');

      expect(res.redirect).toHaveBeenCalledWith(302, '/new-location');
    });

    it('should send a permanent redirect', () => {
      controller.testSendRedirect(res, '/new-location', true);

      expect(res.redirect).toHaveBeenCalledWith(301, '/new-location');
    });
  });
});

describe('AbstractCrudController', () => {
  let controller: TestCrudController;

  beforeEach(() => {
    controller = new TestCrudController();
  });

  describe('getPagination', () => {
    it('should return default pagination values', () => {
      const req = createMockRequest();
      const pagination = controller.testGetPagination(req);

      expect(pagination).toEqual({
        page: 1,
        limit: 20,
        offset: 0,
      });
    });

    it('should parse custom pagination parameters', () => {
      const req = createMockRequest({
        query: { page: '3', limit: '50' },
      });
      const pagination = controller.testGetPagination(req);

      expect(pagination).toEqual({
        page: 3,
        limit: 50,
        offset: 100,
      });
    });

    it('should enforce minimum page value', () => {
      const req = createMockRequest({
        query: { page: '-1' },
      });
      const pagination = controller.testGetPagination(req);

      expect(pagination.page).toBe(1);
    });

    it('should enforce maximum limit value', () => {
      const req = createMockRequest({
        query: { limit: '500' },
      });
      const pagination = controller.testGetPagination(req);

      expect(pagination.limit).toBe(100);
    });
  });

  describe('buildPaginationMeta', () => {
    it('should build pagination metadata', () => {
      const meta = controller.testBuildPaginationMeta(95, 2, 20);

      expect(meta).toEqual({
        page: 2,
        limit: 20,
        total: 95,
        totalPages: 5,
      });
    });
  });
});

describe('AbstractOAuthController', () => {
  let controller: TestOAuthController;

  beforeEach(() => {
    controller = new TestOAuthController();
  });

  describe('createCsrfState', () => {
    it('should create CSRF state with credentials ID', () => {
      const [secret, encodedState] = controller.testCreateCsrfState('cred123');

      expect(secret).toBeDefined();
      expect(encodedState).toBeDefined();

      const decoded = controller.testDecodeCsrfState(encodedState);
      expect(decoded.cid).toBe('cred123');
      expect(decoded.token).toBeDefined();
      expect(decoded.createdAt).toBeDefined();
    });

    it('should include user ID when provided', () => {
      const [, encodedState] = controller.testCreateCsrfState('cred123', 'user456');

      const decoded = controller.testDecodeCsrfState(encodedState);
      expect(decoded.userId).toBe('user456');
    });
  });
});

describe('AbstractWebhookController', () => {
  let controller: TestWebhookController;

  beforeEach(() => {
    controller = new TestWebhookController();
  });

  describe('validateSignature', () => {
    it('should return true for valid signature', () => {
      const req = createMockRequest({
        headers: { 'x-signature': 'valid' },
      });

      expect(controller.validateSignature(req)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const req = createMockRequest({
        headers: { 'x-signature': 'invalid' },
      });

      expect(controller.validateSignature(req)).toBe(false);
    });
  });

  describe('isValidContentType', () => {
    it('should accept application/json', () => {
      const req = createMockRequest({
        headers: { 'content-type': 'application/json' },
      });

      expect(controller.testIsValidContentType(req)).toBe(true);
    });

    it('should accept form-urlencoded', () => {
      const req = createMockRequest({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });

      expect(controller.testIsValidContentType(req)).toBe(true);
    });

    it('should reject unsupported content types', () => {
      const req = createMockRequest({
        headers: { 'content-type': 'text/plain' },
      });

      expect(controller.testIsValidContentType(req)).toBe(false);
    });
  });
});

describe('ControllerRegistry', () => {
  let registry: ControllerRegistry;
  let controller: TestController;

  beforeEach(() => {
    registry = new ControllerRegistry();
    controller = new TestController();
  });

  describe('register', () => {
    it('should register a controller', () => {
      registry.register('/test', controller);

      expect(registry.has('/test')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return registered controller', () => {
      registry.register('/test', controller);

      expect(registry.get('/test')).toBe(controller);
    });

    it('should return undefined for unregistered path', () => {
      expect(registry.get('/unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered controllers', () => {
      const controller2 = new TestController();
      registry.register('/test1', controller);
      registry.register('/test2', controller2);

      const all = registry.getAll();

      expect(all.size).toBe(2);
      expect(all.get('/test1')).toBe(controller);
      expect(all.get('/test2')).toBe(controller2);
    });
  });

  describe('initializeAll', () => {
    it('should initialize all controllers', async () => {
      const initSpy = jest.spyOn(controller, 'initialize');
      registry.register('/test', controller);

      await registry.initializeAll();

      expect(initSpy).toHaveBeenCalled();
    });
  });
});
