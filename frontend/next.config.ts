import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Use standalone mode for Docker deployment
  output: 'standalone',
  // Disable Next.js automatic add/remove trailing slash behavior
  // Let us manually control URL format
  skipTrailingSlashRedirect: true,
  // Don't interrupt production build due to ESLint errors (keep lint in dev environment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow LAN IP access to dev server (eliminate CORS warnings)
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],

  async rewrites() {
    // Use server service name in Docker environment, localhost for local development
    const apiHost = process.env.API_HOST || 'localhost';
    return [
      // Only match API paths with trailing slash
      {
        source: '/api/:path*/',
        destination: `http://${apiHost}:8888/api/:path*/`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
