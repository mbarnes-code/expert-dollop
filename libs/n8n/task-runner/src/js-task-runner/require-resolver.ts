/**
 * Module require resolver for the sandbox environment.
 * Controls which modules can be imported by user code.
 */
import { isBuiltin } from 'node:module';

import { DisallowedModuleError } from './errors/disallowed-module.error';
import { ExecutionError } from './errors/execution-error';

/**
 * Options for creating a require resolver.
 */
export interface RequireResolverOpts {
  /**
   * List of built-in Node.js modules that are allowed to be required.
   * Use '*' to allow all built-in modules.
   */
  allowedBuiltInModules: Set<string> | '*';

  /**
   * List of external npm modules that are allowed to be required.
   * Use '*' to allow all external modules.
   */
  allowedExternalModules: Set<string> | '*';
}

/**
 * Function signature for the require resolver.
 */
export type RequireResolver = (request: string) => unknown;

/**
 * Creates a require resolver that enforces module allowlists.
 *
 * @param opts - Configuration for allowed modules
 * @returns A function that resolves module requests
 */
export function createRequireResolver({
  allowedBuiltInModules,
  allowedExternalModules,
}: RequireResolverOpts): RequireResolver {
  return (request: string) => {
    const checkIsAllowed = (allowList: Set<string> | '*', moduleName: string) => {
      return allowList === '*' || allowList.has(moduleName);
    };

    const isAllowed = isBuiltin(request)
      ? checkIsAllowed(allowedBuiltInModules, request)
      : checkIsAllowed(allowedExternalModules, request);

    if (!isAllowed) {
      const error = new DisallowedModuleError(request);
      throw new ExecutionError(error);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(request) as unknown;
  };
}
