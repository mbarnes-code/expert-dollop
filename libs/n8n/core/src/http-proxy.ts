/**
 * @fileoverview HTTP proxy utilities
 * @module @expert-dollop/n8n-core
 */

import type { IHttpProxyConfig } from './interfaces';

/**
 * Gets proxy configuration from environment variables
 */
export function getProxyFromEnv(): IHttpProxyConfig | undefined {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  
  const proxyUrl = httpsProxy || httpProxy;
  if (!proxyUrl) {
    return undefined;
  }
  
  try {
    const url = new URL(proxyUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol === 'https:' ? 'https' : 'http',
      auth: url.username ? {
        username: url.username,
        password: url.password,
      } : undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Checks if a hostname should bypass the proxy
 */
export function shouldBypassProxy(hostname: string): boolean {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (!noProxy) {
    return false;
  }
  
  const noProxyList = noProxy.split(',').map(s => s.trim().toLowerCase());
  const lowerHostname = hostname.toLowerCase();
  
  return noProxyList.some(pattern => {
    if (pattern === '*') {
      return true;
    }
    if (pattern.startsWith('.')) {
      return lowerHostname.endsWith(pattern) || lowerHostname === pattern.slice(1);
    }
    return lowerHostname === pattern || lowerHostname.endsWith(`.${pattern}`);
  });
}

/**
 * Creates a proxy agent configuration for axios
 */
export function createProxyConfig(config: IHttpProxyConfig): object {
  return {
    host: config.host,
    port: config.port,
    protocol: config.protocol || 'http',
    auth: config.auth ? {
      username: config.auth.username,
      password: config.auth.password,
    } : undefined,
  };
}
