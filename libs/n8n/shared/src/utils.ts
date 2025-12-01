/**
 * Common utility functions shared across n8n modules
 */

import type { IDataObject, GenericValue } from '@expert-dollop/n8n-types';

/**
 * Check if an object is empty
 */
export function isObjectEmpty(obj: object | null | undefined): boolean {
  if (obj === null || obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

/**
 * Deep copy an object
 */
export function deepCopy<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy) as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  const copy = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (copy as Record<string, unknown>)[key] = deepCopy((obj as Record<string, unknown>)[key]);
    }
  }

  return copy;
}

/**
 * Parse JSON safely with a fallback value
 */
export function jsonParse<T = IDataObject>(jsonString: string, fallback?: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error('Failed to parse JSON string');
  }
}

/**
 * Stringify JSON safely
 */
export function jsonStringify(value: unknown, pretty = false): string {
  return JSON.stringify(value, null, pretty ? 2 : undefined);
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sleep with abort signal support
 */
export function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Aborted'));
    });
  });
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random string of specified length
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Base64 decode a UTF-8 string
 */
export function base64DecodeUTF8(base64String: string): string {
  return Buffer.from(base64String, 'base64').toString('utf-8');
}

/**
 * Base64 encode a UTF-8 string
 */
export function base64EncodeUTF8(utf8String: string): string {
  return Buffer.from(utf8String, 'utf-8').toString('base64');
}

/**
 * Remove circular references from an object for safe JSON serialization
 */
export function removeCircularRefs<T>(obj: T, seen = new WeakSet()): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj as object)) {
    return '[Circular]' as T;
  }

  seen.add(obj as object);

  if (Array.isArray(obj)) {
    return obj.map((item) => removeCircularRefs(item, seen)) as T;
  }

  const result = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (result as Record<string, unknown>)[key] = removeCircularRefs(
        (obj as Record<string, unknown>)[key],
        seen,
      );
    }
  }

  return result;
}

/**
 * Assert that a condition is true
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

/**
 * Check if a property access is safe
 */
export function isSafeObjectProperty(key: string): boolean {
  const unsafeProperties = ['__proto__', 'constructor', 'prototype'];
  return !unsafeProperties.includes(key);
}

/**
 * Set a property on an object safely
 */
export function setSafeObjectProperty<T extends object>(
  obj: T,
  key: string,
  value: unknown,
): boolean {
  if (!isSafeObjectProperty(key)) {
    return false;
  }
  (obj as Record<string, unknown>)[key] = value;
  return true;
}

/**
 * Get file type from MIME type
 */
export function fileTypeFromMimeType(
  mimeType: string,
): 'text' | 'json' | 'image' | 'audio' | 'video' | 'pdf' | 'html' | 'unknown' {
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType === 'application/json') return 'json';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/html') return 'html';
  return 'unknown';
}
