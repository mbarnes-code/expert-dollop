/**
 * Route decorator factory functions for REST controllers.
 * Provides decorators for defining HTTP routes and their metadata.
 */

import type { RequestHandler, Router } from 'express';
import type {
  HttpMethod,
  RouteMetadata,
  RouteOptions,
  ControllerMetadata,
  RateLimitConfig,
  AccessScope,
  RouteArg,
} from './abstract-controller';

/**
 * Internal registry for storing controller and route metadata
 */
class DecoratorMetadataRegistry {
  private static instance: DecoratorMetadataRegistry;
  private controllerMetadata = new Map<Function, ControllerMetadata>();

  private constructor() {}

  static getInstance(): DecoratorMetadataRegistry {
    if (!DecoratorMetadataRegistry.instance) {
      DecoratorMetadataRegistry.instance = new DecoratorMetadataRegistry();
    }
    return DecoratorMetadataRegistry.instance;
  }

  getControllerMetadata(controllerClass: Function): ControllerMetadata {
    let metadata = this.controllerMetadata.get(controllerClass);
    if (!metadata) {
      metadata = {
        basePath: '/',
        registerOnRootPath: false,
        middlewares: [],
        routes: new Map(),
      };
      this.controllerMetadata.set(controllerClass, metadata);
    }
    return metadata;
  }

  getRouteMetadata(controllerClass: Function, handlerName: string): RouteMetadata {
    const controllerMeta = this.getControllerMetadata(controllerClass);
    let routeMeta = controllerMeta.routes.get(handlerName);
    if (!routeMeta) {
      routeMeta = {
        method: 'get',
        path: '/',
        middlewares: [],
        usesTemplates: false,
        skipAuth: false,
        allowSkipPreviewAuth: false,
        allowSkipMFA: false,
        apiKeyAuth: false,
        args: [],
      };
      controllerMeta.routes.set(handlerName, routeMeta);
    }
    return routeMeta;
  }

  getAllControllers(): IterableIterator<Function> {
    return this.controllerMetadata.keys();
  }

  getMetadataForController(controllerClass: Function): ControllerMetadata | undefined {
    return this.controllerMetadata.get(controllerClass);
  }
}

/**
 * Get the global metadata registry instance
 */
export function getMetadataRegistry(): DecoratorMetadataRegistry {
  return DecoratorMetadataRegistry.getInstance();
}

/**
 * REST controller decorator
 * Marks a class as a REST controller and sets its base path
 * @param basePath Base path for all routes in this controller
 */
export function RestController(basePath = '/'): ClassDecorator {
  return (target: Function) => {
    const metadata = getMetadataRegistry().getControllerMetadata(target);
    metadata.basePath = basePath;
    metadata.registerOnRootPath = false;
  };
}

/**
 * Root-level controller decorator
 * Marks a class as a controller that registers at the root path without prefix
 * @param basePath Base path for all routes in this controller
 */
export function RootLevelController(basePath = '/'): ClassDecorator {
  return (target: Function) => {
    const metadata = getMetadataRegistry().getControllerMetadata(target);
    metadata.basePath = basePath;
    metadata.registerOnRootPath = true;
  };
}

/**
 * Creates a route decorator factory for a specific HTTP method
 * @param method HTTP method
 */
function RouteFactory(method: HttpMethod) {
  return (path: string, options: RouteOptions = {}): MethodDecorator => {
    return (target: object, propertyKey: string | symbol) => {
      const routeMetadata = getMetadataRegistry().getRouteMetadata(
        target.constructor,
        String(propertyKey),
      );
      routeMetadata.method = method;
      routeMetadata.path = path;
      routeMetadata.middlewares = options.middlewares ?? [];
      routeMetadata.usesTemplates = options.usesTemplates ?? false;
      routeMetadata.skipAuth = options.skipAuth ?? false;
      routeMetadata.allowSkipPreviewAuth = options.allowSkipPreviewAuth ?? false;
      routeMetadata.allowSkipMFA = options.allowSkipMFA ?? false;
      routeMetadata.apiKeyAuth = options.apiKeyAuth ?? false;
      routeMetadata.rateLimit = options.rateLimit;
    };
  };
}

