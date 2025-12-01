/**
 * Transformer for stringifying numeric IDs
 */
export const idStringifier = {
  from: (value?: number): string | undefined => value?.toString(),
  to: (value: string | unknown | undefined): number | unknown | undefined =>
    typeof value === 'string' ? Number(value) : value,
};

/**
 * Transformer for lowercasing strings
 */
export const lowerCaser = {
  from: (value: string): string => value,
  to: (value: string): string => (typeof value === 'string' ? value.toLowerCase() : value),
};

/**
 * Safely parse JSON string to object
 */
function jsonParse<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return json as unknown as T;
  }
}

/**
 * Unmarshal JSON as JS object.
 */
export const objectRetriever = {
  to: (value: object): object => value,
  from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

/**
 * Transformer for sqlite JSON columns to mimic JSON-as-object behavior
 * from Postgres and MySQL.
 */
const jsonColumn = {
  to: (value: object, dbType: string): string | object =>
    dbType === 'sqlite' ? JSON.stringify(value) : value,
  from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

export const sqlite = { jsonColumn };
