/**
 * Date utility functions for the modular monolith.
 * Provides common date-related operations.
 */

/**
 * Check if today is April Fool's Day.
 * The result is cached at module load time for consistency.
 * @returns True if today is April 1st
 */
const isAprilsFoolsDayToday = (): boolean => {
  const today = new Date();
  return today.getMonth() === 3 && today.getDate() === 1;
};

const TODAY_IS_APRILS_FOOLS_DAY = isAprilsFoolsDayToday();

/**
 * Check if today is April Fool's Day (cached result).
 * @returns True if today is April 1st
 */
export function isFoolsDay(): boolean {
  return TODAY_IS_APRILS_FOOLS_DAY;
}
