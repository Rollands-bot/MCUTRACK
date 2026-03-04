/** @type {import('next').NextConfig} */
const nextConfig = {
  // Offline-first: disable telemetry
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          // Ignore Windows system files
          'C:/DumpStack.log.tmp',
          'C:/System Volume Information/**',
          'C:/hiberfil.sys',
          'C:/pagefile.sys',
          'C:/swapfile.sys',
          '**/*.log',
        ],
      }
    }
    return config
  },
}

module.exports = nextConfig
