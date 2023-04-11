/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PORT: 8080,
    IMBUE_NETWORK_WEBSOCK_ADDR: "wss://rococo.imbue.network",
    RELAY_CHAIN_WEBSOCK_ADDR: "wss://rococo-rpc.polkadot.io",
    // DB_HOST: "localhost",
    // DB_PORT: "5432",
    // DB_NAME: "imbue",
    // DB_USER: "imbue",
    // DB_PASSWORD: "imbue",
    REACT_APP_GETSTREAM_API_KEY: process.env.REACT_APP_GETSTREAM_API_KEY,
    REACT_APP_GETSTREAM_SECRET_KEY: process.env.REACT_APP_GETSTREAM_SECRET_KEY,
    GETSTREAM_API_KEY: process.env.GETSTREAM_API_KEY,
    GETSTREAM_SECRET_KEY: process.env.GETSTREAM_SECRET_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "99designs-blog.imgix.net",
      },
      {
        protocol: "https",
        hostname: "drupal.org",
      },
    ],
  },
};

module.exports = nextConfig;
