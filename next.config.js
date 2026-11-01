/** @type {import('next').NextConfig} */
const nextConfig = {
  // deploy.sh compile dans .next-build puis bascule, pour ne pas casser le site en ligne
  distDir: process.env.NEXT_DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  turbopack: {},
};

module.exports = nextConfig;
