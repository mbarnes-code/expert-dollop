import type { ICredentialDataDecryptedObject, IDataObject } from '@expert-dollop/n8n-types';

/**
 * Abstract base class for credential services.
 * Provides common functionality for managing credentials across different modules.
 * 
 * Following DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractCredentialService {
  /**
   * Get credentials by type and ID
   */
  abstract get(type: string, id: string): Promise<ICredentialDataDecryptedObject | null>;

  /**
   * Decrypt credentials
   */
  abstract decrypt(encryptedData: string): Promise<ICredentialDataDecryptedObject>;

  /**
   * Encrypt credentials
   */
  abstract encrypt(data: ICredentialDataDecryptedObject): Promise<string>;

  /**
   * Verify credentials are valid
   */
  abstract verify(type: string, credentials: ICredentialDataDecryptedObject): Promise<boolean>;

  /**
   * Get the parent types for a credential type
   */
  abstract getParentTypes(credentialType: string): string[];

  /**
   * Get credential properties for a type
   */
  abstract getProperties(credentialType: string): ICredentialProperty[];
}

/**
 * Credential property definition
 */
export interface ICredentialProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'hidden';
  required?: boolean;
  default?: string | number | boolean;
  options?: Array<{ name: string; value: string | number }>;
  description?: string;
}

/**
 * Abstract base class for credential encryption services
 */
export abstract class AbstractEncryptionService {
  /**
   * Encrypt data using the encryption key
   */
  abstract encrypt(data: string): Promise<string>;

  /**
   * Decrypt data using the encryption key
   */
  abstract decrypt(encryptedData: string): Promise<string>;

  /**
   * Hash a value
   */
  abstract hash(value: string): string;

  /**
   * Verify a value against a hash
   */
  abstract verifyHash(value: string, hash: string): boolean;
}
