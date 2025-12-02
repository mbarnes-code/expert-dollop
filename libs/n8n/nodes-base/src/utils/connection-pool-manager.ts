/**
 * Connection pool manager for database nodes.
 * Provides efficient connection pooling for database operations.
 */

/**
 * Connection pool configuration.
 */
export interface ConnectionPoolConfig {
  /** Maximum number of connections in the pool */
  maxConnections: number;
  /** Minimum number of connections to maintain */
  minConnections: number;
  /** Maximum time to wait for a connection (ms) */
  acquireTimeoutMillis: number;
  /** How often to check for idle connections (ms) */
  idleTimeoutMillis: number;
  /** How often to validate connections (ms) */
  validationTimeoutMillis: number;
  /** Whether to create connections on startup */
  createOnStartup: boolean;
}

/**
 * Connection wrapper interface.
 */
export interface PooledConnection<T> {
  /** The actual connection object */
  connection: T;
  /** When the connection was created */
  createdAt: Date;
  /** When the connection was last used */
  lastUsedAt: Date;
  /** Whether the connection is currently in use */
  inUse: boolean;
  /** Unique identifier for the connection */
  id: string;
}

/**
 * Connection factory interface.
 * Implement this to create connections for specific databases.
 */
export interface ConnectionFactory<T> {
  /** Create a new connection */
  create(): Promise<T>;
  /** Validate that a connection is still valid */
  validate(connection: T): Promise<boolean>;
  /** Destroy a connection */
  destroy(connection: T): Promise<void>;
}

/**
 * Abstract connection pool manager.
 * Extend this class for specific database implementations.
 */
export abstract class AbstractConnectionPoolManager<T> {
  protected readonly config: ConnectionPoolConfig;
  protected readonly connections: Map<string, PooledConnection<T>> = new Map();
  protected readonly waitingQueue: Array<{
    resolve: (connection: PooledConnection<T>) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  protected isShuttingDown = false;
  protected idleCheckInterval?: NodeJS.Timeout;

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = {
      maxConnections: 10,
      minConnections: 2,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 60000,
      validationTimeoutMillis: 5000,
      createOnStartup: true,
      ...config,
    };
  }

  /**
   * Create a new database connection.
   * Implement this in subclasses for specific databases.
   */
  protected abstract createConnection(): Promise<T>;

  /**
   * Validate that a connection is still active.
   * Implement this in subclasses for specific databases.
   */
  protected abstract validateConnection(connection: T): Promise<boolean>;

  /**
   * Destroy a database connection.
   * Implement this in subclasses for specific databases.
   */
  protected abstract destroyConnection(connection: T): Promise<void>;

  /**
   * Initialize the connection pool.
   */
  async initialize(): Promise<void> {
    if (this.config.createOnStartup) {
      const promises: Promise<void>[] = [];
      for (let i = 0; i < this.config.minConnections; i++) {
        promises.push(this.addConnection());
      }
      await Promise.all(promises);
    }

    // Start idle connection checker
    this.idleCheckInterval = setInterval(
      () => this.checkIdleConnections(),
      this.config.idleTimeoutMillis / 2,
    );
  }

  /**
   * Add a new connection to the pool.
   */
  private async addConnection(): Promise<void> {
    const id = this.generateConnectionId();
    const connection = await this.createConnection();

    const pooledConnection: PooledConnection<T> = {
      connection,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      inUse: false,
      id,
    };

    this.connections.set(id, pooledConnection);
  }

  /**
   * Acquire a connection from the pool.
   */
  async acquire(): Promise<PooledConnection<T>> {
    if (this.isShuttingDown) {
      throw new Error('Connection pool is shutting down');
    }

    // Try to find an available connection
    for (const pooledConnection of this.connections.values()) {
      if (!pooledConnection.inUse) {
        // Validate the connection before returning
        const isValid = await this.validateConnection(pooledConnection.connection);
        if (isValid) {
          pooledConnection.inUse = true;
          pooledConnection.lastUsedAt = new Date();
          return pooledConnection;
        } else {
          // Remove invalid connection
          await this.removeConnection(pooledConnection.id);
        }
      }
    }

    // If we can create more connections, do so
    if (this.connections.size < this.config.maxConnections) {
      await this.addConnection();
      return this.acquire();
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex((w) => w.resolve === resolve);
        if (index > -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection acquire timeout'));
      }, this.config.acquireTimeoutMillis);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  /**
   * Release a connection back to the pool.
   */
  async release(pooledConnection: PooledConnection<T>): Promise<void> {
    const connection = this.connections.get(pooledConnection.id);
    if (connection) {
      connection.inUse = false;
      connection.lastUsedAt = new Date();

      // Check if anyone is waiting for a connection
      if (this.waitingQueue.length > 0) {
        const waiting = this.waitingQueue.shift();
        if (waiting) {
          clearTimeout(waiting.timeout);
          connection.inUse = true;
          waiting.resolve(connection);
        }
      }
    }
  }

  /**
   * Remove a connection from the pool.
   */
  private async removeConnection(id: string): Promise<void> {
    const pooledConnection = this.connections.get(id);
    if (pooledConnection) {
      try {
        await this.destroyConnection(pooledConnection.connection);
      } catch {
        // Ignore errors during destruction
      }
      this.connections.delete(id);
    }
  }

  /**
   * Check and remove idle connections.
   */
  private async checkIdleConnections(): Promise<void> {
    const now = Date.now();

    for (const [id, connection] of this.connections.entries()) {
      if (
        !connection.inUse &&
        this.connections.size > this.config.minConnections &&
        now - connection.lastUsedAt.getTime() > this.config.idleTimeoutMillis
      ) {
        await this.removeConnection(id);
      }
    }
  }

  /**
   * Shutdown the connection pool.
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Clear the idle check interval
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }

    // Reject all waiting requests
    for (const waiting of this.waitingQueue) {
      clearTimeout(waiting.timeout);
      waiting.reject(new Error('Connection pool is shutting down'));
    }
    this.waitingQueue.length = 0;

    // Destroy all connections
    const promises: Promise<void>[] = [];
    for (const id of this.connections.keys()) {
      promises.push(this.removeConnection(id));
    }
    await Promise.all(promises);
  }

  /**
   * Get the current pool statistics.
   */
  getStats(): ConnectionPoolStats {
    let inUse = 0;
    let available = 0;

    for (const connection of this.connections.values()) {
      if (connection.inUse) {
        inUse++;
      } else {
        available++;
      }
    }

    return {
      total: this.connections.size,
      inUse,
      available,
      waiting: this.waitingQueue.length,
      maxConnections: this.config.maxConnections,
    };
  }

  /**
   * Generate a unique connection ID.
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Connection pool statistics.
 */
export interface ConnectionPoolStats {
  /** Total number of connections in the pool */
  total: number;
  /** Number of connections currently in use */
  inUse: number;
  /** Number of connections available */
  available: number;
  /** Number of requests waiting for a connection */
  waiting: number;
  /** Maximum allowed connections */
  maxConnections: number;
}

/**
 * Execute a function with a pooled connection.
 * Automatically acquires and releases the connection.
 */
export async function withPooledConnection<T, R>(
  pool: AbstractConnectionPoolManager<T>,
  fn: (connection: T) => Promise<R>,
): Promise<R> {
  const pooledConnection = await pool.acquire();
  try {
    return await fn(pooledConnection.connection);
  } finally {
    await pool.release(pooledConnection);
  }
}
