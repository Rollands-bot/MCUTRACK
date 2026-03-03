/** @type {import('next').NextConfig} */
const nextConfig = {
  // Offline-first: disable telemetry
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
