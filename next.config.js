/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: 'output: export' désactivé pour permettre l'utilisation du middleware
  // Réactivez pour un export statique si nécessaire (mais le middleware ne fonctionnera pas)
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
};

module.exports = nextConfig;
