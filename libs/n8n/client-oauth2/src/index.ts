/**
 * @expert-dollop/n8n-client-oauth2
 * 
 * OAuth2 client library for n8n modules.
 * Supports Authorization Code flow and Client Credentials flow.
 * This is a hoisted shared dependency following DDD modular monolith patterns.
 */

// Main OAuth2 client
export type { ClientOAuth2Options, ClientOAuth2RequestObject } from './client-oauth2';
export { ClientOAuth2, ResponseError } from './client-oauth2';

// Token management
export type { ClientOAuth2TokenData } from './client-oauth2-token';
export { ClientOAuth2Token } from './client-oauth2-token';

// OAuth2 flows
export { CodeFlow } from './code-flow';
export { CredentialsFlow } from './credentials-flow';

// Types
export type {
  Headers,
  OAuth2GrantType,
  OAuth2AuthenticationMethod,
  OAuth2CredentialData,
  OAuth2AccessTokenErrorResponse,
} from './types';

// Utilities
export { AuthError, auth, expects, getAuthError, getRequestOptions } from './utils';

// Constants
export { DEFAULT_URL_BASE, DEFAULT_HEADERS, ERROR_RESPONSES } from './constants';
