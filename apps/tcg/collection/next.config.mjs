/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/tcg-feature',
    '@expert-dollop/tcg-data-access'
  ],
};

export default nextConfig;
