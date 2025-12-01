/**
 * String utility functions for the modular monolith.
 * These utilities provide common string manipulation operations.
 */

/**
 * Add a period to the end of a string if it doesn't already have one.
 * @param str - The input string
 * @returns The string with a period at the end
 */
export function addPeriod(str: string): string {
  let output = str.trim();
  if (output[output.length - 1] !== '.') {
    output += '.';
  }
  return output;
}

/**
 * Normalize a string input by converting to lowercase and removing special characters.
 * Useful for fuzzy matching and search operations.
 * @param str - The input string
 * @returns The normalized string
 */
export function normalizeStringInput(str: string): string {
  return str
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-zA-Z 0-9{}]+/g, '')
    .trim();
}
