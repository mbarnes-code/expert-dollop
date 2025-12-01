import type { OpenAICompatibleCredential } from '../types';

/**
 * Abstract base class for LangChain credential providers
 * Provides common functionality for managing API credentials
 */
export abstract class AbstractCredentialProvider {
  /**
   * Gets the provider name
   */
  abstract getProviderName(): string;

  /**
   * Gets the credential type identifier
   */
  abstract getCredentialType(): string;

  /**
   * Validates the credential
   * @param credential - Credential data to validate
   * @returns True if valid, false otherwise
   */
  abstract validate(credential: Record<string, unknown>): Promise<boolean>;

  /**
   * Gets the required credential fields
   * @returns Array of required field names
   */
  abstract getRequiredFields(): string[];

  /**
   * Gets optional credential fields
   * @returns Array of optional field names
   */
  abstract getOptionalFields(): string[];
}

/**
 * OpenAI-compatible credential provider
 * For providers that use OpenAI-compatible APIs
 */
export abstract class AbstractOpenAICompatibleCredentialProvider extends AbstractCredentialProvider {
  /**
   * Gets the credential as OpenAI-compatible format
   * @param credential - Raw credential data
   * @returns OpenAI-compatible credential
   */
  abstract getOpenAICompatibleCredential(
    credential: Record<string, unknown>
  ): OpenAICompatibleCredential;

  /**
   * Gets the default base URL for this provider
   * @returns Default base URL
   */
  abstract getDefaultBaseUrl(): string;
}

/**
 * API Key credential interface
 */
export interface ApiKeyCredential {
  apiKey: string;
}

/**
 * OAuth credential interface
 */
export interface OAuthCredential {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Basic auth credential interface
 */
export interface BasicAuthCredential {
  username: string;
  password: string;
}

/**
 * AWS credential interface
 */
export interface AwsCredential {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}

/**
 * Azure credential interface
 */
export interface AzureCredential {
  tenantId: string;
  clientId: string;
  clientSecret?: string;
  apiKey?: string;
  resourceName?: string;
  deploymentName?: string;
}

/**
 * Google Cloud credential interface
 */
export interface GoogleCloudCredential {
  projectId: string;
  serviceAccountKey?: string;
  region?: string;
}

/**
 * Vector store connection credential interface
 */
export interface VectorStoreCredential {
  host: string;
  port?: number;
  apiKey?: string;
  username?: string;
  password?: string;
  database?: string;
  collection?: string;
}

/**
 * Memory store credential interface
 */
export interface MemoryStoreCredential {
  host: string;
  port?: number;
  password?: string;
  database?: number;
  ssl?: boolean;
}

/**
 * Validates API key format
 * @param apiKey - API key to validate
 * @returns True if valid format
 */
export function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // Most API keys are at least 20 characters
  return apiKey.trim().length >= 20;
}

/**
 * Masks a credential for safe logging
 * @param credential - Credential value to mask
 * @param visibleChars - Number of characters to show at start and end
 * @returns Masked credential string
 */
export function maskCredential(credential: string, visibleChars = 4): string {
  if (!credential || credential.length <= visibleChars * 2) {
    return '****';
  }
  const start = credential.substring(0, visibleChars);
  const end = credential.substring(credential.length - visibleChars);
  return `${start}****${end}`;
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a base URL by removing trailing slashes
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
