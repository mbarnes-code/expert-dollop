import path from 'path';

/**
 * Check if a file path is contained within a base path
 * Prevents path traversal attacks
 */
export function isContainedWithin(basePath: string, targetPath: string): boolean {
  const normalizedBase = path.resolve(basePath);
  const normalizedTarget = path.resolve(targetPath);
  
  // Check if target starts with base path
  if (!normalizedTarget.startsWith(normalizedBase)) {
    return false;
  }
  
  // Make sure it's not just a prefix match (e.g., /base/path vs /base/pathevil)
  const relative = path.relative(normalizedBase, normalizedTarget);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Safely join paths, preventing path traversal
 */
export function safeJoinPath(basePath: string, ...paths: string[]): string | null {
  const joinedPath = path.join(basePath, ...paths);
  
  if (!isContainedWithin(basePath, joinedPath)) {
    return null;
  }
  
  return path.normalize(joinedPath);
}

/**
 * Check if a value is a plain object literal
 */
export function isObjectLiteral(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    const targetValue = result[key as keyof T];
    const sourceValue = source[key as keyof T];
    
    if (isObjectLiteral(targetValue) && isObjectLiteral(sourceValue)) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }
  
  return result;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
