import { IDirectoryProvider, AuthProviderConfig, AuthResult, AuthUser } from './auth-provider.interface';
import { AbstractAuthProvider } from './abstract-auth-provider';

/**
 * Abstract base class for directory-based authentication providers (LDAP)
 * 
 * Extends AbstractAuthProvider with directory-specific functionality.
 * Follows DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractDirectoryProvider extends AbstractAuthProvider implements IDirectoryProvider {
  /**
   * Search for users in the directory
   * Must be implemented by subclasses
   */
  abstract searchUsers(filter: string): Promise<AuthUser[]>;

  /**
   * Synchronize users from directory to local database
   * Must be implemented by subclasses
   */
  abstract syncUsers(): Promise<{ created: number; updated: number; disabled: number }>;

  /**
   * Test connection to the directory server
   * Must be implemented by subclasses
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Validate user credentials against the directory
   * Must be implemented by subclasses
   */
  protected abstract validateCredentials(username: string, password: string): Promise<AuthUser | null>;

  /**
   * Authenticate a user with username/password credentials
   */
  async authenticate(credentials: Record<string, unknown>): Promise<AuthResult> {
    const { username, password } = credentials as { username: string; password: string };

    if (!username || !password) {
      return this.createFailureResult('Username and password are required');
    }

    try {
      const user = await this.validateCredentials(username, password);
      
      if (!user) {
        return this.createFailureResult('Invalid credentials');
      }

      if (user.disabled) {
        return this.createFailureResult('User account is disabled');
      }

      return this.createSuccessResult(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return this.createFailureResult(errorMessage);
    }
  }
}
