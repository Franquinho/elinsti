/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // ← Comentado para permitir API Routes
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
  basePath: '',
}

export default nextConfig
