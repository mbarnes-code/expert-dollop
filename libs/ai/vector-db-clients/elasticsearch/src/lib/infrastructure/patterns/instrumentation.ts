/**
 * Metrics and Logging Hooks for Elasticsearch Operations
 * 
 * Provides extensible hooks for:
 * - Operation metrics (latency, throughput, errors)
 * - Logging (debug, info, warn, error)
 * - Custom instrumentation
 * 
 * @module MetricsHooks
 */

/**
 * Operation metric data
 */
export interface OperationMetric {
  /** Operation name (e.g., 'search', 'index', 'bulk') */
  operation: string;
  /** Duration in milliseconds */
  duration: number;
  /** Whether operation succeeded */
  success: boolean;
  /** Error if operation failed */
  error?: any;
  /** Index name */
  indexName?: string;
  /** Document count for bulk operations */
  documentCount?: number;
  /** Custom metadata */
  metadata?: Record<string, any>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

/**
 * Metrics collector interface
 * 
 * Implement this to send metrics to your monitoring system
 * (e.g., Prometheus, Datadog, New Relic, CloudWatch)
 */
export interface MetricsCollector {
  /**
   * Record an operation metric
   */
  recordMetric(metric: OperationMetric): void;

  /**
   * Record a counter increment
   */
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;

  /**
   * Record a gauge value
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;

  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Logger interface
 * 
 * Implement this to integrate with your logging system
 * (e.g., Winston, Pino, Bunyan, console)
 */
export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: any, context?: Record<string, any>): void;
}

/**
 * No-op metrics collector (default)
 */
export class NoOpMetricsCollector implements MetricsCollector {
  recordMetric(metric: OperationMetric): void {
    // No-op
  }

  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void {
    // No-op
  }

  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    // No-op
  }

  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    // No-op
  }
}

/**
 * Console logger (default)
 */
export class ConsoleLogger implements Logger {
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, any>): void {
    console.info(`[INFO] ${message}`, context || '');
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, error?: any, context?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error || '', context || '');
  }
}

/**
 * Metrics and logging configuration
 */
export interface InstrumentationConfig {
  metricsCollector?: MetricsCollector;
  logger?: Logger;
  enableMetrics?: boolean;
  enableLogging?: boolean;
}

/**
 * Instrumentation class to track metrics and logs
 */
export class Instrumentation {
  private metricsCollector: MetricsCollector;
  private logger: Logger;
  private enableMetrics: boolean;
  private enableLogging: boolean;

  constructor(config: InstrumentationConfig = {}) {
    this.metricsCollector = config.metricsCollector || new NoOpMetricsCollector();
    this.logger = config.logger || new ConsoleLogger();
    this.enableMetrics = config.enableMetrics !== false;
    this.enableLogging = config.enableLogging !== false;
  }

  /**
   * Instrument an async operation
   * 
   * @example
   * ```typescript
   * const result = await instrumentation.instrument(
   *   'search',
   *   () => client.search({ index: 'my-index', body: { query: {...} } }),
   *   { indexName: 'my-index' }
   * );
   * ```
   */
  async instrument<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();

    if (this.enableLogging) {
      this.logger.debug(`Starting operation: ${operation}`, metadata);
    }

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      if (this.enableMetrics) {
        this.metricsCollector.recordMetric({
          operation,
          duration,
          success: true,
          metadata,
          timestamp: new Date(),
        });

        this.metricsCollector.incrementCounter('elasticsearch.operations.total', 1, {
          operation,
          status: 'success',
        });

        this.metricsCollector.recordHistogram('elasticsearch.operation.duration', duration, {
          operation,
        });
      }

      if (this.enableLogging) {
        this.logger.info(`Completed operation: ${operation} in ${duration}ms`, metadata);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (this.enableMetrics) {
        this.metricsCollector.recordMetric({
          operation,
          duration,
          success: false,
          error,
          metadata,
          timestamp: new Date(),
        });

        this.metricsCollector.incrementCounter('elasticsearch.operations.total', 1, {
          operation,
          status: 'error',
        });

        this.metricsCollector.incrementCounter('elasticsearch.errors.total', 1, {
          operation,
        });
      }

      if (this.enableLogging) {
        this.logger.error(`Failed operation: ${operation} after ${duration}ms`, error, metadata);
      }

      throw error;
    }
  }

  /**
   * Log a message
   */
  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.enableLogging) return;

    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(message, context);
        break;
      case LogLevel.INFO:
        this.logger.info(message, context);
        break;
      case LogLevel.WARN:
        this.logger.warn(message, context);
        break;
      case LogLevel.ERROR:
        this.logger.error(message, undefined, context);
        break;
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: OperationMetric): void {
    if (this.enableMetrics) {
      this.metricsCollector.recordMetric(metric);
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void {
    if (this.enableMetrics) {
      this.metricsCollector.incrementCounter(name, value, tags);
    }
  }

  /**
   * Record a gauge value
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    if (this.enableMetrics) {
      this.metricsCollector.recordGauge(name, value, tags);
    }
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    if (this.enableMetrics) {
      this.metricsCollector.recordHistogram(name, value, tags);
    }
  }
}

/**
 * Global instrumentation instance
 * Can be configured at application startup
 */
export let globalInstrumentation = new Instrumentation();

/**
 * Configure global instrumentation
 */
export function configureInstrumentation(config: InstrumentationConfig): void {
  globalInstrumentation = new Instrumentation(config);
}

/**
 * Get global instrumentation instance
 */
export function getInstrumentation(): Instrumentation {
  return globalInstrumentation;
}
