// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Output standalone để đóng gói vào Electron dễ hơn
  // Bỏ comment khi build production Electron:
  // output: 'export',
  // trailingSlash: true,

  // Tắt image optimization khi export static (cần cho Electron)
  // images: { unoptimized: true },

  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
