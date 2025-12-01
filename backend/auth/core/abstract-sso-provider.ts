import { ISsoProvider, AuthProviderConfig, AuthResult, AuthUser } from './auth-provider.interface';
import { AbstractAuthProvider } from './abstract-auth-provider';

/**
 * Abstract base class for SSO authentication providers (SAML, OIDC)
 * 
 * Extends AbstractAuthProvider with SSO-specific functionality.
 * Follows DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractSsoProvider extends AbstractAuthProvider implements ISsoProvider {
  /**
   * Generate login URL for SSO flow
   * Must be implemented by subclasses
   */
  abstract generateLoginUrl(): Promise<{ url: string | URL; state?: string; nonce?: string }>;

  /**
   * Handle callback from identity provider
   * Must be implemented by subclasses
   */
  abstract handleCallback(params: Record<string, unknown>): Promise<AuthResult>;

  /**
   * Get callback URL for this provider
   * Must be implemented by subclasses
   */
  abstract getCallbackUrl(): string;

  /**
   * Authenticate via SSO - delegates to handleCallback
   * SSO providers authenticate through the callback flow
   */
  async authenticate(credentials: Record<string, unknown>): Promise<AuthResult> {
    return this.handleCallback(credentials);
  }

  /**
   * Validate state parameter to prevent CSRF attacks
   */
  protected validateState(providedState: string, expectedState: string): boolean {
    return providedState === expectedState;
  }

  /**
   * Validate nonce parameter to prevent replay attacks
   */
  protected validateNonce(providedNonce: string, expectedNonce: string): boolean {
    return providedNonce === expectedNonce;
  }
}
