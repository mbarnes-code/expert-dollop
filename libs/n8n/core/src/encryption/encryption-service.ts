/**
 * @fileoverview Encryption service abstraction
 * @module @expert-dollop/n8n-core/encryption
 */

import type { IEncryptionService } from '../interfaces';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Algorithm for encryption
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Abstract encryption service providing a base implementation
 * for data encryption and decryption
 */
export abstract class AbstractEncryptionService implements IEncryptionService {
  protected abstract getEncryptionKey(): string;
  
  /**
   * Encrypts data using AES-256-GCM
   */
  encrypt(data: string): string {
    const key = this.deriveKey(this.getEncryptionKey());
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypts data using AES-256-GCM
   */
  decrypt(data: string): string {
    const key = this.deriveKey(this.getEncryptionKey());
    
    const [ivHex, authTagHex, encrypted] = data.split(':');
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Generates a cryptographic hash
   */
  hash(data: string, algorithm = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }
  
  /**
   * Derives a 256-bit key from the encryption key
   */
  protected deriveKey(encryptionKey: string): Buffer {
    return createHash('sha256').update(encryptionKey).digest();
  }
}

/**
 * Simple encryption service using a static key
 */
export class SimpleEncryptionService extends AbstractEncryptionService {
  private readonly key: string;
  
  constructor(encryptionKey: string) {
    super();
    this.key = encryptionKey;
  }
  
  protected getEncryptionKey(): string {
    return this.key;
  }
}
