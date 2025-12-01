/**
 * @fileoverview Workflow utilities
 * @module @expert-dollop/n8n-workflow
 */

import type { 
  IDataObject, 
  GenericValue, 
  BinaryFileType,
  INodeExecutionData,
} from './interfaces';

/**
 * Checks if an object is empty
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
export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Parse JSON with better error handling
 */
export function jsonParse<T>(jsonString: string, options?: { fallbackValue?: T }): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    if (options?.fallbackValue !== undefined) {
      return options.fallbackValue;
    }
    throw error;
  }
}

/**
 * Stringify JSON with circular reference handling
 */
export function jsonStringify(value: unknown, options?: { spaces?: number }): string {
  return JSON.stringify(value, replaceCircularReferences(), options?.spaces);
}

/**
 * Creates a replacer function that handles circular references
 */
export function replaceCircularReferences(): (key: string, value: unknown) => unknown {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
}

/**
 * Removes circular references from an object
 */
export function removeCircularRefs<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, replaceCircularReferences()));
}

/**
 * Base64 decode a UTF-8 string
 */
export function base64DecodeUTF8(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
  // Browser fallback
  return decodeURIComponent(escape(atob(str)));
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
    const timer = setTimeout(resolve, ms);
    
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new Error('Aborted'));
        return;
      }
      
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
      }, { once: true });
    }
  });
}

/**
 * Determines file type from MIME type
 */
export function fileTypeFromMimeType(mimeType: string): BinaryFileType | undefined {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType === 'text/html') {
    return 'html';
  }
  if (mimeType.startsWith('text/') || mimeType === 'application/javascript') {
    return 'text';
  }
  if (mimeType === 'application/json') {
    return 'json';
  }
  return undefined;
}

/**
 * Asserts a condition is true
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random string of specified length
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
 * Checks if a property name is safe to set on an object
 */
export function isSafeObjectProperty(obj: object, key: string): boolean {
  const dangerousProperties = [
    '__proto__',
    'constructor',
    'prototype',
  ];
  return !dangerousProperties.includes(key);
}

/**
 * Safely sets a property on an object, preventing prototype pollution
 */
export function setSafeObjectProperty(obj: IDataObject, key: string, value: unknown): void {
  if (isSafeObjectProperty(obj, key)) {
    obj[key] = value as GenericValue;
  }
}

/**
 * Checks if a domain is in the allowed list
 */
export function isDomainAllowed(domain: string, allowedDomains: string[]): boolean {
  const normalizedDomain = domain.toLowerCase();
  return allowedDomains.some(allowed => {
    const normalizedAllowed = allowed.toLowerCase();
    if (normalizedAllowed.startsWith('*.')) {
      const suffix = normalizedAllowed.slice(1);
      return normalizedDomain.endsWith(suffix) || normalizedDomain === normalizedAllowed.slice(2);
    }
    return normalizedDomain === normalizedAllowed;
  });
}

/**
 * Checks if a package name follows the community package naming convention
 */
export function isCommunityPackageName(packageName: string): boolean {
  return packageName.startsWith('n8n-nodes-') && !packageName.startsWith('n8n-nodes-base');
}

/**
 * Updates display options based on node context
 */
export function updateDisplayOptions(
  displayOptions: object | undefined,
  properties: object[],
): object[] {
  if (!displayOptions) {
    return properties;
  }
  
  return properties.map(prop => ({
    ...prop,
    displayOptions: {
      ...(prop as any).displayOptions,
      ...displayOptions,
    },
  }));
}
