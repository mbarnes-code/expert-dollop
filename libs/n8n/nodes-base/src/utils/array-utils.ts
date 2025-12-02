/**
 * Array utility functions for n8n nodes.
 * Common array operations used across multiple nodes.
 */

/**
 * Creates an array of elements split into groups the length of `size`.
 * If `array` can't be split evenly, the final chunk will be the remaining elements.
 *
 * @param array The array to process.
 * @param size The length of each chunk (default: 1)
 * @example
 * chunk(['a', 'b', 'c', 'd'], 2)
 * // => [['a', 'b'], ['c', 'd']]
 */
export function chunk<T>(array: T[], size = 1): T[][] {
  const length = array === null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  let index = 0;
  let resIndex = 0;
  const result = new Array<T[]>(Math.ceil(length / size));

  while (index < length) {
    result[resIndex++] = array.slice(index, (index += size));
  }
  return result;
}

/**
 * Shuffles an array in place using the Fisher-Yates shuffle algorithm.
 * @param array The array to shuffle.
 */
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Takes a multidimensional array and converts it to a one-dimensional array.
 *
 * @param nestedArray The array to be flattened.
 * @example
 * flatten([['a', 'b'], ['c', 'd']])
 * // => ['a', 'b', 'c', 'd']
 */
export function flatten<T>(nestedArray: T[][]): T[] {
  const result: T[] = [];

  const loop = (arr: T[] | T[][]): void => {
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        loop(arr[i] as T[]);
      } else {
        result.push(arr[i] as T);
      }
    }
  };

  loop(nestedArray);
  return result;
}

/**
 * Generates paired item data array.
 * Used for tracking item relationships in workflows.
 *
 * @param length The number of items
 */
export function generatePairedItemData(length: number): Array<{ item: number }> {
  return Array.from({ length }, (_, item) => ({ item }));
}

/**
 * Prepares paired item data array from various input formats.
 *
 * @param pairedItem The paired item data in various formats
 */
export function preparePairedItemDataArray(
  pairedItem: number | { item: number } | Array<{ item: number }> | undefined,
): Array<{ item: number }> {
  if (pairedItem === undefined) return [];
  if (typeof pairedItem === 'number') return [{ item: pairedItem }];
  if (Array.isArray(pairedItem)) return pairedItem;
  return [pairedItem];
}

/**
 * Removes duplicate items from an array based on a key function.
 *
 * @param array The array to deduplicate
 * @param keyFn Function to extract the key for comparison
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Groups array items by a key function.
 *
 * @param array The array to group
 * @param keyFn Function to extract the grouping key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

/**
 * Splits an array into two arrays based on a predicate.
 *
 * @param array The array to partition
 * @param predicate Function to determine which partition an item belongs to
 * @returns A tuple of [truthy items, falsy items]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }

  return [truthy, falsy];
}

/**
 * Zips multiple arrays together.
 *
 * @param arrays The arrays to zip
 * @example
 * zip([1, 2], ['a', 'b'], [true, false])
 * // => [[1, 'a', true], [2, 'b', false]]
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map((arr) => arr[i]),
  );
}

/**
 * Creates an array of numbers from start to end (exclusive).
 *
 * @param start The start value
 * @param end The end value (exclusive)
 * @param step The step increment (default: 1)
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    result.push(i);
  }
  return result;
}
