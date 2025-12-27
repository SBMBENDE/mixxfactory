/** @type {import('next').NextConfig} */
// Force rebuild - fix categories API cache issue (2025-12-07 11:11 GMT)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
