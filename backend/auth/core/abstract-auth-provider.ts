import {
  IAuthProvider,
  AuthProviderConfig,
  AuthResult,
  AuthUser,
} from './auth-provider.interface';

/**
 * Abstract base class for authentication providers
 * 
 * Provides common functionality and enforces the provider contract.
 * Follows DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractAuthProvider implements IAuthProvider {
  protected config: AuthProviderConfig;

  abstract readonly name: string;

  constructor(config: AuthProviderConfig) {
    this.config = config;
  }

  /**
   * Initialize the authentication provider
   * Override in subclasses to perform provider-specific initialization
   */
  async init(): Promise<void> {
    // Base implementation - can be overridden
  }

  /**
   * Check if the provider is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get the current configuration (redacted for security)
   */
  getConfig(): AuthProviderConfig {
    return {
      enabled: this.config.enabled,
      loginLabel: this.config.loginLabel,
    };
  }

  /**
   * Update the provider configuration
   */
  async updateConfig(config: Partial<AuthProviderConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
  }

  /**
   * Authenticate a user with provider-specific credentials
   * Must be implemented by subclasses
   */
  abstract authenticate(credentials: Record<string, unknown>): Promise<AuthResult>;

  /**
   * Create a standardized successful authentication result
   */
  protected createSuccessResult(user: AuthUser, token?: string): AuthResult {
    return {
      success: true,
      user,
      token,
    };
  }

  /**
   * Create a standardized failed authentication result
   */
  protected createFailureResult(error: string): AuthResult {
    return {
      success: false,
      error,
    };
  }

  /**
   * Create a result indicating MFA is required
   */
  protected createMfaRequiredResult(user: AuthUser): AuthResult {
    return {
      success: false,
      user,
      requiresMfa: true,
    };
  }
}
