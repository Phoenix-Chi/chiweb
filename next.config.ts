import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/nodes/:path*',
        destination: 'http://localhost:3001/api/nodes/:path*',
      },
      {
        source: '/api/node/:path*',
        destination: 'http://localhost:3001/api/nodes/:path*',
      },
    ];
  },
};

export default nextConfig;
