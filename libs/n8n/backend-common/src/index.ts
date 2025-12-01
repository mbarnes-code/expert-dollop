/**
 * @expert-dollop/n8n-backend-common
 * 
 * Common backend utilities for n8n modules.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Logging
export {
  Logger,
  getLogger,
  type LogLevel,
  type LogMetadata,
  type LoggerConfig,
  type ILogger,
} from './logging';

// Environment
export {
  inDevelopment,
  inProduction,
  inTest,
  getEnvironment,
  getEnvVar,
  getEnvVarNumber,
  getEnvVarBoolean,
} from './environment';

// License state
export {
  LicenseState,
  getLicenseState,
  type ILicenseState,
} from './license-state';

// Utilities
export {
  isContainedWithin,
  safeJoinPath,
  isObjectLiteral,
  deepMerge,
  pick,
  omit,
} from './utils';
