/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PORT: 8080,
    IMBUE_NETWORK_WEBSOCK_ADDR: "wss://rococo.imbue.network",
    RELAY_CHAIN_WEBSOCK_ADDR: "wss://rococo-rpc.polkadot.io",
    // DB_HOST: "localhost",
    // DB_PORT: Number(process.env.DB_PORT) || 5432,
    // DB_NAME: "imbue",
    // DB_USER: process.env.DB_USER || "postgres",
    // DB_PASSWORD: process.env.DB_PASSWORD || "Password",
    // GETSTREAM_API_KEY: "cvmy2kcxetnm",
    // GETSTREAM_SECRET_KEY:"ffs9wnxe5c8yp26hhkrz69erfun94k22z7vsz98pzsutqxf9rfg3gz6qd57q29sq",
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
