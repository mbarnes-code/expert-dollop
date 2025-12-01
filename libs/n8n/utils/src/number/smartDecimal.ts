/**
 * Smart decimal formatting that preserves meaningful precision.
 * - Returns integers as-is
 * - Returns decimals with less than `decimals` places as-is
 * - Rounds to `decimals` places otherwise
 * 
 * @param value - The number to format
 * @param decimals - Maximum number of decimal places (default: 2)
 * @returns The formatted number
 * 
 * @example
 * ```ts
 * smartDecimal(5) // 5
 * smartDecimal(5.1) // 5.1
 * smartDecimal(5.123) // 5.12
 * smartDecimal(5.12345, 3) // 5.123
 * ```
 */
export const smartDecimal = (value: number, decimals = 2): number => {
  // Check if integer
  if (Number.isInteger(value)) {
    return value;
  }

  // Check if it has only one decimal place
  if (value.toString().split('.')[1].length <= decimals) {
    return value;
  }

  return Number(value.toFixed(decimals));
};
