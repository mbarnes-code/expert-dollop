/**
 * Object utility functions for n8n nodes.
 * Common object operations used across multiple nodes.
 */

/**
 * Generic data object type.
 */
export type IDataObject = Record<string, unknown>;

/**
 * Flattens an object with deep data using dot notation for keys.
 *
 * @param obj The object to flatten
 * @param prefix The prefix to add to each key in the returned flat object
 * @example
 * flattenKeys({ a: { b: 1 } })
 * // => { 'a.b': 1 }
 */
export function flattenKeys(obj: IDataObject, prefix: string[] = []): IDataObject {
  if (!isObject(obj)) {
    return { [prefix.join('.')]: obj };
  }

  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newPrefix = [...prefix, key];

    if (isObject(value) && value !== null) {
      Object.assign(acc, flattenKeys(value as IDataObject, newPrefix));
    } else {
      acc[newPrefix.join('.')] = value;
    }

    return acc;
  }, {} as IDataObject);
}

/**
 * Flattens an object with deep data, handling Date objects.
 *
 * @param data The object to flatten
 */
export function flattenObject(data: IDataObject): IDataObject {
  const returnData: IDataObject = {};

  for (const key of Object.keys(data)) {
    if (data[key] !== null && typeof data[key] === 'object') {
      if (data[key] instanceof Date) {
        returnData[key] = data[key]?.toString();
        continue;
      }
      const flatObject = flattenObject(data[key] as IDataObject);
      for (const key2 in flatObject) {
        if (flatObject[key2] === undefined) {
          continue;
        }
        returnData[`${key}.${key2}`] = flatObject[key2];
      }
    } else {
      returnData[key] = data[key];
    }
  }

  return returnData;
}

/**
 * Check if a value is a plain object.
 *
 * @param value The value to check
 */
export function isObject(value: unknown): value is IDataObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is null or undefined.
 *
 * @param value The value to check
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is "falsy" for comparison purposes.
 * Null, empty strings, and empty arrays are considered falsy.
 *
 * @param value The value to check
 */
export function isFalsy<T>(value: T): boolean {
  if (value === null) return true;
  if (typeof value === 'string' && value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Deep merge two objects.
 *
 * @param target The target object
 * @param source The source object
 */
export function deepMerge<T extends IDataObject>(target: T, source: IDataObject): T {
  const output = { ...target } as T;

  for (const key of Object.keys(source)) {
    if (isObject(source[key]) && isObject(target[key])) {
      output[key as keyof T] = deepMerge(
        target[key] as IDataObject,
        source[key] as IDataObject,
      ) as T[keyof T];
    } else {
      output[key as keyof T] = source[key] as T[keyof T];
    }
  }

  return output;
}

/**
 * Get a nested value from an object using dot notation.
 *
 * @param obj The object to get the value from
 * @param path The path to the value (dot notation)
 * @param defaultValue The default value if the path doesn't exist
 */
export function getNestedValue<T = unknown>(
  obj: IDataObject,
  path: string,
  defaultValue?: T,
): T | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = (current as IDataObject)[key];
  }

  return current as T | undefined;
}

/**
 * Set a nested value in an object using dot notation.
 *
 * @param obj The object to set the value in
 * @param path The path to the value (dot notation)
 * @param value The value to set
 */
export function setNestedValue(
  obj: IDataObject,
  path: string,
  value: unknown,
): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as IDataObject;
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Remove undefined values from an object.
 *
 * @param obj The object to clean
 */
export function removeUndefined<T extends IDataObject>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

/**
 * Pick specific keys from an object.
 *
 * @param obj The object to pick from
 * @param keys The keys to pick
 */
export function pick<T extends IDataObject, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/**
 * Omit specific keys from an object.
 *
 * @param obj The object to omit from
 * @param keys The keys to omit
 */
export function omit<T extends IDataObject, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const keysSet = new Set(keys as unknown[]);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keysSet.has(k)),
  ) as Omit<T, K>;
}

/**
 * Compares the values of specified keys in two objects.
 *
 * @param obj1 The first object to compare
 * @param obj2 The second object to compare
 * @param keys The keys to compare
 * @param disableDotNotation Whether to use dot notation to access nested properties
 */
export function compareItems<T extends { json: IDataObject }>(
  obj1: T,
  obj2: T,
  keys: string[],
  disableDotNotation = false,
): boolean {
  for (const key of keys) {
    const val1 = disableDotNotation
      ? obj1.json[key]
      : getNestedValue(obj1.json, key);
    const val2 = disableDotNotation
      ? obj2.json[key]
      : getNestedValue(obj2.json, key);

    if (!deepEqual(val1, val2)) {
      return false;
    }
  }
  return true;
}

/**
 * Deep equality comparison.
 *
 * @param a First value
 * @param b Second value
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      deepEqual((a as IDataObject)[key], (b as IDataObject)[key]),
    );
  }

  return false;
}

/**
 * Convert object keys to lowercase.
 *
 * @param obj The object to convert
 */
export function keysToLowercase<T>(obj: T): T {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
    return obj;
  }
  return Object.fromEntries(
    Object.entries(obj as IDataObject).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  ) as T;
}
