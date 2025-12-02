/**
 * @fileoverview Binary data service abstraction
 * @module @expert-dollop/n8n-core/binary-data
 */

import type { IBinaryData } from '@expert-dollop/n8n-workflow';
import type { Readable } from 'stream';
import type { IBinaryDataService, IBinaryDataMetadata } from '../interfaces';
import { nanoid } from 'nanoid';

/**
 * Abstract binary data service providing a base implementation
 * for binary data storage and retrieval
 */
export abstract class AbstractBinaryDataService implements IBinaryDataService {
  protected readonly storageMode: string;
  
  constructor(storageMode: string = 'default') {
    this.storageMode = storageMode;
  }
  
  /**
   * Initializes the binary data service
   */
  abstract init(): Promise<void>;
  
  /**
   * Stores binary data and returns metadata
   */
  async store(
    workflowId: string,
    executionId: string,
    data: Buffer | Readable,
    metadata: IBinaryDataMetadata,
  ): Promise<IBinaryData> {
    const id = this.generateId();
    const buffer = await this.toBuffer(data);
    
    await this.writeData(id, buffer, {
      workflowId,
      executionId,
      ...metadata,
    });
    
    return {
      id,
      data: '', // Base64 data placeholder
      mimeType: metadata.mimeType ?? 'application/octet-stream',
      fileName: metadata.fileName,
      fileSize: String(buffer.length),
    };
  }
  
  /**
   * Retrieves binary data by ID
   */
  abstract get(binaryDataId: string): Promise<Buffer>;
  
  /**
   * Gets a readable stream for binary data
   */
  abstract getStream(binaryDataId: string): Promise<Readable>;
  
  /**
   * Gets the file path for binary data
   */
  abstract getPath(binaryDataId: string): string;
  
  /**
   * Deletes binary data by ID
   */
  abstract delete(binaryDataId: string): Promise<void>;
  
  /**
   * Deletes all binary data for an execution
   */
  abstract deleteExecution(executionId: string): Promise<void>;
  
  /**
   * Writes data to storage
   */
  protected abstract writeData(
    id: string,
    data: Buffer,
    metadata: IBinaryDataMetadata & { workflowId: string; executionId: string },
  ): Promise<void>;
  
  /**
   * Generates a unique ID for binary data
   */
  protected generateId(): string {
    return `binary_${nanoid(16)}`;
  }
  
  /**
   * Converts a Readable stream to Buffer
   */
  protected async toBuffer(data: Buffer | Readable): Promise<Buffer> {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    
    const chunks: Buffer[] = [];
    for await (const chunk of data) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

/**
 * In-memory binary data service for testing
 */
export class InMemoryBinaryDataService extends AbstractBinaryDataService {
  private readonly storage = new Map<string, { buffer: Buffer; metadata: any }>();
  
  constructor() {
    super('memory');
  }
  
  async init(): Promise<void> {
    // No initialization needed
  }
  
  async get(binaryDataId: string): Promise<Buffer> {
    const data = this.storage.get(binaryDataId);
    if (!data) {
      throw new Error(`Binary data not found: ${binaryDataId}`);
    }
    return data.buffer;
  }
  
  async getStream(binaryDataId: string): Promise<Readable> {
    const buffer = await this.get(binaryDataId);
    const { Readable } = await import('stream');
    return Readable.from(buffer);
  }
  
  getPath(binaryDataId: string): string {
    return `memory://${binaryDataId}`;
  }
  
  async delete(binaryDataId: string): Promise<void> {
    this.storage.delete(binaryDataId);
  }
  
  async deleteExecution(executionId: string): Promise<void> {
    for (const [id, data] of this.storage) {
      if (data.metadata.executionId === executionId) {
        this.storage.delete(id);
      }
    }
  }
  
  protected async writeData(
    id: string,
    data: Buffer,
    metadata: any,
  ): Promise<void> {
    this.storage.set(id, { buffer: data, metadata });
  }
}
