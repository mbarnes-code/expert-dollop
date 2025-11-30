/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/tcg-feature',
    '@expert-dollop/tcg-data-access'
  ],
  // Strangler fig pattern: proxy requests to the original commander-spellbook-site
  async rewrites() {
    return [
      // Proxy API requests to the original spellbook backend when not handled locally
      {
        source: '/api/legacy/:path*',
        destination: 'https://json.commanderspellbook.com/:path*',
      },
    ];
  },
};

export default nextConfig;
