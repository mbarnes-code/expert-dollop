import { Service, Container } from '@expert-dollop/n8n-di';

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Log metadata
 */
export interface LogMetadata {
  [key: string]: unknown;
  scopes?: string[];
  file?: string;
  function?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  outputs?: ('console' | 'file')[];
  filePath?: string;
}

/**
 * Abstract logger interface
 */
export interface ILogger {
  error(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  debug(message: string, metadata?: LogMetadata): void;
  setLevel(level: LogLevel): void;
  child(context: LogMetadata): ILogger;
}

/**
 * Logger service - singleton logger for the application
 * Following DDD modular monolith patterns with dependency injection
 */
@Service()
export class Logger implements ILogger {
  private level: LogLevel = 'info';
  private context: LogMetadata = {};

  private readonly levelPriority: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  constructor(context?: LogMetadata) {
    if (context) {
      this.context = context;
    }
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Check if a level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] <= this.levelPriority[this.level];
  }

  /**
   * Format a log message
   */
  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const combinedMeta = { ...this.context, ...metadata };
    const metaString = Object.keys(combinedMeta).length > 0 
      ? ` ${JSON.stringify(combinedMeta)}` 
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, metadata));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, metadata));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, metadata));
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogMetadata): Logger {
    const childLogger = new Logger({ ...this.context, ...context });
    childLogger.setLevel(this.level);
    return childLogger;
  }

  /**
   * Scoped logger for a specific module
   */
  scoped(scopes: string[]): Logger {
    return this.child({ scopes });
  }
}

/**
 * Get the singleton logger instance
 */
export function getLogger(): Logger {
  return Container.get(Logger);
}
