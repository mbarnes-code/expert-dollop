/**
 * Retry Strategy with Exponential Backoff and Jitter
 * 
 * Provides configurable retry logic with:
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Maximum retry attempts
 * - Backoff multiplier
 * - Configurable retryable error detection
 * 
 * @module RetryStrategy
 */

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Backoff multiplier (e.g., 2 for doubling) */
  backoffMultiplier: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Whether to add jitter to prevent thundering herd */
  useJitter: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: any) => boolean;
}

export interface RetryStats {
  attempts: number;
  totalDelay: number;
  lastError?: any;
}

/**
 * Default implementation to check if error is retryable
 * 
 * Retries on:
 * - Network errors (ECONNREFUSED, ETIMEDOUT, etc.)
 * - HTTP 5xx errors
 * - HTTP 429 (Too Many Requests)
 * - HTTP 408 (Request Timeout)
 */
export function defaultIsRetryable(error: any): boolean {
  // Network errors
  const networkErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'];
  if (error.code && networkErrors.includes(error.code)) {
    return true;
  }

  // HTTP status codes
  if (error.statusCode) {
    const status = error.statusCode;
    // 5xx server errors
    if (status >= 500 && status < 600) {
      return true;
    }
    // 429 Too Many Requests
    if (status === 429) {
      return true;
    }
    // 408 Request Timeout
    if (status === 408) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 * 
 * @param attempt - Current attempt number (0-based)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
export function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);

  if (options.useJitter) {
    // Add random jitter between 0 and delay
    // This prevents thundering herd problem
    return Math.random() * cappedDelay;
  }

  return cappedDelay;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic
 * 
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Result of the function
 * @throws Last error if all retries exhausted
 * 
 * @example
 * ```typescript
 * const options: RetryOptions = {
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffMultiplier: 2,
 *   maxDelay: 10000,
 *   useJitter: true
 * };
 * 
 * const result = await executeWithRetry(
 *   () => fetch('https://api.example.com'),
 *   options
 * );
 * ```
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const isRetryable = options.isRetryable || defaultIsRetryable;
  const stats: RetryStats = {
    attempts: 0,
    totalDelay: 0,
  };

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    stats.attempts++;

    try {
      return await fn();
    } catch (error) {
      stats.lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === options.maxRetries) {
        throw error;
      }

      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw error;
      }

      // Calculate and apply delay
      const delay = calculateDelay(attempt, options);
      stats.totalDelay += delay;

      // Log retry attempt (in production, use proper logger)
      if (process.env.NODE_ENV !== 'test') {
        console.log(
          `Retry attempt ${attempt + 1}/${options.maxRetries} after ${delay}ms delay. ` +
          `Error: ${error.message || error}`
        );
      }

      await sleep(delay);
    }
  }

  // This should never be reached due to throw in loop
  throw stats.lastError;
}

/**
 * Retry strategy class for reusable retry configuration
 * 
 * @example
 * ```typescript
 * const strategy = new RetryStrategy({
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffMultiplier: 2,
 *   maxDelay: 10000,
 *   useJitter: true
 * });
 * 
 * const result = await strategy.execute(() => someOperation());
 * ```
 */
export class RetryStrategy {
  constructor(private readonly options: RetryOptions) {}

  /**
   * Execute function with this retry strategy
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return executeWithRetry(fn, this.options);
  }

  /**
   * Get retry options
   */
  getOptions(): Readonly<RetryOptions> {
    return { ...this.options };
  }
}

/**
 * Predefined retry strategies for common use cases
 */
export const RetryStrategies = {
  /**
   * Conservative strategy for critical operations
   * - 5 retries
   * - 2 second initial delay
   * - Exponential backoff with jitter
   * - Max 30 second delay
   */
  conservative: new RetryStrategy({
    maxRetries: 5,
    initialDelay: 2000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    useJitter: true,
  }),

  /**
   * Aggressive strategy for non-critical operations
   * - 3 retries
   * - 500ms initial delay
   * - Exponential backoff with jitter
   * - Max 5 second delay
   */
  aggressive: new RetryStrategy({
    maxRetries: 3,
    initialDelay: 500,
    backoffMultiplier: 2,
    maxDelay: 5000,
    useJitter: true,
  }),

  /**
   * Default Elasticsearch strategy
   * - 3 retries
   * - 1 second initial delay
   * - Exponential backoff with jitter
   * - Max 10 second delay
   */
  elasticsearch: new RetryStrategy({
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    useJitter: true,
  }),
};
