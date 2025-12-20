/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/ai-feature',
    '@expert-dollop/ai-data-access'
  ],
};

export default nextConfig;
