/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'media.istockphoto.com',
        },
        {
          protocol: 'https',
          hostname: 'natrajhotels.obsidiansix.com',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
        },
      ],
    }
  }

  module.exports = nextConfig
  