/**
 * Custom types for parsing environment variables
 */

/**
 * Abstract base class for parsing delimited strings into arrays
 */
abstract class StringArray<T extends string> extends Array<T> {
  constructor(str: string, delimiter: string) {
    super();
    const parsed = str.split(delimiter) as this;
    return parsed.filter((i) => typeof i === 'string' && i.length);
  }
}

/**
 * Parse comma-separated string into array
 * 
 * @example
 * new CommaSeparatedStringArray<'a' | 'b'>('a,b') // ['a', 'b']
 */
export class CommaSeparatedStringArray<T extends string> extends StringArray<T> {
  constructor(str: string) {
    super(str, ',');
  }
}

/**
 * Parse colon-separated string into array
 * 
 * @example
 * new ColonSeparatedStringArray('a:b:c') // ['a', 'b', 'c']
 */
export class ColonSeparatedStringArray<T extends string = string> extends StringArray<T> {
  constructor(str: string) {
    super(str, ':');
  }
}

/**
 * Parse semicolon-separated string into array
 */
export class SemicolonSeparatedStringArray<T extends string = string> extends StringArray<T> {
  constructor(str: string) {
    super(str, ';');
  }
}

/**
 * Parse JSON array from environment variable
 */
export class JsonArray<T = unknown> extends Array<T> {
  constructor(str: string) {
    super();
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed as JsonArray<T>;
      }
      console.warn(`Expected JSON array, got: ${typeof parsed}`);
      return [];
    } catch (e) {
      console.warn(`Invalid JSON array: ${str}`);
      return [];
    }
  }
}
