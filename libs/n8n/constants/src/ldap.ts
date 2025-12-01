/**
 * LDAP configuration constants
 */
export const LDAP_FEATURE_NAME = 'features.ldap';

export type ConnectionSecurity = 'none' | 'tls' | 'startTls';

export interface LdapConfig {
  loginEnabled: boolean;
  loginLabel: string;
  connectionUrl: string;
  allowUnauthorizedCerts: boolean;
  connectionSecurity: ConnectionSecurity;
  connectionPort: number;
  baseDn: string;
  bindingAdminDn: string;
  bindingAdminPassword: string;
  firstNameAttribute: string;
  lastNameAttribute: string;
  emailAttribute: string;
  loginIdAttribute: string;
  ldapIdAttribute: string;
  userFilter: string;
  synchronizationEnabled: boolean;
  synchronizationInterval: number; // minutes
  searchPageSize: number;
  searchTimeout: number;
  /**
   * Enforce email uniqueness in LDAP directory.
   * When enabled, blocks login if multiple LDAP accounts share the same email.
   * Prevents privilege escalation via email-based account linking.
   * 
   * @security Setting this to false allows potential account takeover attacks
   * where an attacker with a duplicate email in LDAP could gain access to
   * another user's n8n account. Keep enabled (true) in production.
   */
  enforceEmailUniqueness: boolean;
}

/**
 * Default LDAP configuration
 * @security enforceEmailUniqueness is enabled by default for security.
 * Disabling it can lead to privilege escalation vulnerabilities.
 */
export const LDAP_DEFAULT_CONFIGURATION: LdapConfig = {
  loginEnabled: false,
  loginLabel: '',
  connectionUrl: '',
  allowUnauthorizedCerts: false,
  connectionSecurity: 'none',
  connectionPort: 389,
  baseDn: '',
  bindingAdminDn: '',
  bindingAdminPassword: '',
  firstNameAttribute: '',
  lastNameAttribute: '',
  emailAttribute: '',
  loginIdAttribute: '',
  ldapIdAttribute: '',
  userFilter: '',
  synchronizationEnabled: false,
  synchronizationInterval: 60,
  searchPageSize: 0,
  searchTimeout: 60,
  enforceEmailUniqueness: true,
};
