import { Container } from '@expert-dollop/n8n-di';
import fs from 'fs';
import { mock } from 'jest-mock-extended';

import { GlobalConfig } from '../src/index';

jest.mock('fs');
const mockFs = mock<typeof fs>();
fs.readFileSync = mockFs.readFileSync;

const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('GlobalConfig', () => {
  beforeEach(() => {
    Container.reset();
    jest.clearAllMocks();
  });

  const originalEnv = process.env;
  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use all default values when no env variables are defined', () => {
    process.env = {};
    const config = Container.get(GlobalConfig);
    
    expect(config.path).toBe('/');
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5678);
    expect(config.listen_address).toBe('::');
    expect(config.protocol).toBe('http');
    expect(config.defaultLocale).toBe('en');
    expect(config.hideUsagePage).toBe(false);
    
    expect(config.database.type).toBe('sqlite');
    expect(config.database.tablePrefix).toBe('');
    expect(config.database.sqlite.database).toBe('database.sqlite');
    
    expect(config.logging.level).toBe('info');
    expect(config.logging.format).toBe('text');
    
    expect(config.security.blockFileAccessToN8nFiles).toBe(true);
    
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });

  it('should use values from env variables when defined', () => {
    process.env = {
      DB_POSTGRESDB_HOST: 'some-host',
      DB_POSTGRESDB_USER: 'n8n',
      DB_POSTGRESDB_IDLE_CONNECTION_TIMEOUT: '10000',
      DB_TABLE_PREFIX: 'test_',
      DB_PING_INTERVAL_SECONDS: '2',
      N8N_PORT: '3000',
      N8N_HOST: 'my-host',
    };
    const config = Container.get(GlobalConfig);
    
    expect(config.port).toBe(3000);
    expect(config.host).toBe('my-host');
    expect(config.database.postgresdb.host).toBe('some-host');
    expect(config.database.postgresdb.user).toBe('n8n');
    expect(config.database.postgresdb.idleTimeoutMs).toBe(10000);
    expect(config.database.tablePrefix).toBe('test_');
    expect(config.database.pingIntervalSeconds).toBe(2);
    
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });

  it('should read values from files using _FILE env variables', () => {
    const passwordFile = '/path/to/postgres/password';
    process.env = {
      DB_POSTGRESDB_PASSWORD_FILE: passwordFile,
    };
    mockFs.readFileSync.calledWith(passwordFile, 'utf8').mockReturnValueOnce('password-from-file');

    const config = Container.get(GlobalConfig);
    
    expect(config.database.postgresdb.password).toBe('password-from-file');
    expect(mockFs.readFileSync).toHaveBeenCalled();
  });

  it('should handle invalid numbers', () => {
    process.env = {
      DB_LOGGING_MAX_EXECUTION_TIME: 'abcd',
    };
    const config = Container.get(GlobalConfig);
    expect(config.database.logging.maxQueryExecutionTime).toEqual(0);
    expect(consoleWarnMock).toHaveBeenCalledWith(
      'Invalid number value for DB_LOGGING_MAX_EXECUTION_TIME: abcd',
    );
  });

  describe('string unions', () => {
    it('on invalid value, should warn and fall back to default value', () => {
      process.env = {
        N8N_RUNNERS_MODE: 'non-existing-mode',
        N8N_RUNNERS_ENABLED: 'true',
        DB_TYPE: 'postgresdb',
      };

      const globalConfig = Container.get(GlobalConfig);
      expect(globalConfig.taskRunners.mode).toEqual('internal');
      expect(consoleWarnMock).toHaveBeenCalledWith(
        expect.stringContaining(
          "Invalid value for N8N_RUNNERS_MODE",
        ),
      );

      expect(globalConfig.taskRunners.enabled).toEqual(true);
      expect(globalConfig.database.type).toEqual('postgresdb');
    });
  });
  
  describe('database config', () => {
    it('should correctly identify legacy sqlite', () => {
      process.env = {
        DB_TYPE: 'sqlite',
        DB_SQLITE_POOL_SIZE: '0',
      };
      
      const config = Container.get(GlobalConfig);
      expect(config.database.isLegacySqlite).toBe(true);
    });
    
    it('should correctly identify non-legacy sqlite', () => {
      process.env = {
        DB_TYPE: 'sqlite',
        DB_SQLITE_POOL_SIZE: '5',
      };
      
      const config = Container.get(GlobalConfig);
      expect(config.database.isLegacySqlite).toBe(false);
    });
  });
});
