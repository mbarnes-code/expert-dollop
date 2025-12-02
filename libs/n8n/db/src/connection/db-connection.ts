/**
 * Database connection options interface
 */
export interface DbConnectionOptions {
  type: 'sqlite' | 'postgresdb' | 'mysqldb' | 'mariadb';
  database?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  ssl?: boolean;
  sslCa?: string;
  sslCert?: string;
  sslKey?: string;
  sslRejectUnauthorized?: boolean;
  poolSize?: number;
  tablePrefix?: string;
  logging?: boolean | 'all' | 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Abstract database connection class
 * Implementations can extend this for TypeORM, Knex, etc.
 */
export abstract class AbstractDbConnection {
  protected options: DbConnectionOptions;

  constructor(options: DbConnectionOptions) {
    this.options = options;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract isConnected(): boolean;

  /**
   * Get the database type
   */
  get type(): DbConnectionOptions['type'] {
    return this.options.type;
  }
}
