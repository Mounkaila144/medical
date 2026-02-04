const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration du build Capacitor...\n');

// Chemin vers next.config.js
const configPath = path.join(__dirname, '..', 'next.config.js');
const configBackupPath = path.join(__dirname, '..', 'next.config.backup.js');

// Sauvegarder la configuration actuelle
const originalConfig = fs.readFileSync(configPath, 'utf8');
fs.writeFileSync(configBackupPath, originalConfig);

// Créer une nouvelle configuration avec output: 'export'
const capacitorConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
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
  trailingSlash: true,
};

module.exports = nextConfig;
`;

// Routes dynamiques à ignorer
const dynamicRoutes = [
  'app/appointments/[id]',
  'app/patients/[id]',
  'app/[tenantSlug]',
];

console.log('📦 Renommage temporaire des routes dynamiques...\n');

// Renommer les dossiers des routes dynamiques
dynamicRoutes.forEach(route => {
  const routePath = path.join(__dirname, '..', route);
  const renamedPath = routePath + '.bak';

  if (fs.existsSync(routePath)) {
    console.log(`   Renommage: ${route}`);
    fs.renameSync(routePath, renamedPath);
  }
});

try {
  // Écrire la nouvelle configuration
  console.log('\n✏️  Mise à jour de next.config.js...\n');
  fs.writeFileSync(configPath, capacitorConfig);

  // Lancer le build
  console.log('🚀 Lancement du build Next.js...\n');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Build terminé avec succès!\n');
} catch (error) {
  console.error('\n❌ Erreur lors du build:', error.message);
  process.exitCode = 1;
} finally {
  // Restaurer la configuration
  console.log('🔄 Restauration de la configuration...\n');
  fs.writeFileSync(configPath, originalConfig);
  fs.unlinkSync(configBackupPath);

  // Restaurer les routes dynamiques
  console.log('🔄 Restauration des routes dynamiques...\n');
  dynamicRoutes.forEach(route => {
    const routePath = path.join(__dirname, '..', route);
    const renamedPath = routePath + '.bak';

    if (fs.existsSync(renamedPath)) {
      console.log(`   Restauration: ${route}`);
      fs.renameSync(renamedPath, routePath);
    }
  });

  console.log('\n✨ Processus de build Capacitor terminé!\n');
}
