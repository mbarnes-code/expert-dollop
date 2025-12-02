/**
 * @expert-dollop/n8n-db
 *
 * Database utilities and entity definitions for n8n modules.
 * Provides abstract base classes for entities and repositories following DDD patterns.
 */

// Entity utilities
export {
  DatabaseType,
  getJsonColumnType,
  getDatetimeColumnType,
  getBinaryColumnType,
  getTimestampSyntax,
  WithStringId,
  WithTimestamps,
  WithTimestampsAndStringId,
} from './entities';

// Entity types
export * from './entities/types-db';

// Repository utilities
export { AbstractRepository } from './repositories';

// Connection utilities
export { AbstractDbConnection, type DbConnectionOptions } from './connection';

// Utility functions
export {
  generateNanoId,
  generateHostInstanceId,
  isStringArray,
  isValidEmail,
  separate,
  sql,
  idStringifier,
  lowerCaser,
  objectRetriever,
  sqlite,
  withTransaction,
  type EntityManager,
  NoXss,
  NoUrl,
  isXssSafe,
  isUrlFree,
} from './utils';

// Constants and role utilities
export {
  builtInRoleToRoleObject,
  type Role,
  GLOBAL_OWNER_ROLE_SLUG,
  GLOBAL_ADMIN_ROLE_SLUG,
  GLOBAL_MEMBER_ROLE_SLUG,
  PROJECT_ADMIN_ROLE_SLUG,
  PROJECT_EDITOR_ROLE_SLUG,
  PROJECT_OWNER_ROLE_SLUG,
  PROJECT_VIEWER_ROLE_SLUG,
  type GlobalRole,
  type ProjectRole,
} from './constants';
