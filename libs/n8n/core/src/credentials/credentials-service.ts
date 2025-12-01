/**
 * @fileoverview Credentials service abstraction
 * @module @expert-dollop/n8n-core/credentials
 */

import type { IDataObject } from '@expert-dollop/n8n-workflow';
import type { ICredentialsService, IEncryptionService } from '../interfaces';

/**
 * Abstract credentials service providing a base implementation
 * for credentials management
 */
export abstract class AbstractCredentialsService implements ICredentialsService {
  protected readonly encryptionService: IEncryptionService;
  
  constructor(encryptionService: IEncryptionService) {
    this.encryptionService = encryptionService;
  }
  
  /**
   * Gets credentials by type and ID
   */
  abstract get(type: string, id: string): Promise<IDataObject | undefined>;
  
  /**
   * Decrypts credentials data
   */
  decrypt(data: string): IDataObject {
    const decrypted = this.encryptionService.decrypt(data);
    return JSON.parse(decrypted) as IDataObject;
  }
  
  /**
   * Encrypts credentials data
   */
  encrypt(data: IDataObject): string {
    const serialized = JSON.stringify(data);
    return this.encryptionService.encrypt(serialized);
  }
  
  /**
   * Validates credentials
   */
  abstract validate(type: string, data: IDataObject): Promise<boolean>;
}

/**
 * In-memory credentials service for testing
 */
export class InMemoryCredentialsService extends AbstractCredentialsService {
  private readonly storage = new Map<string, { type: string; data: IDataObject }>();
  
  async get(type: string, id: string): Promise<IDataObject | undefined> {
    const key = `${type}:${id}`;
    const stored = this.storage.get(key);
    return stored?.data;
  }
  
  async validate(type: string, data: IDataObject): Promise<boolean> {
    // Basic validation - check that required fields exist
    return Object.keys(data).length > 0;
  }
  
  /**
   * Stores credentials (for testing)
   */
  store(type: string, id: string, data: IDataObject): void {
    const key = `${type}:${id}`;
    this.storage.set(key, { type, data });
  }
}
