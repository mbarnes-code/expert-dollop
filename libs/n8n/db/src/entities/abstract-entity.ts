import { generateNanoId } from '../utils/generators';

export type DatabaseType = 'sqlite' | 'postgresdb' | 'mysqldb' | 'mariadb';

/**
 * Get JSON column type based on database type
 */
export function getJsonColumnType(dbType: DatabaseType): 'simple-json' | 'json' {
  return dbType === 'sqlite' ? 'simple-json' : 'json';
}

/**
 * Get datetime column type based on database type
 */
export function getDatetimeColumnType(dbType: DatabaseType): 'timestamptz' | 'datetime' {
  return dbType === 'postgresdb' ? 'timestamptz' : 'datetime';
}

/**
 * Get binary column type based on database type
 */
export function getBinaryColumnType(dbType: DatabaseType): 'blob' | 'bytea' | 'longblob' {
  const binaryColumnTypeMap = {
    sqlite: 'blob',
    postgresdb: 'bytea',
    mysqldb: 'longblob',
    mariadb: 'longblob',
  } as const;
  return binaryColumnTypeMap[dbType];
}

/**
 * Get timestamp syntax based on database type
 */
export function getTimestampSyntax(dbType: DatabaseType): string {
  const timestampSyntax = {
    sqlite: "STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')",
    postgresdb: 'CURRENT_TIMESTAMP(3)',
    mysqldb: 'CURRENT_TIMESTAMP(3)',
    mariadb: 'CURRENT_TIMESTAMP(3)',
  };
  return timestampSyntax[dbType];
}

/**
 * Abstract base for entities with string ID
 */
export abstract class WithStringId {
  id: string;

  generateId() {
    if (!this.id) {
      this.id = generateNanoId();
    }
  }
}

/**
 * Abstract base for entities with timestamps
 */
export abstract class WithTimestamps {
  createdAt: Date;
  updatedAt: Date;

  setUpdateDate(): void {
    this.updatedAt = new Date();
  }
}

/**
 * Abstract base for entities with both string ID and timestamps
 */
export abstract class WithTimestampsAndStringId extends WithTimestamps {
  id: string;

  generateId() {
    if (!this.id) {
      this.id = generateNanoId();
    }
  }
}
