/**
 * Abstract credential classes for n8n nodes.
 * Provides common patterns for credential management.
 */

/**
 * Credential property interface.
 */
export interface ICredentialProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'hidden';
  default?: unknown;
  description?: string;
  required?: boolean;
  typeOptions?: Record<string, unknown>;
  displayOptions?: Record<string, unknown>;
  options?: Array<{ name: string; value: string | number | boolean }>;
}

/**
 * Credential type description.
 */
export interface ICredentialTypeDescription {
  name: string;
  displayName: string;
  documentationUrl?: string;
  properties: ICredentialProperty[];
  authenticate?: ICredentialAuthenticate;
  test?: ICredentialTest;
  icon?: string;
  iconUrl?: string;
}

/**
 * Credential authentication configuration.
 */
export interface ICredentialAuthenticate {
  type: 'generic';
  properties: {
    headers?: Record<string, string>;
    qs?: Record<string, string>;
    body?: Record<string, string>;
    auth?: {
      username: string;
      password: string;
    };
  };
}

/**
 * Credential test configuration.
 */
export interface ICredentialTest {
  request: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

/**
 * Abstract base class for credential types.
 */
export abstract class AbstractCredentialType {
  /**
   * The credential type description.
   */
  abstract readonly description: ICredentialTypeDescription;

  /**
   * Get the credential name.
   */
  get name(): string {
    return this.description.name;
  }

  /**
   * Get the display name.
   */
  get displayName(): string {
    return this.description.displayName;
  }

  /**
   * Get the credential properties.
   */
  get properties(): ICredentialProperty[] {
    return this.description.properties;
  }
}

/**
 * Abstract class for OAuth2 credentials.
 */
export abstract class AbstractOAuth2CredentialType extends AbstractCredentialType {
  /**
   * OAuth2 specific properties.
   */
  protected readonly oauth2Properties: ICredentialProperty[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
  ];

  /**
   * Get the authorization URL.
   */
  abstract get authorizationUrl(): string;

  /**
   * Get the access token URL.
   */
  abstract get accessTokenUrl(): string;

  /**
   * Get the required scopes.
   */
  abstract get scopes(): string[];
}

/**
 * Abstract class for API key credentials.
 */
export abstract class AbstractApiKeyCredentialType extends AbstractCredentialType {
  /**
   * The API key header name (default: 'X-API-Key').
   */
  protected readonly apiKeyHeaderName: string = 'X-API-Key';

  /**
   * Whether to place the API key in query parameters instead of headers.
   */
  protected readonly apiKeyInQuery: boolean = false;

  /**
   * The query parameter name if apiKeyInQuery is true.
   */
  protected readonly apiKeyQueryParamName: string = 'api_key';

  /**
   * Standard API key property.
   */
  protected readonly apiKeyProperty: ICredentialProperty = {
    displayName: 'API Key',
    name: 'apiKey',
    type: 'string',
    default: '',
    required: true,
    typeOptions: {
      password: true,
    },
  };
}

/**
 * Abstract class for basic auth credentials.
 */
export abstract class AbstractBasicAuthCredentialType extends AbstractCredentialType {
  /**
   * Standard basic auth properties.
   */
  protected readonly basicAuthProperties: ICredentialProperty[] = [
    {
      displayName: 'Username',
      name: 'username',
      type: 'string',
      default: '',
      required: true,
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      default: '',
      required: true,
      typeOptions: {
        password: true,
      },
    },
  ];
}

/**
 * Abstract class for header-based auth credentials.
 */
export abstract class AbstractHeaderAuthCredentialType extends AbstractCredentialType {
  /**
   * The header name for authentication.
   */
  abstract readonly headerName: string;

  /**
   * The header value prefix (e.g., 'Bearer ').
   */
  abstract readonly headerValuePrefix: string;
}

/**
 * Credential data interface.
 */
export interface ICredentialData {
  [key: string]: unknown;
}

/**
 * Credential test result.
 */
export interface ICredentialTestResult {
  status: 'OK' | 'Error';
  message?: string;
}

/**
 * Helper function to create API key authentication.
 *
 * @param headerName The header name for the API key
 * @param credentialKey The key in the credentials object
 */
export function createApiKeyAuthentication(
  headerName: string,
  credentialKey = 'apiKey',
): ICredentialAuthenticate {
  return {
    type: 'generic',
    properties: {
      headers: {
        [headerName]: `={{$credentials.${credentialKey}}}`,
      },
    },
  };
}

/**
 * Helper function to create bearer token authentication.
 *
 * @param credentialKey The key in the credentials object
 */
export function createBearerAuthentication(
  credentialKey = 'accessToken',
): ICredentialAuthenticate {
  return {
    type: 'generic',
    properties: {
      headers: {
        Authorization: `=Bearer {{$credentials.${credentialKey}}}`,
      },
    },
  };
}

/**
 * Helper function to create basic authentication.
 */
export function createBasicAuthentication(): ICredentialAuthenticate {
  return {
    type: 'generic',
    properties: {
      auth: {
        username: '={{$credentials.username}}',
        password: '={{$credentials.password}}',
      },
    },
  };
}

/**
 * Helper function to create a credential test request.
 *
 * @param url The test URL
 * @param method The HTTP method
 */
export function createCredentialTestRequest(
  url: string,
  method = 'GET',
): ICredentialTest {
  return {
    request: {
      url,
      method,
    },
  };
}
