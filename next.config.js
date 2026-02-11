/** @type {import('next').NextConfig} */
// Force rebuild - fix categories API cache issue (2025-12-07 11:11 GMT)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  // Increase body size limit to 10MB for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
