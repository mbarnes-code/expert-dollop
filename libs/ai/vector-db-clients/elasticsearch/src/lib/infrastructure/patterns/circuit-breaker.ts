/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by temporarily stopping requests to a failing service.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failure threshold exceeded, requests fail fast
 * - HALF_OPEN: Testing if service has recovered
 * 
 * @module CircuitBreaker
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before attempting recovery */
  resetTimeout: number;
  /** Success count needed in HALF_OPEN to close circuit */
  successThreshold: number;
  /** Name for logging/metrics */
  name?: string;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: Date;
  lastStateChange?: Date;
}

/**
 * Circuit Breaker implementation for fault tolerance
 * 
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   resetTimeout: 60000,
 *   successThreshold: 2
 * });
 * 
 * try {
 *   const result = await breaker.execute(() => elasticsearchCall());
 * } catch (error) {
 *   // Handle circuit open or underlying error
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private totalRequests = 0;
  private lastFailureTime?: Date;
  private lastStateChange?: Date;
  private resetTimer?: NodeJS.Timeout;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.lastStateChange = new Date();
  }

  /**
   * Execute a function with circuit breaker protection
   * 
   * @param fn - Function to execute
   * @returns Result of the function
   * @throws CircuitBreakerOpenError if circuit is open
   * @throws Original error if function fails and circuit allows it through
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker is OPEN${this.options.name ? ` for ${this.options.name}` : ''}. ` +
        `Last failure: ${this.lastFailureTime?.toISOString() || 'unknown'}`
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
    };
  }

  /**
   * Manually reset the circuit breaker to CLOSED state
   */
  reset(): void {
    this.setState(CircuitState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.clearResetTimer();
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.options.successThreshold) {
        this.setState(CircuitState.CLOSED);
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on successful request
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN returns to OPEN
      this.setState(CircuitState.OPEN);
      this.successCount = 0;
      this.scheduleReset();
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.options.failureThreshold) {
        this.setState(CircuitState.OPEN);
        this.scheduleReset();
      }
    }
  }

  /**
   * Schedule transition from OPEN to HALF_OPEN
   */
  private scheduleReset(): void {
    this.clearResetTimer();
    
    this.resetTimer = setTimeout(() => {
      if (this.state === CircuitState.OPEN) {
        this.setState(CircuitState.HALF_OPEN);
        this.successCount = 0;
      }
    }, this.options.resetTimeout);
  }

  /**
   * Clear reset timer
   */
  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }
  }

  /**
   * Change circuit state
   */
  private setState(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.lastStateChange = new Date();
    }
  }
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    Object.setPrototypeOf(this, CircuitBreakerOpenError.prototype);
  }
}
