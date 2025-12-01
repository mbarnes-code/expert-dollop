/**
 * @fileoverview Core errors
 * @module @expert-dollop/n8n-core/errors
 */

import { CoreError } from './abstract/core-error';

/**
 * Binary data file not found error
 */
export class BinaryDataFileNotFoundError extends CoreError {
  readonly binaryDataId: string;
  
  constructor(binaryDataId: string) {
    super(`Binary data file not found: ${binaryDataId}`);
    this.binaryDataId = binaryDataId;
  }
}

/**
 * Disallowed file path error
 */
export class DisallowedFilePathError extends CoreError {
  readonly filePath: string;
  
  constructor(filePath: string) {
    super(`File path is not allowed: ${filePath}`);
    this.filePath = filePath;
  }
}

/**
 * File not found error
 */
export class FileNotFoundError extends CoreError {
  readonly filePath: string;
  
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.filePath = filePath;
  }
}

/**
 * File too large error
 */
export class FileTooLargeError extends CoreError {
  readonly fileSize: number;
  readonly maxSize: number;
  
  constructor(fileSize: number, maxSize: number) {
    super(`File size ${fileSize} exceeds maximum ${maxSize} bytes`);
    this.fileSize = fileSize;
    this.maxSize = maxSize;
  }
}

/**
 * Invalid execution metadata error
 */
export class InvalidExecutionMetadataError extends CoreError {
  readonly key: string;
  
  constructor(key: string, message?: string) {
    super(message ?? `Invalid execution metadata for key: ${key}`);
    this.key = key;
  }
}

/**
 * Invalid manager error
 */
export class InvalidManagerError extends CoreError {
  readonly managerType: string;
  
  constructor(managerType: string) {
    super(`Invalid manager: ${managerType}`);
    this.managerType = managerType;
  }
}

/**
 * Invalid source type error
 */
export class InvalidSourceTypeError extends CoreError {
  readonly sourceType: string;
  
  constructor(sourceType: string) {
    super(`Invalid source type: ${sourceType}`);
    this.sourceType = sourceType;
  }
}

/**
 * Missing source ID error
 */
export class MissingSourceIdError extends CoreError {
  constructor() {
    super('Source ID is missing');
  }
}

/**
 * Unrecognized credential type error
 */
export class UnrecognizedCredentialTypeError extends CoreError {
  readonly credentialType: string;
  
  constructor(credentialType: string) {
    super(`Unrecognized credential type: ${credentialType}`);
    this.credentialType = credentialType;
  }
}

/**
 * Unrecognized node type error
 */
export class UnrecognizedNodeTypeError extends CoreError {
  readonly nodeType: string;
  
  constructor(nodeType: string) {
    super(`Unrecognized node type: ${nodeType}`);
    this.nodeType = nodeType;
  }
}

/**
 * Workflow has issues error
 */
export class WorkflowHasIssuesError extends CoreError {
  readonly workflowId?: string;
  readonly issues: Array<{ node: string; issue: string }>;
  
  constructor(issues: Array<{ node: string; issue: string }>, workflowId?: string) {
    super(`Workflow has ${issues.length} issue(s)`);
    this.workflowId = workflowId;
    this.issues = issues;
  }
}

/**
 * Error reporter helper
 */
export class ErrorReporter {
  private static instance: ErrorReporter;
  
  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }
  
  /**
   * Reports an error
   */
  report(error: Error, metadata?: Record<string, unknown>): void {
    console.error('[ErrorReporter]', error.message, metadata);
  }
  
  /**
   * Reports an error with severity
   */
  reportWithSeverity(
    error: Error, 
    severity: 'error' | 'warning' | 'info',
    metadata?: Record<string, unknown>,
  ): void {
    const level = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
    console[level]('[ErrorReporter]', error.message, metadata);
  }
}
