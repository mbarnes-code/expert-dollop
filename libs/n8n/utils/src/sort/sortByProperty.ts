/**
 * Sort an array of objects by a property value
 * 
 * @param property - The property key to sort by
 * @param arr - The array to sort
 * @param order - Sort order: 'asc' or 'desc' (default: 'asc')
 * @returns Sorted array
 * 
 * @example
 * ```ts
 * const items = [
 *   { name: 'Zebra' },
 *   { name: 'Apple' },
 *   { name: 'Banana' }
 * ];
 * sortByProperty('name', items); // [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Zebra' }]
 * ```
 */
export const sortByProperty = <T>(
  property: keyof T,
  arr: T[],
  order: 'asc' | 'desc' = 'asc',
): T[] =>
  arr.sort((a, b) => {
    const result = String(a[property]).localeCompare(String(b[property]), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    return order === 'asc' ? result : -result;
  });
