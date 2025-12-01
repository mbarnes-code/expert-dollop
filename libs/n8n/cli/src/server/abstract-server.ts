import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';

/**
 * Server configuration options
 */
export interface ServerConfig {
  port: number;
  address: string;
  protocol: 'http' | 'https';
  sslKey?: string;
  sslCert?: string;
  proxyHops?: number;
  gracefulShutdownTimeout?: number;
}

/**
 * Endpoint configuration
 */
export interface EndpointConfig {
  rest: string;
  webhook: string;
  webhookTest: string;
  webhookWaiting: string;
  form: string;
  formTest: string;
  formWaiting: string;
  mcp?: string;
  mcpTest?: string;
}

/**
 * Abstract base class for HTTP servers
 * Provides common functionality for Express-based servers
 */
export abstract class AbstractServer {
  protected server?: HttpServer | HttpsServer;
  protected config: ServerConfig;
  protected endpoints: EndpointConfig;

  /**
   * Whether webhooks are enabled
   */
  protected webhooksEnabled = true;

  /**
   * Whether test webhooks are enabled
   */
  protected testWebhooksEnabled = false;

  constructor(config: ServerConfig, endpoints: EndpointConfig) {
    this.config = config;
    this.endpoints = endpoints;
  }

  /**
   * Initializes the server
   * Creates HTTP or HTTPS server based on configuration
   */
  abstract init(): Promise<void>;

  /**
   * Starts the server
   * Sets up middleware, routes, and starts listening
   */
  abstract start(): Promise<void>;

  /**
   * Configures the server
   * Override to add custom configuration
   */
  async configure(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Sets up health check endpoints
   */
  protected abstract setupHealthCheck(): void;

  /**
   * Sets up common middleware
   */
  protected abstract setupCommonMiddlewares(): void;

  /**
   * Sets up development middleware
   */
  protected abstract setupDevMiddlewares(): void;

  /**
   * Sets up push server for real-time updates
   */
  protected setupPushServer(): void {
    // Override in derived classes
  }

  /**
   * Sets up error handlers
   */
  protected abstract setupErrorHandlers(): Promise<void>;

  /**
   * Logs an info message
   * @param message - Message to log
   */
  protected log(message: string): void {
    console.log(`[Server] ${message}`);
  }

  /**
   * Logs an error message
   * @param message - Error message
   * @param error - Optional error object
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[Server] ERROR: ${message}`, error);
  }

  /**
   * Handles server errors
   * @param error - Server error
   */
  protected handleServerError(error: Error & { code?: string }): void {
    const { port, address } = this.config;

    if (error.code === 'EADDRINUSE') {
      this.logError(`Port ${port} is already in use`);
    } else if (error.code === 'EACCES') {
      this.logError(`No permission to use port ${port}`);
    } else if (error.code === 'EAFNOSUPPORT') {
      this.logError(`Address '${address}' is not available`);
    } else {
      this.logError('Server failed', error);
    }

    process.exit(1);
  }

  /**
   * Shuts down the server
   */
  onShutdown(): void {
    if (!this.server) {
      return;
    }

    this.log(`Shutting down ${this.config.protocol} server`);

    this.server.close((error) => {
      if (error) {
        this.logError('Error during shutdown', error);
      } else {
        this.log('Server shut down');
      }
    });
  }

  /**
   * Gets the server instance
   * @returns HTTP/HTTPS server or undefined
   */
  getServer(): HttpServer | HttpsServer | undefined {
    return this.server;
  }

  /**
   * Checks if server is running
   * @returns True if server is listening
   */
  isRunning(): boolean {
    return this.server?.listening ?? false;
  }

  /**
   * Gets the server address
   * @returns Server address info
   */
  getAddress(): { port: number; address: string } | undefined {
    const addr = this.server?.address();
    if (addr && typeof addr !== 'string') {
      return { port: addr.port, address: addr.address };
    }
    return undefined;
  }
}

/**
 * Health check status
 */
export interface HealthCheckStatus {
  status: 'ok' | 'error';
  database?: boolean;
  migrated?: boolean;
}

/**
 * Creates a health check handler
 * @param getStatus - Function to get current status
 * @returns Health check handler
 */
export function createHealthCheckHandler(
  getStatus: () => HealthCheckStatus
): (req: unknown, res: { status: (code: number) => { send: (data: unknown) => void }; send: (data: unknown) => void }) => void {
  return (_req, res) => {
    const status = getStatus();
    if (status.status === 'ok') {
      res.status(200).send(status);
    } else {
      res.status(503).send(status);
    }
  };
}

/**
 * Creates a simple health check handler
 * @returns Simple health check handler
 */
export function createSimpleHealthCheckHandler(): (
  req: unknown,
  res: { send: (data: unknown) => void }
) => void {
  return (_req, res) => {
    res.send({ status: 'ok' });
  };
}
