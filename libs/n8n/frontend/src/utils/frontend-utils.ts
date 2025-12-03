/**
 * Frontend utility functions for Vue.js applications.
 * Provides common utility patterns following DDD principles.
 */

/**
 * DOM utility functions
 */

/**
 * Check if an element is visible in the viewport
 * @param element Element to check
 * @param threshold Intersection threshold (0-1)
 */
export function isElementInViewport(element: Element, threshold = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView = 
    (rect.top + rect.height * threshold <= windowHeight) && 
    (rect.bottom - rect.height * threshold >= 0);
  const horInView = 
    (rect.left + rect.width * threshold <= windowWidth) && 
    (rect.right - rect.width * threshold >= 0);

  return vertInView && horInView;
}

/**
 * Scroll to an element smoothly
 * @param element Element to scroll to
 * @param options Scroll options
 */
export function scrollToElement(
  element: Element,
  options: { behavior?: 'smooth' | 'auto'; block?: 'start' | 'center' | 'end' | 'nearest' } = {},
): void {
  element.scrollIntoView({
    behavior: options.behavior ?? 'smooth',
    block: options.block ?? 'start',
  });
}

/**
 * Get scrollbar width
 */
export function getScrollbarWidth(): number {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Lock body scroll
 */
export function lockBodyScroll(): () => void {
  const scrollbarWidth = getScrollbarWidth();
  const originalPaddingRight = document.body.style.paddingRight;
  const originalOverflow = document.body.style.overflow;

  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.paddingRight = originalPaddingRight;
    document.body.style.overflow = originalOverflow;
  };
}

/**
 * String utility functions
 */

/**
 * Truncate a string with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param ellipsis Ellipsis string
 */
export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert string to slug
 * @param str String to convert
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter
 * @param str String to capitalize
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 * @param str String to convert
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Escape HTML entities
 * @param str String to escape
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * URL utility functions
 */

/**
 * Parse query string to object
 * @param queryString Query string to parse
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 * @param params Parameters object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

/**
 * Join URL parts
 * @param parts URL parts
 */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/$/, '');
      }
      return part.replace(/^\/|\/$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Check if URL is external
 * @param url URL to check
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Object utility functions
 */

/**
 * Deep clone an object
 * @param obj Object to clone
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 * @param target Target object
 * @param sources Source objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key as keyof T];
      
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        target[key as keyof T] = deepMerge(
          targetValue as object,
          sourceValue as object,
        ) as T[keyof T];
      } else {
        target[key as keyof T] = sourceValue as T[keyof T];
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object;
}

/**
 * Pick specified keys from object
 * @param obj Source object
 * @param keys Keys to pick
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified keys from object
 * @param obj Source object
 * @param keys Keys to omit
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Check if object is empty
 * @param obj Object to check
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Array utility functions
 */

/**
 * Remove duplicates from array
 * @param arr Array to dedupe
 * @param keyFn Optional key function
 */
export function unique<T>(arr: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return [...new Set(arr)];
  }
  const seen = new Set();
  return arr.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Group array by key
 * @param arr Array to group
 * @param keyFn Key function
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Sort array by key
 * @param arr Array to sort
 * @param keyFn Key function
 * @param order Sort order
 */
export function sortBy<T>(
  arr: T[],
  keyFn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  const sorted = [...arr].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Chunk array into smaller arrays
 * @param arr Array to chunk
 * @param size Chunk size
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested array
 * @param arr Array to flatten
 * @param depth Flatten depth
 */
export function flatten<T>(arr: (T | T[])[], depth = 1): T[] {
  if (depth === 0) {
    // When depth is 0, return a shallow copy without flattening
    return arr.flatMap(item => Array.isArray(item) ? item : [item]) as T[];
  }
  
  return arr.reduce<T[]>((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(flatten(item as (T | T[])[], depth - 1));
    }
    return flat.concat(item);
  }, []);
}

/**
 * Async utility functions
 */

/**
 * Wait for a specified time
 * @param ms Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run promises in sequence
 * @param fns Functions returning promises
 */
export async function sequence<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
}

/**
 * Run promises with concurrency limit
 * @param fns Functions returning promises
 * @param limit Concurrency limit
 */
export async function pool<T>(fns: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const fn of fns) {
    const promise = fn().then(result => {
      results.push(result);
    });
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex(p => p === promise),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Create a cancellable promise
 * @param promise Original promise
 */
export function cancellable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let isCancelled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      value => (isCancelled ? reject({ cancelled: true }) : resolve(value)),
      error => (isCancelled ? reject({ cancelled: true }) : reject(error)),
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCancelled = true;
    },
  };
}

/**
 * Format utility functions
 */

/**
 * Format file size
 * @param bytes Size in bytes
 * @param decimals Decimal places
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format duration
 * @param ms Duration in milliseconds
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * ID generation utilities
 */

/**
 * Generate a UUID v4
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short ID
 * @param length ID length
 */
export function shortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