/**
 * GET route decorator
 */
export const Get = RouteFactory('get');

/**
 * POST route decorator
 */
export const Post = RouteFactory('post');

/**
 * PUT route decorator
 */
export const Put = RouteFactory('put');

/**
 * PATCH route decorator
 */
export const Patch = RouteFactory('patch');

/**
 * DELETE route decorator
 */
export const Delete = RouteFactory('delete');

/**
 * HEAD route decorator
 */
export const Head = RouteFactory('head');

/**
 * OPTIONS route decorator
 */
export const Options = RouteFactory('options');

/**
 * Middleware decorator
 * Applies middleware to a controller or route handler
 * @param middlewares Middleware handlers to apply
 */
export function Middleware(...middlewares: RequestHandler[]): MethodDecorator & ClassDecorator {
  return (target: object | Function, propertyKey?: string | symbol) => {
    if (propertyKey) {
      // Method decorator
      const routeMetadata = getMetadataRegistry().getRouteMetadata(
        (target as object).constructor,
        String(propertyKey),
      );
      routeMetadata.middlewares.push(...middlewares);
    } else {
      // Class decorator - add middleware names for later resolution
      const controllerMetadata = getMetadataRegistry().getControllerMetadata(target as Function);
      // Store middleware function names for class-level middleware
      middlewares.forEach((mw, idx) => {
        controllerMetadata.middlewares.push(`__middleware_${idx}_${Date.now()}`);
      });
    }
  };
}

/**
 * Licensed decorator
 * Marks a route as requiring a specific license feature
 * @param feature License feature required
 */
export function Licensed(feature: string): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.licenseFeature = feature;
  };
}

/**
 * Scoped decorator
 * Marks a route as requiring a specific permission scope
 * @param scope Permission scope
 * @param globalOnly Whether this scope is global-only
 */
export function Scoped(scope: string, globalOnly = false): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.accessScope = { scope, globalOnly };
  };
}

/**
 * RateLimit decorator
 * Applies rate limiting to a route
 * @param config Rate limit configuration
 */
export function RateLimit(config: RateLimitConfig | boolean = true): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.rateLimit = config;
  };
}

/**
 * SkipAuth decorator
 * Marks a route as not requiring authentication
 */
export function SkipAuth(): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.skipAuth = true;
  };
}

/**
 * ApiKeyAuth decorator
 * Marks a route as requiring API key authentication
 */
export function ApiKeyAuth(): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.apiKeyAuth = true;
  };
}

/**
 * Body parameter decorator
 * Injects the request body into a parameter
 */
export function Body(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.args[parameterIndex] = { type: 'body' };
  };
}

/**
 * Query parameter decorator
 * Injects query parameters into a parameter
 */
export function Query(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.args[parameterIndex] = { type: 'query' };
  };
}

/**
 * Param decorator
 * Injects a route parameter into a parameter
 * @param key Parameter name
 */
export function Param(key: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.args[parameterIndex] = { type: 'param', key };
  };
}

/**
 * Header decorator
 * Injects a request header into a parameter
 * @param key Header name
 */
export function Header(key: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.args[parameterIndex] = { type: 'header', key };
  };
}

/**
 * MountRouter decorator
 * Mounts a sub-router on a controller route
 * @param path Route path
 * @param router Express router to mount
 * @param options Route options
 */
export function MountRouter(
  path: string,
  router: Router,
  options: RouteOptions = {},
): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const routeMetadata = getMetadataRegistry().getRouteMetadata(
      target.constructor,
      String(propertyKey),
    );
    routeMetadata.path = path;
    routeMetadata.router = router;
    routeMetadata.skipAuth = options.skipAuth ?? false;
    routeMetadata.rateLimit = options.rateLimit;
  };
}
