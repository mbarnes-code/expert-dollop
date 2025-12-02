/**
 * Workflow utility functions for n8n nodes.
 * Common workflow operations used across multiple nodes.
 */

import type { IDataObject } from './object-utils';

/**
 * Node execution data interface.
 */
export interface INodeExecutionData {
  json: IDataObject;
  binary?: Record<string, IBinaryData>;
  pairedItem?: IPairedItemData | IPairedItemData[];
  error?: Error;
}

/**
 * Binary data interface.
 */
export interface IBinaryData {
  data: string;
  mimeType: string;
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: string;
}

/**
 * Paired item data interface.
 */
export interface IPairedItemData {
  item: number;
  input?: number;
}

/**
 * Wrap data in the expected node execution output format.
 *
 * @param data The data to wrap
 */
export function wrapData(
  data: IDataObject | IDataObject[],
): INodeExecutionData[] {
  if (!Array.isArray(data)) {
    return [{ json: data }];
  }
  return data.map((item) => ({ json: item }));
}

/**
 * Sorts each item json's keys by a priority list.
 *
 * @param data The array of items which keys will be sorted
 * @param priorityList The priority list, keys will be sorted in this order first then alphabetically
 */
export function sortItemKeysByPriorityList(
  data: INodeExecutionData[],
  priorityList: string[],
): INodeExecutionData[] {
  return data.map((item) => {
    const itemKeys = Object.keys(item.json);

    const updatedKeysOrder = itemKeys.sort((a, b) => {
      const indexA = priorityList.indexOf(a);
      const indexB = priorityList.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      } else if (indexA !== -1) {
        return -1;
      } else if (indexB !== -1) {
        return 1;
      }
      return a.localeCompare(b);
    });

    const updatedItem: IDataObject = {};
    for (const key of updatedKeysOrder) {
      updatedItem[key] = item.json[key];
    }

    return { ...item, json: updatedItem };
  });
}

/**
 * Process JSON input, parsing string if necessary.
 *
 * @param jsonData The JSON data (string or object)
 * @param inputName The name of the input for error messages
 */
export function processJsonInput<T>(jsonData: T, inputName?: string): T {
  const input = inputName ? `'${inputName}' ` : '';

  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData) as T;
    } catch {
      throw new Error(`Input ${input}must contain valid JSON`);
    }
  } else if (typeof jsonData === 'object') {
    return jsonData;
  } else {
    throw new Error(`Input ${input}must contain valid JSON`);
  }
}

/**
 * Update display options for node properties.
 *
 * @param displayOptions The display options to merge
 * @param properties The properties to update
 */
export function updateDisplayOptions<T extends { displayOptions?: unknown }>(
  displayOptions: unknown,
  properties: T[],
): T[] {
  return properties.map((nodeProperty) => ({
    ...nodeProperty,
    displayOptions: {
      ...(nodeProperty.displayOptions as object),
      ...(displayOptions as object),
    },
  }));
}

/**
 * Create a fuzzy comparison function.
 *
 * @param useFuzzyCompare Whether to use fuzzy comparison
 * @param compareVersion The comparison version (1 or 2)
 */
export function fuzzyCompare(useFuzzyCompare: boolean, compareVersion = 1) {
  if (!useFuzzyCompare) {
    // Strict comparison
    return <T, U>(item1: T, item2: U): boolean => {
      return JSON.stringify(item1) === JSON.stringify(item2);
    };
  }

  return <T, U>(item1: T, item2: U): boolean => {
    // Both types are the same, do strict comparison
    if (
      item1 !== null &&
      item2 !== null &&
      typeof item1 === typeof item2
    ) {
      return JSON.stringify(item1) === JSON.stringify(item2);
    }

    // Handle null comparisons in version 2
    if (compareVersion >= 2) {
      if (
        item1 === null &&
        (item2 === null || item2 === 0 || item2 === '0')
      ) {
        return true;
      }
      if (
        item2 === null &&
        (item1 === null || item1 === 0 || item1 === '0')
      ) {
        return true;
      }
    }

    // Null, empty strings, empty arrays treated as matching
    if (isFalsyValue(item1) && isFalsyValue(item2)) return true;

    // Missing field and falsy value matching
    if (isFalsyValue(item1) && item2 === undefined) return true;
    if (item1 === undefined && isFalsyValue(item2)) return true;

    // Compare numbers and strings representing that number
    if (typeof item1 === 'number' && typeof item2 === 'string') {
      return item1.toString() === item2;
    }
    if (typeof item1 === 'string' && typeof item2 === 'number') {
      return item1 === item2.toString();
    }

    // Compare booleans and strings
    if (typeof item1 === 'boolean' && typeof item2 === 'string') {
      if (item1 === true && item2.toLowerCase() === 'true') return true;
      if (item1 === false && item2.toLowerCase() === 'false') return true;
    }
    if (typeof item2 === 'boolean' && typeof item1 === 'string') {
      if (item2 === true && item1.toLowerCase() === 'true') return true;
      if (item2 === false && item1.toLowerCase() === 'false') return true;
    }

    // Compare booleans and numbers
    if (typeof item1 === 'boolean' && typeof item2 === 'number') {
      if (item1 === true && item2 === 1) return true;
      if (item1 === false && item2 === 0) return true;
    }
    if (typeof item2 === 'boolean' && typeof item1 === 'number') {
      if (item2 === true && item1 === 1) return true;
      if (item2 === false && item1 === 0) return true;
    }

    return JSON.stringify(item1) === JSON.stringify(item2);
  };
}

/**
 * Check if a value is falsy for comparison purposes.
 */
function isFalsyValue<T>(value: T): boolean {
  if (value === null) return true;
  if (typeof value === 'string' && value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Add execution hints for better user experience.
 *
 * @param context The execution context
 * @param hints The hints to add
 */
export function addExecutionHints(
  context: { addExecutionHints: (hint: ExecutionHint) => void },
  hints: ExecutionHint,
): void {
  context.addExecutionHints(hints);
}

/**
 * Execution hint interface.
 */
export interface ExecutionHint {
  message: string;
  location: 'outputPane' | 'inputPane';
}

/**
 * Extract error message from various error types.
 *
 * @param error The error to extract the message from
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * Create a deferred promise.
 */
export function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
