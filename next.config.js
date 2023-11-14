/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: process.env.NODE_ENV != 'production',
  output: 'standalone',
  env: {
    PORT: 8080,
    IMBUE_NETWORK_WEBSOCK_ADDR: process.env.IMBUE_NETWORK_WEBSOCK_ADDR,
    RELAY_CHAIN_WEBSOCK_ADDR: process.env.RELAY_CHAIN_WEBSOCK_ADDR,
    GETSTREAM_API_KEY: process.env.GETSTREAM_API_KEY,
    GETSTREAM_SECRET_KEY: process.env.GETSTREAM_SECRET_KEY,
    GETSTREAM_APP_ID: process.env.GETSTREAM_APP_ID,
    CLOUD_NAME: process.env.CLOUD_NAME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    IMAGE_TAG: process.env.IMAGE_TAG,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dublin.stream-io-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        hostname: '99designs-blog.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'drupal.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.drupal.org',
      },
      {
        protocol: 'https',
        hostname: 'getstream.io',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'leadership.ng',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
};

// module.exports = withBundleAnalyzer({});

module.exports = nextConfig;
// module.exports = withBundleAnalyzer(nextConfig);
