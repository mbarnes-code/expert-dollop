/**
 * Environment utilities for detecting the current environment
 */

/**
 * Check if running in development mode
 */
export function inDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function inProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function inTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get the current environment name
 */
export function getEnvironment(): 'development' | 'production' | 'test' | 'unknown' {
  const env = process.env.NODE_ENV;
  if (env === 'development' || env === 'production' || env === 'test') {
    return env;
  }
  return 'unknown';
}

/**
 * Get an environment variable with a fallback value
 */
export function getEnvVar<T extends string>(name: string, fallback: T): T;
export function getEnvVar(name: string): string | undefined;
export function getEnvVar<T extends string>(name: string, fallback?: T): T | string | undefined {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  }
  return fallback;
}

/**
 * Get an environment variable as a number
 */
export function getEnvVarNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (value !== undefined) {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

/**
 * Get an environment variable as a boolean
 */
export function getEnvVarBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value !== undefined) {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return fallback;
}
