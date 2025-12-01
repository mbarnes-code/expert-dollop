import { IAuthProvider, AuthResult } from './auth-provider.interface';

/**
 * Authentication Service Manager
 * 
 * Manages multiple authentication providers and routes authentication
 * requests to the appropriate provider. Follows DDD modular monolith
 * best practices.
 */
export class AuthService {
  private providers: Map<string, IAuthProvider> = new Map();
  private defaultProvider: string = 'email';

  /**
   * Register an authentication provider
   */
  registerProvider(provider: IAuthProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Unregister an authentication provider
   */
  unregisterProvider(name: string): void {
    this.providers.delete(name);
  }

  /**
   * Get a registered provider by name
   */
  getProvider(name: string): IAuthProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IAuthProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all enabled providers
   */
  getEnabledProviders(): IAuthProvider[] {
    return this.getAllProviders().filter(provider => provider.isEnabled());
  }

  /**
   * Set the default authentication provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get the current authentication method
   */
  getCurrentAuthMethod(): string {
    return this.defaultProvider;
  }

  /**
   * Check if a specific authentication method is currently active
   */
  isAuthMethodActive(method: string): boolean {
    const provider = this.providers.get(method);
    return provider?.isEnabled() ?? false;
  }

  /**
   * Initialize all registered providers
   */
  async initializeProviders(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.init();
    }
  }

  /**
   * Authenticate using the specified provider or default
   */
  async authenticate(
    credentials: Record<string, unknown>,
    providerName?: string
  ): Promise<AuthResult> {
    const targetProvider = providerName || this.defaultProvider;
    const provider = this.providers.get(targetProvider);

    if (!provider) {
      return {
        success: false,
        error: `Authentication provider '${targetProvider}' not found`,
      };
    }

    if (!provider.isEnabled()) {
      return {
        success: false,
        error: `Authentication provider '${targetProvider}' is not enabled`,
      };
    }

    return provider.authenticate(credentials);
  }
}

/**
 * Singleton instance of the auth service
 */
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}
