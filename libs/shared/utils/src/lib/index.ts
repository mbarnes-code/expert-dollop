/**
 * Shared Utils Library
 * 
 * This library provides common utility functions that can be used
 * across the modular monolith. These are domain-agnostic utilities
 * following DDD best practices.
 */

export const shared_utils_VERSION = '0.0.1';

// String utilities
export { addPeriod, normalizeStringInput } from './string-utils';

// URL utilities
export { isValidHttpUrl } from './url-utils';

// Query utilities
export { queryParameterAsString } from './query-utils';

// Date utilities
export { isFoolsDay } from './date-utils';

// Analytics utilities
export {
  GA_TRACKING_ID,
  pageview,
  event,
  GoogleAnalyticsService,
  BaseAnalyticsService,
  type AnalyticsConfig,
  type AnalyticsEventProps,
} from './analytics';

// Theme utilities
export {
  LIGHT_THEME,
  DARK_THEME,
  SYSTEM_THEME,
  THEME_COOKIE_NAME,
  applyTheme,
  DomThemeService,
  BaseThemeService,
  type Theme,
} from './theme';

// Download utilities
export {
  BrowserDownloadService,
  BaseDownloadService,
  default as DownloadFileService,
} from './download';
