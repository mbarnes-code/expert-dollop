/**
 * API key types.
 */

/** API key scope */
export type ApiKeyScope = string;

/** Unix timestamp. Seconds since epoch */
export type UnixTimestamp = number | null;

export interface ApiKey {
  id: string;
  label: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
  /** Null if API key never expires */
  expiresAt: UnixTimestamp | null;
  scopes: ApiKeyScope[];
}

export type ApiKeyWithRawValue = ApiKey & { rawApiKey: string };

export type ApiKeyAudience = 'public-api' | 'mcp-server-api';
