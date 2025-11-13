import type { NextConfig } from 'next'
//@ts-expect-error no my issue
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/workflows',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
