import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/chat",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match any request starting with /api/
        destination: 'http://localhost:3030/api/:path*', // Proxy it to the backend server on port 3030
      },
    ];
  },
};

export default nextConfig;
