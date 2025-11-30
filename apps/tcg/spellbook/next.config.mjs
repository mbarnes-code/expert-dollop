/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/tcg-feature',
    '@expert-dollop/tcg-data-access'
  ],
  // Enable SCSS support
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'c1.scryfall.com',
      },
    ],
  },
  // Strangler fig pattern: proxy requests to the original commander-spellbook-site
  async rewrites() {
    // Use environment variable for API URL, fallback to default for development
    const spellbookApiUrl = process.env.SPELLBOOK_LEGACY_API_URL || 'https://json.commanderspellbook.com';
    return [
      // Proxy API requests to the original spellbook backend when not handled locally
      {
        source: '/api/legacy/:path*',
        destination: `${spellbookApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
