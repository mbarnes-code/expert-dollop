/**
 * Token service for the TCG data access layer.
 * Provides JWT token management for Commander Spellbook authentication.
 */

import { GetServerSidePropsContext } from 'next';
import { getCookies } from 'cookies-next';
import { TokenApi, TokenObtainPair, Configuration } from '@space-cow-media/spellbook-client';
import { CookieService } from '@expert-dollop/shared/data-access';

/**
 * Get current time in seconds since epoch.
 */
export function timeInSecondsToEpoch(): number {
  return Math.round(Date.now() / 1000);
}

/**
 * Decoded JWT payload type.
 */
export interface DecodedJWTType {
  user_id: number;
  username: string;
  email: string;
  orig_iat: string; // epoch time in seconds
  exp: number; // epoch time in seconds
  token_type?: string;
}

/**
 * API configuration factory type.
 */
export type ApiConfigurationFactory = (serverContext?: GetServerSidePropsContext) => Configuration;

/**
 * Abstract base class for token services.
 */
export abstract class BaseTokenService {
  protected apiConfigurationFactory?: ApiConfigurationFactory;

  /**
   * Set the API configuration factory.
   */
  setApiConfigurationFactory(factory: ApiConfigurationFactory): void {
    this.apiConfigurationFactory = factory;
  }

  /**
   * Decode a JWT token.
   * @param jwt - The JWT string
   */
  abstract decodeJwt(jwt?: string): DecodedJWTType | null;

  /**
   * Get the current access token.
   */
  abstract getToken(): Promise<string>;

  /**
   * Get the access token from a server context.
   * @param serverContext - The Next.js server context
   */
  abstract getTokenFromServerContext(serverContext?: GetServerSidePropsContext): Promise<string>;

  /**
   * Set the access token.
   * @param tokens - The token pair
   * @param serverContext - Optional server context
   */
  abstract setToken(tokens: TokenObtainPair, serverContext?: GetServerSidePropsContext): string;

  /**
   * Fetch a new access token using the refresh token.
   * @param providedRefreshToken - Optional refresh token
   * @param serverContext - Optional server context
   */
  abstract fetchNewToken(
    providedRefreshToken?: string,
    serverContext?: GetServerSidePropsContext,
  ): Promise<TokenObtainPair>;

  /**
   * Log out the current user.
   */
  abstract logout(): void;
}

/**
 * Token service implementation for Commander Spellbook.
 */
export class SpellbookTokenService extends BaseTokenService {
  private static instance: SpellbookTokenService | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): SpellbookTokenService {
    if (!SpellbookTokenService.instance) {
      SpellbookTokenService.instance = new SpellbookTokenService();
    }
    return SpellbookTokenService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    SpellbookTokenService.instance = null;
  }

  /**
   * Decode a JWT token.
   * @param jwt - The JWT string
   */
  decodeJwt(jwt?: string): DecodedJWTType | null {
    if (!jwt) {
      return null;
    }

    const base64Url = jwt.split('.')[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }

  /**
   * Get the current access token.
   */
  async getToken(): Promise<string> {
    const refreshToken = CookieService.get('csbRefresh') || null;
    const jwt = CookieService.get('csbJwt') || null;

    if (!jwt) {
      if (!refreshToken) {
        return '';
      } else {
        const result = await this.fetchNewToken();
        return this.setToken(result);
      }
    }

    const decodedToken = this.decodeJwt(jwt);
    const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

    if (!decodedToken) {
      const result = await this.fetchNewToken();
      return this.setToken(result);
    }

    if (decodedToken.exp > expirationCutoff) {
      CookieService.set('csbJwt', jwt, 'day');
      return jwt;
    }

    const result = await this.fetchNewToken();
    return this.setToken(result);
  }

  /**
   * Get the access token from a server context.
   * @param serverContext - The Next.js server context
   */
  async getTokenFromServerContext(serverContext?: GetServerSidePropsContext): Promise<string> {
    const cookies = await getCookies({ ...serverContext });
    const jwt = cookies?.csbJwt;
    const refreshToken = cookies?.csbRefresh;

    if (!jwt) {
      if (!refreshToken) {
        return Promise.resolve('');
      } else {
        const r = await this.fetchNewToken(refreshToken);
        return this.setToken(r, serverContext);
      }
    }

    const decodedToken = this.decodeJwt(jwt);
    const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

    if (!decodedToken) {
      const result = await this.fetchNewToken(refreshToken);
      return this.setToken(result, serverContext);
    }

    if (decodedToken.exp > expirationCutoff) {
      return jwt;
    }

    const result = await this.fetchNewToken(refreshToken);
    return this.setToken(result, serverContext);
  }

  /**
   * Set the access token.
   * @param tokens - The token pair
   * @param serverContext - Optional server context
   */
  setToken(
    { access, refresh }: TokenObtainPair,
    serverContext?: GetServerSidePropsContext,
  ): string {
    const jwt = access;

    CookieService.set('csbJwt', jwt, 'day', {
      req: serverContext?.req,
      res: serverContext?.res,
    });
    if (refresh) {
      CookieService.set('csbRefresh', refresh, 'day', {
        req: serverContext?.req,
        res: serverContext?.res,
      });
    }

    return jwt;
  }

  /**
   * Fetch a new access token using the refresh token.
   * @param providedRefreshToken - Optional refresh token
   * @param serverContext - Optional server context
   */
  async fetchNewToken(
    providedRefreshToken?: string,
    serverContext?: GetServerSidePropsContext,
  ): Promise<TokenObtainPair> {
    const refreshToken = providedRefreshToken
      ? providedRefreshToken
      : CookieService.get('csbRefresh', { req: serverContext?.req, res: serverContext?.res }) ||
        null;

    if (!refreshToken) {
      this.logout();
      return { access: '', refresh: '' };
    }

    if (!this.apiConfigurationFactory) {
      throw new Error('API configuration factory not set');
    }

    const configuration = this.apiConfigurationFactory(serverContext);
    const tokensApi = new TokenApi(configuration);

    try {
      const response = await tokensApi.tokenRefreshCreate({
        tokenRefreshRequest: {
          refresh: refreshToken,
        },
      });
      return {
        refresh: refreshToken,
        ...response,
      };
    } catch (_err) {
      this.logout();
      return { access: '', refresh: '' };
    }
  }

  /**
   * Log out the current user.
   */
  logout(): void {
    CookieService.remove('csbRefresh');
    CookieService.remove('csbJwt');
    CookieService.remove('csbUsername');
    CookieService.remove('csbUserId');
    CookieService.remove('csbIsStaff');
  }
}

// Legacy default export for backward compatibility
const TokenService = {
  getToken: () => SpellbookTokenService.getInstance().getToken(),
  getTokenFromServerContext: (serverContext?: GetServerSidePropsContext) =>
    SpellbookTokenService.getInstance().getTokenFromServerContext(serverContext),
  decodeJwt: (jwt?: string) => SpellbookTokenService.getInstance().decodeJwt(jwt),
  setToken: (tokens: TokenObtainPair, serverContext?: GetServerSidePropsContext) =>
    SpellbookTokenService.getInstance().setToken(tokens, serverContext),
  fetchNewToken: (providedRefreshToken?: string, serverContext?: GetServerSidePropsContext) =>
    SpellbookTokenService.getInstance().fetchNewToken(providedRefreshToken, serverContext),
};

export default TokenService;
