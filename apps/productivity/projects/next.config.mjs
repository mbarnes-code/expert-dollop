/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/productivity-feature',
    '@expert-dollop/productivity-data-access'
  ],
};

export default nextConfig;
