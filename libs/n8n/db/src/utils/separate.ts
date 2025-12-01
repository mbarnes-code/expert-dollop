/**
 * Separate an array into two arrays based on a test function
 * 
 * @param array - The array to separate
 * @param test - Function that returns true for items to include in first array
 * @returns Tuple of [passing, failing] arrays
 */
export const separate = <T>(array: T[], test: (element: T) => boolean): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((i) => (test(i) ? pass : fail).push(i));

  return [pass, fail];
};
