/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['api.scryfall.com', 'localhost'],
  },
  // Enable optimization
  swcMinify: true,
  // Production source maps
  productionBrowserSourceMaps: false,
  // Webpack configuration for optimal bundle
  webpack: (config, { isServer }) => {
    // Optimization for client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
