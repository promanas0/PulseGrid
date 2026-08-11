/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
