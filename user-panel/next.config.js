const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/icon-192x192.png',
        destination: '/icon.svg',
        permanent: true,
      },
      {
        source: '/icon-512x512.png',
        destination: '/icon.svg',
        permanent: true,
      },
    ]
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  },
}

module.exports = withPWA(nextConfig)
