/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  // This ensures browser-only APIs don't cause build errors
  experimental: {
    appDir: true,
  },
  // Add proper Vercel configuration
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
  // Ensure proper transpilation
  transpilePackages: [],
}

module.exports = nextConfig
