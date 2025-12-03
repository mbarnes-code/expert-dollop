/**
 * Shared Next.js configuration factory for AI services
 * This provides a consistent configuration across all AI services
 */
import type { NextConfig } from 'next';

export interface CreateNextConfigOptions {
  /**
   * Additional packages to transpile beyond the defaults
   */
  additionalTranspilePackages?: string[];
  
  /**
   * Whether to enable standalone output (default: true)
   */
  standalone?: boolean;
}

/**
 * Creates a Next.js configuration with standard settings for AI services
 */
export function createNextConfig({
  additionalTranspilePackages = [],
  standalone = true,
}: CreateNextConfigOptions = {}): NextConfig {
  return {
    ...(standalone && { output: 'standalone' }),
    transpilePackages: [
      '@expert-dollop/shared-ui',
      '@expert-dollop/shared-utils',
      '@expert-dollop/ai-feature',
      '@expert-dollop/ai-data-access',
      '@expert-dollop/ai-next-app-base',
      ...additionalTranspilePackages,
    ],
  };
}
