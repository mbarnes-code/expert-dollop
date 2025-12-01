/**
 * Utility functions for the MTG Scripting Toolkit.
 * Provides common helper functions used across the toolkit.
 */

/**
 * Console color codes for logging.
 */
export enum LogColor {
  Default = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Black = '\x1b[30m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  White = '\x1b[37m',
}

/**
 * Apply a color to text for console output.
 */
export function applyColor(text: string, color: LogColor): string {
  return `${color}${text}\x1b[0m`;
}

/**
 * Log a message to the console with optional color.
 */
export function log(message = '', color = LogColor.Default): void {
  console.log(`${color}%s\x1b[0m`, message);
}

/**
 * Count words in a string.
 */
export function wordCount(text: string): number {
  return text.trim().split(/[\s-—.,]+/).length;
}

/**
 * Check if a value is a non-empty string.
 */
export function isPresentString(value: unknown): value is string {
  return typeof value === 'string' && /[^\s]+/.test(value);
}

/**
 * Escape special regex characters in a string.
 */
export function regexEscape(value: string): string {
  const specialCharacters = [
    '/',
    '.',
    '*',
    '+',
    '?',
    '|',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '\\',
  ];
  const pattern = new RegExp('(\\' + specialCharacters.join('|\\') + ')', 'g');
  return value.replace(pattern, '\\$&');
}

/**
 * Calculate the average of an array of numbers.
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return array.reduce((a, b) => a + b, 0) / array.length;
}

/**
 * Calculate the median of an array of numbers.
 */
export function median(array: number[]): number | undefined {
  if (array.length === 0) {
    return undefined;
  }

  const sorted = Array.from(array).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

/**
 * Calculate the standard deviation of an array of numbers.
 */
export function standardDeviation(array: number[]): number {
  if (array.length === 0) return 0;
  const n = array.length;
  const mean = array.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n
  );
}

/**
 * Convert an array to an object keyed by a property.
 */
export function toObjectKeyedOn<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T> {
  return array.reduce(
    (object, element) => ({
      ...object,
      [element[key] as string]: element,
    }),
    {} as Record<string, T>
  );
}

/**
 * Execute a callback for each element in an array asynchronously.
 */
export async function eachAsync<T>(
  array: T[],
  callback: (element: T, index: number) => Promise<void> | void
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index);
  }
}

/**
 * Toggle an element in an array.
 */
export function toggle<T>(array: T[], element: T, include: boolean): T[] {
  if (include) {
    return array.includes(element) ? array : [...array, element];
  } else {
    return array.filter((item) => item !== element);
  }
}

/**
 * Generate all permutations of an array.
 */
export function permutations<T>(value: T[]): T[][] {
  const result: T[][] = [];

  const permute = (array: T[], m: T[] = []) => {
    if (array.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < array.length; i++) {
        const current = array.slice();
        const next = current.splice(i, 1);
        permute(current.slice(), m.concat(next));
      }
    }
  };

  permute(value);

  return result;
}

/**
 * Split an array of objects into series for charting.
 */
export function splitSeries<T extends Record<string, number | string>>(
  values: T[],
  series: (keyof T)[] | Record<keyof T, { name: string; color?: string }>,
  independentValue: (value: T) => number
): {
  name: string;
  color?: string;
  values: [number, number | string][];
}[] {
  const seriesKeys = Array.isArray(series)
    ? series
    : (Object.keys(series) as (keyof T)[]);

  const initial = seriesKeys.map((seriesKey) => {
    const attributes = !Array.isArray(series)
      ? series[seriesKey]
      : { name: seriesKey as string };

    return {
      ...attributes,
      values: [] as [number, number | string][],
    };
  });

  return values.reduce((result, value) => {
    for (const [index, seriesKey] of seriesKeys.entries()) {
      result[index].values.push([independentValue(value), value[seriesKey]]);
    }
    return result;
  }, initial);
}
