/**
 * Authentication Provider Interface
 * 
 * This interface defines the contract for all authentication providers
 * following DDD modular monolith best practices.
 * 
 * Supported Providers:
 * - LDAP (Enterprise)
 * - SAML (Enterprise)
 * - OAuth2/OIDC (Enterprise)
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  disabled?: boolean;
  mfaEnabled?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresMfa?: boolean;
  token?: string;
}

export interface AuthProviderConfig {
  enabled: boolean;
  loginLabel?: string;
}

/**
 * Abstract base interface for authentication providers
 */
export interface IAuthProvider {
  /**
   * Provider name identifier
   */
  readonly name: string;

  /**
   * Initialize the authentication provider
   */
  init(): Promise<void>;

  /**
   * Check if the provider is enabled
   */
  isEnabled(): boolean;

  /**
   * Authenticate a user with provider-specific credentials
   */
  authenticate(credentials: Record<string, unknown>): Promise<AuthResult>;

  /**
   * Get the current configuration (redacted for security)
   */
  getConfig(): AuthProviderConfig;

  /**
   * Update the provider configuration
   */
  updateConfig(config: Partial<AuthProviderConfig>): Promise<void>;
}

/**
 * Interface for SSO providers (SAML, OIDC)
 */
export interface ISsoProvider extends IAuthProvider {
  /**
   * Generate login URL for SSO flow
   */
  generateLoginUrl(): Promise<{ url: string | URL; state?: string; nonce?: string }>;

  /**
   * Handle callback from identity provider
   */
  handleCallback(params: Record<string, unknown>): Promise<AuthResult>;

  /**
   * Get callback URL for this provider
   */
  getCallbackUrl(): string;
}

/**
 * Interface for directory-based providers (LDAP)
 */
export interface IDirectoryProvider extends IAuthProvider {
  /**
   * Search for users in the directory
   */
  searchUsers(filter: string): Promise<AuthUser[]>;

  /**
   * Synchronize users from directory to local database
   */
  syncUsers(): Promise<{ created: number; updated: number; disabled: number }>;

  /**
   * Test connection to the directory server
   */
  testConnection(): Promise<boolean>;
}
