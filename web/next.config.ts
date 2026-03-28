import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // En dev, proxy API calls para evitar problemas de CORS
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/:path*',
            destination: 'http://localhost:3000/api/:path*',
          },
        ]
      : [];
  },
};

export default nextConfig;
