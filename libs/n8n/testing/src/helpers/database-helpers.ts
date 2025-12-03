/**
 * Database test helpers for setting up and tearing down test databases
 */

export interface DatabaseTestHelper {
  setup(): Promise<void>;
  teardown(): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory database helper for testing
 */
export class InMemoryDatabaseHelper implements DatabaseTestHelper {
  private data: Map<string, any> = new Map();

  async setup(): Promise<void> {
    this.data.clear();
  }

  async teardown(): Promise<void> {
    this.data.clear();
  }

  async clear(): Promise<void> {
    this.data.clear();
  }

  set(key: string, value: any): void {
    this.data.set(key, value);
  }

  get(key: string): any {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  getAll(): Map<string, any> {
    return new Map(this.data);
  }
}

/**
 * Create a test database helper
 */
export function createTestDatabaseHelper(): DatabaseTestHelper {
  return new InMemoryDatabaseHelper();
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await sleep(interval);
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock response object for testing API calls
 */
export interface MockResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

export function createMockResponse(data: any, status: number = 200): MockResponse {
  return {
    status,
    data,
    headers: {
      'content-type': 'application/json'
    }
  };
}

/**
 * Assert that an error is thrown
 */
export async function assertThrows(
  fn: () => Promise<any> | any,
  expectedError?: string | RegExp
): Promise<void> {
  let error: Error | null = null;
  
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }
  
  if (!error) {
    throw new Error('Expected function to throw an error, but it did not');
  }
  
  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!error.message.includes(expectedError)) {
        throw new Error(`Expected error message to include "${expectedError}", but got "${error.message}"`);
      }
    } else {
      if (!expectedError.test(error.message)) {
        throw new Error(`Expected error message to match ${expectedError}, but got "${error.message}"`);
      }
    }
  }
}
