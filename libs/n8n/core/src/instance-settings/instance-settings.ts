/**
 * @fileoverview Instance settings abstraction
 * @module @expert-dollop/n8n-core/instance-settings
 */

import type { IInstanceSettings } from '../interfaces';
import { randomBytes } from 'crypto';

/**
 * Abstract instance settings class
 */
export abstract class AbstractInstanceSettings implements IInstanceSettings {
  protected readonly instanceId: string;
  protected encryptionKey: string;
  
  constructor() {
    this.instanceId = this.generateInstanceId();
    this.encryptionKey = '';
  }
  
  /**
   * Gets the instance ID
   */
  getInstanceId(): string {
    return this.instanceId;
  }
  
  /**
   * Gets the encryption key
   */
  abstract getEncryptionKey(): string;
  
  /**
   * Gets the n8n folder path
   */
  abstract getN8nFolder(): string;
  
  /**
   * Gets the custom extensions path
   */
  abstract getCustomExtensionsPath(): string;
  
  /**
   * Gets whether this instance is a leader
   */
  abstract isLeader(): boolean;
  
  /**
   * Gets whether this instance is a follower
   */
  abstract isFollower(): boolean;
  
  /**
   * Generates a unique instance ID
   */
  protected generateInstanceId(): string {
    return randomBytes(16).toString('hex');
  }
}

/**
 * Simple instance settings for development/testing
 */
export class SimpleInstanceSettings extends AbstractInstanceSettings {
  private readonly n8nFolder: string;
  private readonly customExtensionsPath: string;
  private readonly leader: boolean;
  
  constructor(options?: {
    encryptionKey?: string;
    n8nFolder?: string;
    customExtensionsPath?: string;
    isLeader?: boolean;
  }) {
    super();
    this.encryptionKey = options?.encryptionKey ?? randomBytes(32).toString('hex');
    this.n8nFolder = options?.n8nFolder ?? '/tmp/n8n';
    this.customExtensionsPath = options?.customExtensionsPath ?? '/tmp/n8n/custom';
    this.leader = options?.isLeader ?? true;
  }
  
  getEncryptionKey(): string {
    return this.encryptionKey;
  }
  
  getN8nFolder(): string {
    return this.n8nFolder;
  }
  
  getCustomExtensionsPath(): string {
    return this.customExtensionsPath;
  }
  
  isLeader(): boolean {
    return this.leader;
  }
  
  isFollower(): boolean {
    return !this.leader;
  }
}
