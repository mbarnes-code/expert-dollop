/**
 * @fileoverview Utility functions for n8n-core
 * @module @expert-dollop/n8n-core/utils
 */

import type { IDataObject, INodeExecutionData } from '@expert-dollop/n8n-workflow';
import { createHash, randomBytes } from 'crypto';

/**
 * Generates a hash from data
 */
export function generateHash(data: string, algorithm = 'sha256'): string {
  return createHash(algorithm).update(data).digest('hex');
}

/**
 * Generates a random token
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Normalizes items to ensure consistent format
 */
export function normalizeItems(
  items: INodeExecutionData | INodeExecutionData[],
): INodeExecutionData[] {
  if (!Array.isArray(items)) {
    return [items];
  }
  return items;
}

/**
 * Deep merges objects
 */
export function deepMerge<T extends IDataObject>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key as keyof T] = deepMerge(
          targetValue as IDataObject,
          sourceValue as IDataObject,
        ) as T[keyof T];
      } else if (sourceValue !== undefined) {
        result[key as keyof T] = sourceValue as T[keyof T];
      }
    }
  }
  
  return result;
}

/**
 * Checks if a value is a plain object
 */
export function isObject(value: unknown): value is IDataObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Flattens an object to dot notation
 */
export function flattenObject(
  obj: IDataObject,
  prefix = '',
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (isObject(value)) {
      Object.assign(result, flattenObject(value as IDataObject, newKey));
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Unflattens a dot-notation object
 */
export function unflattenObject(obj: Record<string, unknown>): IDataObject {
  const result: IDataObject = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.');
    let current: IDataObject = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as IDataObject;
    }
    
    current[parts[parts.length - 1]] = value as IDataObject[keyof IDataObject];
  }
  
  return result;
}

/**
 * Safely gets a nested property from an object
 */
export function getNestedValue(
  obj: IDataObject,
  path: string,
  defaultValue?: unknown,
): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    if (typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as IDataObject)[part];
  }
  
  return current ?? defaultValue;
}

/**
 * Safely sets a nested property on an object
 */
export function setNestedValue(obj: IDataObject, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: IDataObject = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as IDataObject;
  }
  
  current[parts[parts.length - 1]] = value as IDataObject[keyof IDataObject];
}

/**
 * Removes undefined values from an object
 */
export function removeUndefined<T extends IDataObject>(obj: T): T {
  const result = { ...obj };
  
  for (const key of Object.keys(result)) {
    if (result[key] === undefined) {
      delete result[key];
    } else if (isObject(result[key])) {
      result[key as keyof T] = removeUndefined(result[key] as IDataObject) as T[keyof T];
    }
  }
  
  return result;
}
