/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/security-feature',
    '@expert-dollop/security-data-access'
  ],
};

export default nextConfig;
