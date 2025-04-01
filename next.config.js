/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side rendering and API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  basePath: '/newOper-Dash',
  assetPrefix: '/newOper-Dash/',
  images: {
    unoptimized: true,
  },
  // Configure static page generation
  trailingSlash: true,
  // Skip API routes when exporting
  skipMiddlewareUrlNormalize: true,
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build:
      // https://github.com/vercel/next.js/issues/7755
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // Add experimental flag to allow server components
  experimental: {
    serverComponentsExternalPackages: [
      'google-spreadsheet',
      'google-auth-library',
      'googleapis'
    ]
  }
};

module.exports = nextConfig;
