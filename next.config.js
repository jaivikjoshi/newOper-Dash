/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side rendering and API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js specific modules on the client
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        util: false,
        events: false,
        process: false,
        stream: false,
        path: false,
        http: false,
        https: false,
        zlib: false,
        crypto: false,
        os: false,
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
