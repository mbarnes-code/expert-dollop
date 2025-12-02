/**
 * Configuration for the JavaScript task runner.
 * Controls module access and security settings.
 */
import { Config, Env } from '@expert-dollop/n8n-config';

/**
 * Configuration specific to JavaScript code execution.
 * Controls which modules are available in the sandbox.
 */
@Config
export class JsRunnerConfig {
  /**
   * Comma-separated list of allowed built-in Node.js modules.
   * Use '*' to allow all built-in modules.
   * Example: 'crypto,path,url'
   */
  @Env('NODE_FUNCTION_ALLOW_BUILTIN')
  allowedBuiltInModules: string = '';

  /**
   * Comma-separated list of allowed external npm modules.
   * Use '*' to allow all external modules.
   * Example: 'lodash,axios,moment'
   */
  @Env('NODE_FUNCTION_ALLOW_EXTERNAL')
  allowedExternalModules: string = '';

  /**
   * Whether to run in insecure mode (skip sandbox protections).
   * WARNING: Only use in trusted environments.
   */
  @Env('N8N_RUNNERS_INSECURE_MODE')
  insecureMode: boolean = false;
}
