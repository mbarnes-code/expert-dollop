/**
 * Health check server for the task runner.
 * Provides a simple HTTP endpoint for monitoring runner health.
 */
import { createServer, type Server } from 'node:http';
import { ApplicationError } from '@expert-dollop/n8n-errors';

/**
 * Simple HTTP health check server.
 * Returns 200 OK for all requests when the runner is healthy.
 */
export class HealthCheckServer {
  private server: Server = createServer((_, res) => {
    res.writeHead(200);
    res.end('OK');
  });

  /**
   * Starts the health check server.
   *
   * @param host - Host address to bind to
   * @param port - Port number to listen on
   * @throws ApplicationError if the port is already in use
   */
  async start(host: string, port: number): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      const portInUseErrorHandler = (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          reject(new ApplicationError(`Port ${port} is already in use`));
        } else {
          reject(error);
        }
      };

      this.server.on('error', portInUseErrorHandler);

      this.server.listen(port, host, () => {
        this.server.removeListener('error', portInUseErrorHandler);
        console.log(`Health check server listening on ${host}, port ${port}`);
        resolve();
      });
    });
  }

  /**
   * Stops the health check server gracefully.
   */
  async stop(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
