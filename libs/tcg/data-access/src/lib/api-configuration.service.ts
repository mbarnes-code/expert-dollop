/**
 * API configuration service for the TCG data access layer.
 * Provides API configuration for Commander Spellbook.
 */

import { GetServerSidePropsContext } from 'next';
import { Configuration, HTTPHeaders } from '@space-cow-media/spellbook-client';
import TokenService, { SpellbookTokenService } from './token.service';

/**
 * Configuration options for the Spellbook API.
 */
export interface SpellbookApiConfigOptions {
  basePath?: string;
}

/**
 * Abstract base class for API configuration services.
 */
export abstract class BaseApiConfigurationService {
  /**
   * Get the API configuration.
   * @param serverContext - Optional server context
   */
  abstract getConfiguration(serverContext?: GetServerSidePropsContext): Configuration;
}

/**
 * Spellbook API configuration service implementation.
 */
export class SpellbookApiConfigurationService extends BaseApiConfigurationService {
  private static instance: SpellbookApiConfigurationService | null = null;
  private basePath: string;

  private constructor(options?: SpellbookApiConfigOptions) {
    super();
    this.basePath = options?.basePath || process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL || '';
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(options?: SpellbookApiConfigOptions): SpellbookApiConfigurationService {
    if (!SpellbookApiConfigurationService.instance) {
      SpellbookApiConfigurationService.instance = new SpellbookApiConfigurationService(options);
    }
    return SpellbookApiConfigurationService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    SpellbookApiConfigurationService.instance = null;
  }

  /**
   * Get the API configuration.
   * @param serverContext - Optional server context
   */
  getConfiguration(serverContext?: GetServerSidePropsContext): Configuration {
    const headers: HTTPHeaders = {};

    if (serverContext && serverContext.req.headers['x-forwarded-for']) {
      if (typeof serverContext.req.headers['x-forwarded-for'] === 'string') {
        headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'];
      }
      headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'][0];
    }

    return new Configuration({
      basePath: this.basePath,
      accessToken: function (_name?: string, _scopes?: string[]) {
        if (serverContext) {
          return TokenService.getTokenFromServerContext(serverContext);
        }
        return TokenService.getToken();
      },
      headers: headers,
    });
  }
}

// Initialize the token service with the API configuration factory
SpellbookTokenService.getInstance().setApiConfigurationFactory((serverContext) =>
  SpellbookApiConfigurationService.getInstance().getConfiguration(serverContext),
);

/**
 * Legacy function export for backward compatibility.
 * @param serverContext - Optional server context
 */
export function apiConfiguration(serverContext?: GetServerSidePropsContext): Configuration {
  return SpellbookApiConfigurationService.getInstance().getConfiguration(serverContext);
}
