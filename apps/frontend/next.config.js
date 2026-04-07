/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // 🔥 FORCE disable turbopack
  },
};

module.exports = nextConfig;